// server/utils/triageEngine.js
const dnsPromises = require('dns').promises;

// Top high-reputation domains (instant 0ms bypass)
const TOP_WHITELIST = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'wikipedia.org',
  'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'netflix.com',
  'microsoft.com', 'apple.com', 'github.com', 'cloudflare.com', 'reddit.com',
  'whatsapp.com', 'bing.com', 'yahoo.com', 'spotify.com', 'twitch.tv',
  'adobe.com', 'salesforce.com', 'dropbox.com', 'stackoverflow.com', 'medium.com',
  'imsec.ac.in', 'aktu.ac.in', 'openai.com', 'anthropic.com', 'huggingface.co'
]);

const MONITORED_BRANDS = [
  'google', 'paypal', 'apple', 'microsoft', 'amazon', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'twitter', 'linkedin', 'github', 'chase', 'wellsfargo',
  'bankofamerica', 'binance', 'coinbase', 'metamask', 'dropbox', 'spotify',
  'adobe', 'telegram', 'roblox', 'steam', 'sbi', 'icici', 'hdfc', 'imsec'
];

const RISKY_TLDS = [
  '.xyz', '.top', '.work', '.click', '.loan', '.gq', '.tk', '.cf',
  '.buzz', '.cc', '.live', '.monster', '.rest', '.bar', '.icu', '.fit'
];

const DECEPTIVE_KEYWORDS = [
  'login', 'verify', 'verification', 'secure', 'account', 'update',
  'billing', 'support', 'recover', 'wallet', 'token', 'banking',
  'auth', 'password', 'confirm', 'security', 'signin', 'service', 'airdrop', 'claim'
];

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly',
  'cutt.ly', 'shorturl.at', 'rb.gy', 'v.gd', 'goo.gl'
]);

function calculateEntropy(str) {
  const len = str.length;
  if (!len) return 0;
  const freqs = {};
  for (const c of str) freqs[c] = (freqs[c] || 0) + 1;
  return Object.values(freqs).reduce((sum, f) => {
    const p = f / len;
    return sum - p * Math.log2(p);
  }, 0);
}

function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => 
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

