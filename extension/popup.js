chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (!tabs[0] || !tabs[0].url) return;

  try {
    const url = new URL(tabs[0].url);
    document.getElementById('domainDisplay').innerText = url.hostname;
    document.getElementById('inspectLink').href = `http://localhost:5173/?targetUrl=${encodeURIComponent(tabs[0].url)}&autoScan=true`;

    const stored = await chrome.storage.local.get(`tab_score_${tabs[0].id}`);
    const scoreElem = document.getElementById('scoreDisplay');

    if (stored[`tab_score_${tabs[0].id}`]) {
      const data = stored[`tab_score_${tabs[0].id}`];

      if (data.isWhitelisted) {
        scoreElem.innerText = 'TRUSTED';
        scoreElem.className = 'score score-green';
      } else {
        scoreElem.innerText = `${data.score}/100`;
        scoreElem.cl
        assName = data.score >= 75 ? 'score score-green' : (data.score >= 45 ? 'score' : 'score score-red');
      }
    } else {
      scoreElem.innerText = 'MONITORING';
      scoreElem.className = 'score';
    }
  } catch (e) {
    console.error(e);
  }
});