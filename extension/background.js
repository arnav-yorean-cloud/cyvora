const API_BASE_URL = 'http://localhost:5000/api/scan/quick-check';
const DASHBOARD_URL = 'http://localhost:5173';

// 1. Immediately turn badge GREY when user starts navigating
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  chrome.action.setBadgeText({ tabId: details.tabId, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#64748b' }); // Slate Grey
});

// 2. Evaluate target once page completes handshake
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const domain = url.hostname;

    const response = await fetch(`${API_BASE_URL}?domain=${encodeURIComponent(domain)}`);
    if (!response.ok) throw new Error('API triage failed');
    const result = await response.json();

    // Set badge based on score
    if (result.score >= 75) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✓' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#10B981' }); // Green
    } else if (result.score >= 45) {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '!' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#F59E0B' }); // Amber
    } else {
      chrome.action.setBadgeText({ tabId: details.tabId, text: '✕' });
      chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#EF4444' }); // Red
    }

    // Message the tab content script to show UI
    chrome.tabs.sendMessage(details.tabId, {
      action: 'RENDER_SHIELD_UI',
      payload: {
        score: result.score,
        verdict: result.verdict,
        gaps: result.gaps || [],
        domain,
        fullUrl: details.url,
        dashboardUrl: DASHBOARD_URL
      }
    }).catch(() => {});
  } catch (err) {
    // Fallback: Neutral grey state
    chrome.action.setBadgeText({ tabId: details.tabId, text: '?' });
    chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#475569' });
  }
});