chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'RENDER_SHIELD_UI') return;
  const { isWhitelisted, score, gaps, dashboardUrl, domain, fullUrl, displayLabel } = message.payload;

  if (document.getElementById('cyvora-root-shield')) return;

  // Mount directly to documentElement (sibling to body) to isolate from page CSS
  const host = document.createElement('div');
  host.id = 'cyvora-root-shield';
  host.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;';

  const shadow = host.attachShadow({ mode: 'open' });
  const inspectUrl = `${dashboardUrl}/?targetUrl=${encodeURIComponent(fullUrl)}&autoScan=true`;

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

  renderCornerPill(shadow, isWhitelisted, displayLabel, score, inspectUrl);
  document.documentElement.appendChild(host);
});

function renderCornerPill(shadow, isWhitelisted, displayLabel, score, inspectUrl) {
  let pillClass = 'cy-green';
  let dotColor = '#10b981';
  if (!isWhitelisted) {
    if (score < 45) { pillClass = 'cy-red'; dotColor = '#ef4444'; }
    else if (score < 75) { pillClass = 'cy-amber'; dotColor = '#f59e0b'; }
  }

  shadow.innerHTML = `
    <style>
      .cy-pill {
        position: fixed;
        bottom: 24px;
        right: 24px;
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 9999px;
        background: #000000;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9);
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      }
      .cy-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background-color: ${dotColor};
        box-shadow: 0 0 10px ${dotColor};
      }
      .cy-text {
        font-size: 11px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.08em;
      }
      .cy-link {
        font-size: 13px;
        color: #c084fc;
        text-decoration: none;
        font-weight: 800;
        margin-left: 2px;
      }
      .cy-link:hover { color: #ffffff; }
    </style>
    <div class="cy-pill">
      <span class="cy-dot"></span>
      <span class="cy-text">CYVORA: ${displayLabel}</span>
      <a href="${inspectUrl}" target="_blank" class="cy-link" title="Open in Cyvora Recon">↗</a>
    </div>
  `;
}

function renderRedWarningModal(shadow, host, score, gaps = [], inspectUrl, overrideKey) {
  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      /* Dark Click-Lock Backdrop */
      .cy-scrim {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      /* 100% Solid Opaque Pitch-Black Modal */
      .cy-modal {
        width: 100%;
        max-width: 530px;
        background: #000000 !important;
        border: 2px solid #ef4444 !important;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 0 60px rgba(0, 0, 0, 1), 0 0 40px rgba(239, 68, 68, 0.35);
        color: #ffffff;
        opacity: 1 !important;
        pointer-events: auto;
      }
      .cy-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }
      .cy-icon {
        font-size: 34px;
        line-height: 1;
        flex-shrink: 0;
      }
      .cy-title {
        font-size: 17px;
        font-weight: 900;
        color: #ef4444;
        letter-spacing: 0.05em;
        font-family: monospace;
        line-height: 1.2;
      }
      .cy-sub {
        margin-top: 6px;
        font-size: 13px;
        color: #94a3b8;
        line-height: 1.5;
      }
      .cy-card {
        margin: 22px 0;
        background: #090d16;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .cy-score-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #1e293b;
        padding-right: 20px;
        min-width: 80px;
        flex-shrink: 0;
      }
      .cy-score {
        font-size: 40px;
        font-weight: 900;
        color: #ef4444;
        font-family: monospace;
        line-height: 1;
      }
      .cy-score-lbl {
        font-size: 9px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.12em;
        font-family: monospace;
        margin-top: 5px;
      }
      .cy-gaps {
        font-size: 12px;
        color: #e2e8f0;
        line-height: 1.5;
      }
      .cy-gaps strong {
        font-size: 10px;
        letter-spacing: 0.08em;
        color: #f87171;
        font-family: monospace;
      }
      .cy-gaps ul {
        margin-top: 6px;
        padding-left: 18px;
        list-style: disc;
      }
      .cy-gaps li {
        margin-bottom: 3px;
        font-weight: 500;
      }
      .cy-actions {
        display: flex;
        gap: 12px;
        margin-top: 10px;
      }
      .cy-btn-outline,
      .cy-btn-solid {
        flex: 1;
        padding: 13px 16px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 800;
        text-align: center;
        cursor: pointer;
        text-decoration: none;
        font-family: monospace;
        letter-spacing: 0.04em;
        transition: all 0.2s ease;
        display: inline-block;
      }
      .cy-btn-outline {
        background: #0f172a;
        border: 1px solid #334155;
        color: #cbd5e1;
      }
      .cy-btn-outline:hover {
        background: #1e293b;
        color: #ffffff;
        border-color: #64748b;
      }
      .cy-btn-solid {
        background: #dc2626;
        border: 1px solid #ef4444;
        color: #ffffff;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.45);
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
            <h3 class="cy-title">CRITICAL SECURITY RISK DETECTED</h3>
            <p class="cy-sub">Cyvora Shield flagged this domain for anomalous structure or lack of defense protocols.</p>
          </div>
        </div>

        <div class="cy-card">
          <div class="cy-score-box">
            <span class="cy-score">${score}</span>
            <span class="cy-score-lbl">DEFENSE</span>
          </div>
          <div class="cy-gaps">
            <strong>DETECTED DEFICIENCIES:</strong>
            <ul>
              ${gaps.length ? gaps.map(g => `<li>${g}</li>`).join('') : '<li>Untrusted infrastructure footprint</li>'}
            </ul>
          </div>
        </div>

        <div class="cy-actions">
          <button id="cy-btn-bypass" class="cy-btn-outline" type="button">Continue to Site Anyway</button>
          <a href="${inspectUrl}" target="_blank" class="cy-btn-solid">Inspect on Cyvora</a>
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