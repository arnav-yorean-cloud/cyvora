let SAFE_DOMAINS = new Set();

// Load the JSON dataset
fetch(chrome.runtime.getURL('top1000.json'))
  .then(res => res.json())
  .then(list => {
    SAFE_DOMAINS = new Set(list);
  })
  .catch(() => {
    SAFE_DOMAINS = new Set(['google.com', 'github.com', 'imsec.ac.in', 'youtube.com']);
  });

export function isDomainWhitelisted(hostname) {
  const clean = hostname.toLowerCase().replace(/^www\./, '');
  if (SAFE_DOMAINS.has(clean)) return true;

  const parts = clean.split('.');
  if (parts.length > 2) {
    const root = parts.slice(-2).join('.');
    if (SAFE_DOMAINS.has(root)) return true;
    const eduRoot = parts.slice(-3).join('.');
    if (SAFE_DOMAINS.has(eduRoot)) return true;
  }
  return false;
}