chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'RENDER_SHIELD_UI') return;
  const { score, gaps, dashboardUrl, domain, fullUrl } = message.payload;

  if (document.getElementById('cyvora-root-shield')) return;

  const container = document.createElement('div');
  container.id = 'cyvora-root-shield';

  // Handoff URL directly into Cyvora Scanner with autoScan
  const inspectUrl = `${dashboardUrl}/?targetUrl=${encodeURIComponent(fullUrl)}&autoScan=true`;

  if (score < 45) {
    const overrideKey = `cyvora_override_${domain}`;
    if (!sessionStorage.getItem(overrideKey)) {
      renderRedWarningModal(container, score, gaps, inspectUrl, overrideKey);
      document.body.appendChild(container);
      return;
    }
  }

  renderCornerPill(container, score, inspectUrl);
  document.body.appendChild(container);
});

function renderCornerPill(container, score, inspectUrl) {
  const pillClass = score >= 75 ? 'cy-green' : (score >= 45 ? 'cy-amber' : 'cy-red');
  container.innerHTML = `
    <div class="cy-pill ${pillClass}">
      <span class="cy-dot"></span>
      <span class="cy-text">CYVORA: ${score}</span>
      <a href="${inspectUrl}" target="_blank" class="cy-link" title="Open Deep Report in Cyvora">↗</a>
    </div>
  `;
}

function renderRedWarningModal(container, score, gaps, inspectUrl, overrideKey) {
  container.innerHTML = `
    <div class="cy-interstitial-backdrop">
      <div class="cy-modal">
        <div class="cy-header">
          <div class="cy-alert-icon">⚠️</div>
          <div>
            <h3 class="cy-title">CRITICAL SECURITY RISK DETECTED</h3>
            <p class="cy-subtitle">Cyvora Shield flagged this domain for suspicious structure or lack of defense protocols.</p>
          </div>
        </div>

        <div class="cy-card">
          <div class="cy-score-box">
            <span class="cy-score">${score}</span>
            <span class="cy-score-sub">/100 DEFENSE</span>
          </div>
          <div class="cy-gaps">
            <strong>DETECTED GAPS:</strong>
            <ul>
              ${gaps.length ? gaps.map(g => `<li>${g}</li>`).join('') : '<li>High-risk anomaly footprint</li>'}
            </ul>
          </div>
        </div>

        <div class="cy-actions">
          <button id="cy-btn-bypass" class="cy-btn-outline">Continue to Site Anyway</button>
          <a href="${inspectUrl}" target="_blank" class="cy-btn-solid">Inspect Configuration on Cyvora</a>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#cy-btn-bypass').addEventListener('click', () => {
    sessionStorage.setItem(overrideKey, 'true');
    container.remove();
  });
}