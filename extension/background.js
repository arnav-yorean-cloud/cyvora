import { isDomainWhitelisted } from './safeDomains.js';
import { runLocalMLClassification } from './mlEngine.js';

const BACKEND_API = 'http://localhost:5000/api/scan/quick-check';
const DASHBOARD_URL = 'http://localhost:5173';

// 1. Immediately turn badge GREY when user starts navigation
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  chrome.action.setBadgeText({ tabId: details.tabId, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#64748b' }); // Grey checking state
});

// 2. Evaluate target on navigation complete
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const domain = url.hostname;

    let evalResult = null;

    // TIER 1: Instant Whitelist Check (< 0.1ms)
    if (isDomainWhitelisted(domain)) {
      evalResult = { score: 98, verdict: 'Safe', gaps: [] };
    } else {
      // TIER 2: Fast Local ML Evaluation (< 2ms)
      const localML = runLocalMLClassification(domain);

      if (localML.score < 50) {
        // High risk detected locally, trigger immediately
        evalResult = localML;
      } else {
        // TIER 3: Backend Verification Handshake
        try {
          const res = await fetch(`${BACKEND_API}?domain=${encodeURIComponent(domain)}`);
          if (res.ok) {
            evalResult = await res.json();
          } else {
            evalResult = localML;
          }
        } catch {
          evalResult = localML; // Offline fallback to local ML
        }
      }
    }

    // Set Badge Color based on score
    if (evalResult.score >= 75) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✓' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#10B981' }); // Green
    } else if (evalResult.score >= 45) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#F59E0B' }); // Amber
    } else {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✕' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#EF4444' }); // Red
    }

    // Send payload to Content Script to show UI
    chrome.tabs.sendMessage(details.tabId, {
      action: 'RENDER_SHIELD_UI',
      payload: {
        score: evalResult.score,
        verdict: evalResult.verdict,
        gaps: evalResult.gaps || [],
        domain,
        fullUrl: details.url,
        dashboardUrl: DASHBOARD_URL
      }
    }).catch(() => {});

  } catch (err) {
    chrome.action.setBadgeText({ tabId: details.tabId, text: '?' });
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#475569' });
  }
});