// Complete 17-Feature Lexical Evaluation
function evaluateLexicalFeatures(inputUrl) {
  let riskScore = 0;
  const gaps = [];

  let domain = (inputUrl || '').toLowerCase().trim();
  let port = '';
  let protocol = 'https:';

  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    try {
      const parsed = new URL(domain);
      domain = parsed.hostname;
      protocol = parsed.protocol;
      port = parsed.port;
    } catch {
      domain = domain.split('/')[0].split(':')[0];
    }
  } else {
    domain = domain.split('/')[0].split(':')[0];
  }

  const parts = domain.split('.');
  const baseName = parts[0] || '';
  const secondLevelName = parts.length > 2 ? parts[parts.length - 2] : parts[0];

  // 1. Domain Length
  if (domain.length > 35) {
    riskScore += 15;
    gaps.push(`Anomalous domain length (${domain.length} characters)`);
  }

  // 2. Subdomain Count / Nesting Depth
  if (parts.length >= 4) {
    riskScore += 20;
    gaps.push(`Abnormal subdomain nesting depth (${parts.length - 2} levels)`);
  }

  // 3. Raw IP Address Presence
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    riskScore += 40;
    gaps.push('Raw numerical IPv4 address used without DNS registration');
  }

  // 4. Hyphen Count
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    riskScore += Math.min(25, hyphenCount * 8);
    gaps.push(`High hyphen count (${hyphenCount}) matching phishing mimicry`);
  }

  // 5. Suspicious TLD
  if (RISKY_TLDS.some(tld => domain.endsWith(tld))) {
    riskScore += 30;
    gaps.push('High-risk disposable Top-Level Domain (TLD)');
  }

  // 6. Phishing Keywords
  DECEPTIVE_KEYWORDS.forEach(keyword => {
    if (domain.includes(keyword)) {
      riskScore += 18;
      gaps.push(`Deceptive keyword "${keyword}" in domain string`);
    }
  });

  // 7. Special Characters & Obfuscation
  if (domain.includes('@')) {
    riskScore += 35;
    gaps.push('Credential injection "@" symbol detected');
  }

  // 8. Shannon String Entropy (DGA)
  if (baseName.length > 8 && calculateEntropy(baseName) > 3.85) {
    riskScore += 22;
    gaps.push('Elevated Shannon entropy (Algorithmic DGA randomness)');
  }

  // 9 & 10. Vowel Ratio & Consonant Clusters
  const cleanAlpha = baseName.replace(/[^a-z]/g, '');
  if (cleanAlpha.length >= 6) {
    const vowels = (cleanAlpha.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / cleanAlpha.length;
    if (vowelRatio < 0.14) {
      riskScore += 25;
      gaps.push(`Abnormal vowel ratio (${Math.round(vowelRatio * 100)}%) indicating DGA generation`);
    }
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanAlpha)) {
      riskScore += 20;
      gaps.push('Unnatural consecutive consonant cluster detected');
    }
  }

  // 11. Digit Density & Trailing Padding
  const digits = domain.match(/\d/g) || [];
  if (digits.length / domain.length > 0.30) {
    riskScore += 20;
    gaps.push('High numeric density in hostname');
  } else if (/\d{4,}$/.test(baseName)) {
    riskScore += 15;
    gaps.push('Trailing numeric padding pattern detected');
  }

  // 12. Homoglyph / Punycode (IDN)
  if (domain.includes('xn--') || /[^\u0000-\u007F]/.test(domain)) {
    riskScore += 50;
    gaps.push('Homoglyph / Punycode (IDN) spoofing pattern detected');
  }

  // 13. Brand Typo-squatting / Levenshtein Distance
  for (const brand of MONITORED_BRANDS) {
    if (secondLevelName !== brand) {
      const dist = getLevenshteinDistance(secondLevelName, brand);
      if (dist === 1 && secondLevelName.length > 3) {
        riskScore += 45;
        gaps.push(`Typosquatting mimicry targeting "${brand}"`);
        break;
      }
    }
  }

  // 14. Subdomain Brand Stacking
  if (parts.length > 2) {
    const subdomain = parts.slice(0, -2).join('.');
    for (const brand of MONITORED_BRANDS) {
      if (subdomain.includes(brand)) {
        riskScore += 35;
        gaps.push(`Deceptive brand placement ("${brand}") in subdomain`);
        break;
      }
    }
    if (subdomain.includes('.com') || subdomain.includes('.net')) {
      riskScore += 30;
      gaps.push('Fake TLD token stacking inside subdomain');
    }
  }

  // 15. Shortener Trap
  if (SHORTENERS.has(domain)) {
    riskScore += 25;
    gaps.push('Cloaked destination URL using link shortener');
  }

  // 16. Protocol Safety
  if (protocol === 'http:' && !domain.includes('localhost') && domain !== '127.0.0.1') {
    riskScore += 25;
    gaps.push('Insecure cleartext HTTP protocol');
  }

  // 17. Non-standard Port
  if (port && port !== '80' && port !== '443') {
    riskScore += 25;
    gaps.push(`Suspicious non-standard web traffic port (:${port})`);
  }

  return { riskScore, gaps };
}

// Fast Triage orchestrator with DNS Fallback
async function runFastTriage(domain) {
  const cleanDomain = (domain || '').toLowerCase().trim();

  // Whitelist bypass
  if (TOP_WHITELIST.has(cleanDomain)) {
    return { score: 98, verdict: 'Safe', gaps: [] };
  }
  const parts = cleanDomain.split('.');
  if (parts.length > 2 && TOP_WHITELIST.has(parts.slice(-2).join('.'))) {
    return { score: 98, verdict: 'Safe', gaps: [] };
  }

  const lexical = evaluateLexicalFeatures(cleanDomain);
  let baseScore = Math.max(10, Math.min(100, 100 - lexical.riskScore));

  // Fast DNS Validation (DMARC Check)
  try {
    const txt = await dnsPromises.resolveTxt(`_dmarc.${cleanDomain}`);
    let hasDMARC = txt && txt.some(entry => entry.join('').includes('v=DMARC1'));
    if (!hasDMARC) {
      baseScore = Math.max(10, baseScore - 12);
      lexical.gaps.push('Missing DMARC anti-spoofing policy');
    }
  } catch {
    baseScore = Math.max(10, baseScore - 15);
    lexical.gaps.push('Unresolvable or absent mail security records');
  }

  const verdict = baseScore >= 75 ? 'Safe' : (baseScore >= 45 ? 'Moderate' : 'Critical');
  return { score: baseScore, verdict, gaps: lexical.gaps };
}

module.exports = { runFastTriage, TOP_WHITELIST, evaluateLexicalFeatures };