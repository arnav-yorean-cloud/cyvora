chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'RENDER_SHIELD_UI') return;
  const { isWhitelisted, score, gaps, dashboardUrl, domain, fullUrl } = message.payload;

  if (document.getElementById('cyvora-root-shield')) return;

  // Mount directly to documentElement (sibling to body) to isolate from page CSS
  const host = document.createElement('div');
  host.id = 'cyvora-root-shield';
  host.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;';

  const shadow = host.attachShadow({ mode: 'open' });
  const inspectUrl = `${dashboardUrl}/?targetUrl=${encodeURIComponent(fullUrl)}&autoScan=true`;

  // Sirf tabhi barrier lagao jab domain Dangerous (< 45) ho aur whitelisted na ho
  if (!isWhitelisted && score < 45) {
    const overrideKey = `cyvora_override_${domain}`;
    if (!sessionStorage.getItem(overrideKey)) {
      // 1. Physically blur and lock the actual website body
      document.body.style.setProperty('filter', 'blur(10px) brightness(0.4)', 'important');
      document.body.style.setProperty('pointer-events', 'none', 'important');
      document.body.style.setProperty('user-select', 'none', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');

      renderRedWarningModal(shadow, host, score, gaps, inspectUrl, overrideKey);
      document.documentElement.appendChild(host);
      return;
    }
  }

  // Safe sites ke liye corner pill render nahi hoga (Clean Browsing)
});

function renderRedWarningModal(shadow, host, score, gaps = [], inspectUrl, overrideKey) {
  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .cy-scrim {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(5, 7, 15, 0.85);
        backdrop-filter: blur(12px);
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .cy-modal {
        width: 100%;
        max-width: 520px;
        background: #090d16 !important;
        border: 1.5px solid rgba(239, 68, 68, 0.5) !important;
        border-radius: 18px;
        padding: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.2);
        color: #ffffff;
        pointer-events: auto;
      }
      .cy-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .cy-icon {
        font-size: 30px;
        line-height: 1;
        flex-shrink: 0;
      }
      .cy-title {
        font-size: 16px;
        font-weight: 800;
        color: #ef4444;
        letter-spacing: 0.04em;
        font-family: monospace;
        line-height: 1.2;
      }
      .cy-sub {
        margin-top: 5px;
        font-size: 12px;
        color: #94a3b8;
        line-height: 1.5;
      }
      .cy-card {
        margin: 20px 0;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 16px 18px;
      }
      .cy-gaps strong {
        font-size: 10px;
        letter-spacing: 0.08em;
        color: #f87171;
        font-family: monospace;
        display: block;
        margin-bottom: 6px;
      }
      .cy-gaps ul {
        padding-left: 18px;
        list-style: disc;
      }
      .cy-gaps li {
        font-size: 11px;
        color: #cbd5e1;
        margin-bottom: 4px;
        line-height: 1.4;
      }
      .cy-actions {
        display: flex;
        gap: 12px;
        margin-top: 10px;
      }
      .cy-btn-outline,
      .cy-btn-solid {
        flex: 1;
        padding: 11px 16px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
        text-decoration: none;
        font-family: monospace;
        letter-spacing: 0.03em;
        transition: all 0.2s ease;
        display: inline-block;
      }
      .cy-btn-outline {
        background: #0f172a;
        border: 1px solid #334155;
        color: #94a3b8;
      }
      .cy-btn-outline:hover {
        background: #1e293b;
        color: #ffffff;
      }
      .cy-btn-solid {
        background: #dc2626;
        border: 1px solid #ef4444;
        color: #ffffff;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
      }
      .cy-btn-solid:hover {
        background: #b91c1c;
      }
    </style>

    <div class="cy-scrim">
      <div class="cy-modal">
        <div class="cy-header">
          <div class="cy-icon">⚠️</div>
          <div>
            <h3 class="cy-title">CRITICAL SECURITY RISK BLOCKED</h3>
            <p class="cy-sub">Cyvora Shield blocked interaction with this host due to severe threat heuristics.</p>
          </div>
        </div>

        <div class="cy-card">
          <div class="cy-gaps">
            <strong>DETECTED THREAT INDICATORS:</strong>
            <ul>
              ${gaps.length ? gaps.map(g => `<li>${g}</li>`).join('') : '<li>High probability phishing or credential interception host</li>'}
            </ul>
          </div>
        </div>

        <div class="cy-actions">
          <button id="cy-btn-bypass" class="cy-btn-outline" type="button">Continue to Site Anyway</button>
          <a href="${inspectUrl}" target="_blank" class="cy-btn-solid">Inspect on Cyvora →</a>
        </div>
      </div>
    </div>
  `;

  // Restore site styling on override
  shadow.querySelector('#cy-btn-bypass').addEventListener('click', () => {
    sessionStorage.setItem(overrideKey, 'true');
    document.body.style.filter = '';
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    document.documentElement.style.overflow = '';
    host.remove();
  });
}