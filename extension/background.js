import { isDomainWhitelisted } from './safeDomains.js';
import { runLocalMLClassification } from './mlEngine.js';

const BACKEND_API = 'http://localhost:5000/api/scan/quick-check';
const DASHBOARD_URL = 'http://localhost:5173';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;


// ========================================================
// CYVORA BADGE FUNCTION
// ========================================================
// ML Safety Score:
// 75 - 100  -> TRUSTED -> GREEN TICK
// 0  - 74   -> UNTRUSTED -> RED CROSS
// ========================================================

function setCyvoraBadge(tabId, score) {
  const numericScore = Number(score);

  // --------------------------------------------------------
  // Invalid score
  // --------------------------------------------------------
  if (!Number.isFinite(numericScore)) {
    chrome.action.setBadgeText({ tabId, text: '?' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#475569' }).catch(() => {});
    return;
  }

  // --------------------------------------------------------
  // TRUSTED: SCORE >= 60 KO SAFE GREEN TICK DO
  // --------------------------------------------------------

  if (numericScore >= 60) {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '✓'
    }).catch(() => {});

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#10B981'
    }).catch(() => {});

    console.log('CYVORA STATUS: TRUSTED');
  }

  // --------------------------------------------------------
  // MODERATE: 45 SE 59 KO WARNING AMBER COLOR DO
  // --------------------------------------------------------

  else if (numericScore >= 45) {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '!'
    }).catch(() => {});

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#EAB308'
    }).catch(() => {});

    console.log('CYVORA STATUS: MODERATE_RISK');
  }

  // --------------------------------------------------------
  // CRITICAL THREAT: SIRF SCORE < 45 PAR RED CROSS AAYEGA
  // --------------------------------------------------------

  else {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '✕'
    }).catch(() => {});

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#EF4444'
    }).catch(() => {});

    console.log('CYVORA STATUS: CRITICAL_THREAT');
  }
}


// ========================================================
// BEFORE NAVIGATION
// ========================================================
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);

    if (!['http:', 'https:'].includes(url.protocol)) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '?' }).catch(() => {});
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#475569' }).catch(() => {});
      return;
    }

    const localML = runLocalMLClassification(details.url);

    // demo override for example.com
    if (url.hostname.includes('example.com')) {
      setCyvoraBadge(details.tabId, 18);
      return;
    }

    // localhost development dashboard ko pehle se hi safe rakhein
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const initialScore = (url.protocol === 'http:' && !isLocalhost) ? Math.min(localML.score, 40) : (isLocalhost ? 85 : localML.score);
    setCyvoraBadge(details.tabId, initialScore);

  } catch {
    chrome.action.setBadgeText({ tabId: details.tabId, text: '?' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#475569' }).catch(() => {});
  }
});


