chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (!tabs[0] || !tabs[0].url) return;
  try {
    const url = new URL(tabs[0].url);
    document.getElementById('domainDisplay').innerText = url.hostname;
    document.getElementById('inspectLink').href = `http://localhost:5173/?targetUrl=${encodeURIComponent(tabs[0].url)}&autoScan=true`;

    chrome.action.getBadgeText({ tabId: tabs[0].id }, (badge) => {
      const scoreElem = document.getElementById('scoreDisplay');
      if (badge === '✓') {
        scoreElem.innerText = '98/100';
        scoreElem.className = 'score score-green';
      } else if (badge === '✕') {
        scoreElem.innerText = 'RISKY';
        scoreElem.className = 'score score-red';
      } else {
        scoreElem.innerText = 'ACTIVE';
        scoreElem.className = 'score';
      }
    });
  } catch (e) {}
});