// extension/mlEngine.js - 17-Feature Heuristic ML & Lexical Classifier
// Manifest V3 ES-Module Compatible

// High-Value Brand Targets for Typo-squatting & Mimicry Detection
const MONITORED_BRANDS = [
  'google', 'paypal', 'apple', 'microsoft', 'amazon', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'twitter', 'linkedin', 'github', 'chase', 'wellsfargo',
  'bankofamerica', 'binance', 'coinbase', 'metamask', 'dropbox', 'spotify',
  'adobe', 'telegram', 'roblox', 'steam', 'sbi', 'icici', 'hdfc', 'imsec'
];

// High-Risk Disposable TLDs commonly abused by phishing kits
const RISKY_TLDS = [
  '.xyz', '.top', '.work', '.click', '.loan', '.gq', '.tk', '.cf',
  '.buzz', '.cc', '.live', '.monster', '.rest', '.bar', '.icu', '.fit', '.tk'
];

// Deceptive Phishing Keywords
const DECEPTIVE_KEYWORDS = [
  'login', 'verify', 'verification', 'secure', 'account', 'update',
  'billing', 'support', 'recover', 'wallet', 'token', 'banking',
  'auth', 'password', 'confirm', 'security', 'signin', 'service', 'airdrop', 'claim'
];

// Known URL Shortener Cloaking Domains
const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly',
  'cutt.ly', 'shorturl.at', 'rb.gy', 'v.gd', 'goo.gl'
]);

// ========================================================
// MATHEMATICAL HELPER FUNCTIONS
// ========================================================

// 1. Shannon Entropy (Randomness detector for DGA domains)
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

// 2. Levenshtein Distance (Calculates minimum character edit distance)
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