// ========================================================
// PAGE COMPLETED
// ========================================================
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);

    if (!['http:', 'https:'].includes(url.protocol)) return;

    const domain = url.hostname.toLowerCase();
    const localML = runLocalMLClassification(details.url);

    let evalResult = null;

    // demo override for presentation testing
    if (domain.includes('example.com')) {
      localML.score = 18;
      evalResult = {
        ...localML,
        score: 18,
        isWhitelisted: false,
        gaps: [
          'Critical: Host signature matched active phishing honeypot.',
          'High-risk credential interception vector detected.',
          'Zero-trust policy enforcement: Interactive DOM locked.'
        ]
      };
    }

    // TIER 0: WHITELIST CHECK
    else if (isDomainWhitelisted(domain)) {
      evalResult = {
        ...localML,
        isWhitelisted: true
      };
      // silent background log so dashboard counts this visited site
      fetch(`${BACKEND_API}?domain=${encodeURIComponent(domain)}`).catch(() => {});
    }

    // NON-WHITELISTED DOMAIN
    else {
      const storageKey = `cyv_cache_${domain}`;
      const cached = await chrome.storage.local.get(storageKey);
      const now = Date.now();

      if (cached[storageKey] && (now - cached[storageKey].timestamp < TWELVE_HOURS_MS)) {
        evalResult = cached[storageKey].data;
      } else {
        // TIER 2: LOCAL ML FAST EARLY-EXIT
        // agar URL khud hi suspicious ya risky hai toh heavy scanner mat chalao
        if (localML.score < 45) {
          evalResult = {
            ...localML,
            score: localML.score,
            isWhitelisted: false,
            gaps: localML.gaps || ['Critical: Host signature matched high-risk heuristic patterns.']
          };
        }
        // TIER 3: CLEAN URL DEEP VERIFICATION
        // URL clean mili toh backend scanner TLS, DNS aur headers audit combine karega
        else {
          try {
            const res = await fetch(`${BACKEND_API}?domain=${encodeURIComponent(domain)}`);
            if (res.ok) {
              const backendData = await res.json();
              evalResult = {
                ...backendData,
                score: Number.isFinite(Number(backendData.score)) ? Number(backendData.score) : localML.score
              };
            } else {
              evalResult = localML;
            }
          } catch (err) {
            console.warn('Cyvora backend unreachable:', err.message);
            evalResult = localML;
          }
        }

        evalResult.displayLabel = `${evalResult.score}`;
        evalResult.isWhitelisted = false;

        await chrome.storage.local.set({
          [storageKey]: {
            timestamp: now,
            data: evalResult
          }
        });
      }
    }

    // FINAL BADGE UPDATE WITH COMBINED SCORE
    let finalScore = evalResult && Number.isFinite(Number(evalResult.score))
      ? Number(evalResult.score)
      : localML.score;

    // ZERO-TRUST CIRCUIT BREAKER: COUNT MAJOR SECURITY GAPS
    const gapsList = evalResult && Array.isArray(evalResult.gaps) ? evalResult.gaps : [];
    let majorGapsCount = 0;

    // 1. unencrypted transport check
    // unencrypted http connection me ssl aur hsts dono missing hote hain isliye yeh akela 2 gaps count hoga
    if (url.protocol === 'http:' || gapsList.some(g => g.toLowerCase().includes('unencrypted') || g.toLowerCase().includes('tls handshake failed'))) {
      majorGapsCount += 2;
    }

    // 2. clickjacking barrier check
    if (gapsList.some(g => g.toLowerCase().includes('x-frame-options') || g.toLowerCase().includes('clickjacking'))) {
      majorGapsCount += 1;
    }

    // 3. content security policy injection check
    if (gapsList.some(g => g.toLowerCase().includes('content-security-policy') || g.toLowerCase().includes('csp'))) {
      majorGapsCount += 1;
    }

    // 4. email spoofing dmarc check
    if (gapsList.some(g => g.toLowerCase().includes('dmarc'))) {
      majorGapsCount += 1;
    }

    // 5. known cve exploit check
    if (gapsList.some(g => g.toLowerCase().includes('cve') || g.toLowerCase().includes('vulnerable'))) {
      majorGapsCount += 1;
    }

    // localhost check
    const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';

    // AGAR 2 YA USSE ZYADA MAJOR GAPS HAIN TOH FORCE BLOCK KARO, LEKIN LOCALHOST DASHBOARD KO CHHODKAR
    if (!isLocalhost && majorGapsCount >= 2) {
      finalScore = Math.min(finalScore, 40);
      if (evalResult) {
        evalResult.gaps = evalResult.gaps || [];
        evalResult.gaps.unshift(`Zero-Trust Circuit Breaker: ${majorGapsCount} major security pillars failed simultaneously.`);
      }
      console.log(`CYVORA CIRCUIT BREAKER TRIGGERED: ${majorGapsCount} major gaps found. Score capped to ${finalScore}.`);
    } else if (isLocalhost) {
      finalScore = 85;
      if (evalResult) {
        evalResult.gaps = ['Local loopback verified: Cyvora primary telemetry command console.'];
      }
    }

    setCyvoraBadge(details.tabId, finalScore);

    // SAVE COMBINED RESULT FOR POPUP
    await chrome.storage.local.set({
      [`tab_score_${details.tabId}`]: {
        ...evalResult,
        score: finalScore,
        isUnreachable: false
      }
    });

    // SEND RESULT TO CONTENT SCRIPT
    chrome.tabs.sendMessage(details.tabId, {
      action: 'RENDER_SHIELD_UI',
      payload: {
        ...evalResult,
        score: finalScore,
        domain: domain,
        fullUrl: details.url,
        dashboardUrl: DASHBOARD_URL
      }
    }).catch(() => {});

  } catch {
    chrome.action.setBadgeText({ tabId: details.tabId, text: '?' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#475569' }).catch(() => {});
  }
});


// ========================================================
// NAVIGATION ERROR: SITE OPEN HI NAHI HUI YA EXIST NAHI KARTI
// ========================================================

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);

    if (!['http:', 'https:'].includes(url.protocol)) return;

    chrome.action.setBadgeText({
      tabId: details.tabId,
      text: '?'
    }).catch(() => {});

    chrome.action.setBadgeBackgroundColor({
      tabId: details.tabId,
      color: '#64748B'
    }).catch(() => {});

    // popup storage ko update karein taaki trusted na dikhe
    await chrome.storage.local.set({
      [`tab_score_${details.tabId}`]: {
        domain: url.hostname,
        score: null,
        isUnreachable: true,
        statusText: 'SITE UNREACHABLE / DOES NOT EXIST',
        displayLabel: 'UNREACHABLE'
      }
    });

    console.log('CYVORA: SITE UNREACHABLE OR NXDOMAIN - STORAGE CLEARED');
  } catch (error) {
    chrome.action.setBadgeText({ tabId: details.tabId, text: '?' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#64748B' }).catch(() => {});
  }
});