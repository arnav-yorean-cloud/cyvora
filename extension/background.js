import { isDomainWhitelisted } from './safeDomains.js';
import { runLocalMLClassification } from './mlEngine.js';

const BACKEND_API = 'http://localhost:5000/api/scan/quick-check';
const DASHBOARD_URL = 'http://localhost:5173';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  chrome.action.setBadgeText({ tabId: details.tabId, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#64748b' });
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const domain = url.hostname;

    let evalResult = null;

    // TIER 0: Whitelist Match -> Verified Safe
    if (isDomainWhitelisted(domain)) {
      evalResult = {
        isWhitelisted: true,
        verdict: 'Safe',
        displayLabel: 'SAFE'
      };
    } else {
      // TIER 1: Check 12-Hour Local Cache
      const storageKey = `cyv_cache_${domain}`;
      const cached = await chrome.storage.local.get(storageKey);
      const now = Date.now();

      if (cached[storageKey] && (now - cached[storageKey].timestamp < TWELVE_HOURS_MS)) {
        evalResult = cached[storageKey].data;
      } else {
        // TIER 2: Run Local Heuristic ML
        const localML = runLocalMLClassification(domain);

        if (localML.score < 45) {
          evalResult = localML;
        } else {
          // TIER 3: Backend API Verification
          try {
            const res = await fetch(`${BACKEND_API}?domain=${encodeURIComponent(domain)}`);
            evalResult = res.ok ? await res.json() : localML;
          } catch {
            evalResult = localML;
          }
        }

        evalResult.displayLabel = `${evalResult.score}`;
        evalResult.isWhitelisted = false;

        chrome.storage.local.set({
          [storageKey]: { timestamp: now, data: evalResult }
        });
      }
    }

    // Set Extension Badge Icon
    if (evalResult.isWhitelisted || evalResult.score >= 75) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✓' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#10B981' });
    } else if (evalResult.score >= 45) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#F59E0B' });
    } else {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✕' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#EF4444' });
    }

    // Save for popup window
    chrome.storage.local.set({ [`tab_score_${details.tabId}`]: evalResult });

    // Send to Content Script
    chrome.tabs.sendMessage(details.tabId, {
      action: 'RENDER_SHIELD_UI',
      payload: {
        ...evalResult,
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