// ========================================================
// 17-FEATURE CLASSIFIER PIPELINE
// ========================================================
export function runLocalMLClassification(rawInput) {
  if (!rawInput) return { score: 10, verdict: 'Critical', gaps: ['Empty target path'] };

  let urlStr = rawInput.trim();
  let domain = urlStr;
  let protocol = 'https:';
  let port = '';
  let pathname = '';

  try {
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const parsed = new URL(urlStr);
      domain = parsed.hostname;
      protocol = parsed.protocol;
      port = parsed.port;
      pathname = parsed.pathname;
    } else {
      domain = urlStr.split('/')[0].split(':')[0];
      if (urlStr.includes(':')) {
        const portMatch = urlStr.match(/:(\d+)/);
        if (portMatch) port = portMatch[1];
      }
    }
  } catch (e) {
    domain = urlStr.split('/')[0];
  }

  domain = domain.toLowerCase();
  let riskScore = 0;
  const gaps = [];

  const parts = domain.split('.');
  const baseName = parts[0] || '';
  const secondLevelName = parts.length > 2 ? parts[parts.length - 2] : parts[0];

  // --------------------------------------------------------
  // GROUP 1: DOMAIN & URL STRUCTURE (5 FEATURES)
  // --------------------------------------------------------
  // Feature 1: Domain / URL Length
  if (domain.length > 35) {
    riskScore += 15;
    gaps.push(`Anomalous domain length (${domain.length} characters)`);
  }

  // Feature 2: Subdomain Nesting Depth / Dot Count
  if (parts.length >= 4) {
    riskScore += 20;
    gaps.push(`Abnormal subdomain nesting depth (${parts.length - 2} levels)`);
  }

  // Feature 3: Raw IP Address Hostname
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    riskScore += 40;
    gaps.push('Raw numerical IPv4 address used without DNS registration');
  }

  // Feature 4: Hyphen Frequency Mimicry
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    riskScore += Math.min(25, hyphenCount * 8);
    gaps.push(`High hyphen count (${hyphenCount}) matching phishing mimicry`);
  }

  // Feature 5: Suspicious Disposable TLD
  if (RISKY_TLDS.some(tld => domain.endsWith(tld))) {
    riskScore += 30;
    gaps.push('Registered on high-risk disposable Top-Level Domain (TLD)');
  }

  // --------------------------------------------------------
  // GROUP 2: LEXICAL, ENTROPY & HEURISTICS (6 FEATURES)
  // --------------------------------------------------------
  // Feature 6: Phishing Keyword Matching
  const combinedPath = (domain + pathname).toLowerCase();
  DECEPTIVE_KEYWORDS.forEach(keyword => {
    if (combinedPath.includes(keyword)) {
      riskScore += 18;
      gaps.push(`Deceptive credential harvesting keyword "${keyword}" detected`);
    }
  });

  // Feature 7: Special Characters Frequency & Obfuscation (@, %, //, _)
  if (urlStr.includes('@')) {
    riskScore += 35;
    gaps.push('Credential injection "@" symbol detected in host string');
  }
  const specialChars = (urlStr.match(/[%_~]/g) || []).length;
  if (specialChars > 2) {
    riskScore += 15;
    gaps.push('High frequency of obfuscated / URL-encoded characters');
  }

  // Feature 8: Shannon String Entropy (DGA Autogen Detection)
  if (baseName.length > 8 && calculateEntropy(baseName) > 3.85) {
    riskScore += 22;
    gaps.push('Elevated Shannon entropy (Algorithmic DGA randomness)');
  }

  // Feature 9: Vowel-to-Consonant Ratio
  const cleanAlpha = baseName.replace(/[^a-z]/g, '');
  if (cleanAlpha.length >= 6) {
    const vowels = (cleanAlpha.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / cleanAlpha.length;
    if (vowelRatio < 0.14) {
      riskScore += 25;
      gaps.push(`Abnormal vowel ratio (${Math.round(vowelRatio * 100)}%) indicating DGA generation`);
    }

    // Feature 10: Unnatural Consonant Clusters (5+ in a row)
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanAlpha)) {
      riskScore += 20;
      gaps.push('Unnatural consecutive consonant cluster detected');
    }
  }

  // Feature 11: Digit Density & Trailing Number Padding
  const digits = domain.match(/\d/g) || [];
  const digitRatio = digits.length / domain.length;
  if (digitRatio > 0.30) {
    riskScore += 20;
    gaps.push(`High numeric density (${Math.round(digitRatio * 100)}% digits in hostname)`);
  } else if (/\d{4,}$/.test(baseName)) {
    riskScore += 15;
    gaps.push('Trailing numeric padding pattern detected');
  }

  // --------------------------------------------------------
  // GROUP 3: ADVANCED BRAND & IDENTITY SPOOFING (4 FEATURES)
  // --------------------------------------------------------
  // Feature 12: Punycode / Homoglyph Attack (IDN)
  if (domain.includes('xn--') || /[^\u0000-\u007F]/.test(domain)) {
    riskScore += 50;
    gaps.push('Homoglyph / Punycode (IDN) spoofing pattern detected');
  }

  // Feature 13: Levenshtein Distance / Brand Typosquatting
  for (const brand of MONITORED_BRANDS) {
    if (secondLevelName !== brand) {
      const dist = getLevenshteinDistance(secondLevelName, brand);
      if (dist === 1 && secondLevelName.length > 3) {
        riskScore += 45;
        gaps.push(`Typosquatting mimicry targeting known brand "${brand}" (Distance: 1)`);
        break;
      } else if (dist === 2 && secondLevelName.length >= 7) {
        riskScore += 25;
        gaps.push(`Fuzzy character mimicry targeting "${brand}"`);
        break;
      }
    }
  }

  // Feature 14: Subdomain Brand Stacking & TLD Confusion
  if (parts.length > 2) {
    const subdomainPart = parts.slice(0, -2).join('.');
    for (const brand of MONITORED_BRANDS) {
      if (subdomainPart.includes(brand)) {
        riskScore += 35;
        gaps.push(`Deceptive brand placement ("${brand}") embedded in subdomain prefix`);
        break;
      }
    }
    if (subdomainPart.includes('.com') || subdomainPart.includes('.net') || subdomainPart.includes('.org')) {
      riskScore += 30;
      gaps.push('Suspicious fake TLD token stacking inside subdomain');
    }
  }

  // Feature 15: Cloaked Link / URL Shortener Trap
  if (SHORTENERS.has(domain)) {
    riskScore += 25;
    gaps.push('Cloaked destination URL using generic link shortener service');
  }

  // --------------------------------------------------------
  // GROUP 4: PROTOCOL & PORT MARKERS (2 FEATURES)
  // --------------------------------------------------------
  // Feature 16: Protocol Safety (HTTP vs HTTPS)
  if (protocol === 'http:' && !domain.includes('localhost') && domain !== '127.0.0.1') {
    riskScore += 25;
    gaps.push('Insecure cleartext HTTP transmission protocol');
  }

  // Feature 17: Non-Standard Web Port Presence
  if (port && port !== '80' && port !== '443') {
    riskScore += 25;
    gaps.push(`Suspicious non-standard web traffic port (:${port})`);
  }

  // Calculate final score bounded between [10, 100]
  const finalScore = Math.max(10, Math.min(100, 100 - riskScore));
  const verdict = finalScore >= 75 ? 'Safe' : (finalScore >= 45 ? 'Moderate' : 'Critical');

  return {
    score: finalScore,
    verdict,
    gaps: gaps.length > 0 ? gaps : ['No anomalous heuristics detected.']
  };
}