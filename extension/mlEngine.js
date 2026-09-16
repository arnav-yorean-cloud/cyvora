// ============================================================================
// CYVORA ADVANCED LEXICAL ML & HEURISTIC ENGINE (v2.0)
// ============================================================================

// High-value targets protected against typosquatting & mimicry
const PROTECTED_BRANDS = [
  'google', 'paypal', 'microsoft', 'apple', 'amazon', 'netflix',
  'github', 'facebook', 'instagram', 'whatsapp', 'linkedin',
  'binance', 'coinbase', 'cloudflare', 'twitter', 'discord'
];

const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'loan', 'gq', 'tk', 'cf', 'buzz',
  'country', 'kim', 'fit', 'surf', 'rest', 'men', 'party', 'live', 'cam'
]);

const DECEPTIVE_KEYWORDS = [
  'login', 'verify', 'secure', 'account', 'update', 'banking',
  'wallet', 'token', 'auth', 'recover', 'confirm', 'validation'
];

// Helper: Levenshtein distance algorithm for string similarity
function getLevenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Helper: Shannon Entropy calculation for randomized strings
function calculateEntropy(str) {
  const len = str.length;
  if (len === 0) return 0;
  const freqs = {};
  for (const char of str) freqs[char] = (freqs[char] || 0) + 1;
  return Object.values(freqs).reduce((sum, f) => {
    const p = f / len;
    return sum - p * Math.log2(p);
  }, 0);
}

export function runLocalMLClassification(rawDomain) {
  const domain = rawDomain.toLowerCase().replace(/^www\./, '');
  let penalty = 0;
  const gaps = [];

  // DEBUG/TEST HOOK: Verify red warning screen on demand
  if (domain.includes('example.com') || domain.includes('badsite.test')) {
    return {
      score: 22,
      verdict: 'Critical',
      gaps: [
        'Active Phishing Signature Detected',
        'Disposable Untrusted TLD',
        'Missing Cryptographic Identity'
      ]
    };
  }

  // 1. Punycode / IDN Homograph Exploit Check (e.g. xn--appl-43d.com)
  if (domain.startsWith('xn--') || domain.includes('.xn--')) {
    penalty += 45;
    gaps.push('IDN Punycode Homograph Token Detected (Lookalike Cyrillic/Greek Spoofing)');
  }

  // 2. Direct Raw IPv4 Bypass
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    penalty += 40;
    gaps.push('Raw IPv4 Target: Host operates without valid domain registry credentials');
  }

  // Domain structure breakdown
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const sld = parts.length >= 2 ? parts[parts.length - 2] : '';
  const subdomain = parts.slice(0, -2).join('.');

  // 3. High-Risk / Disposable TLD Screening
  if (HIGH_RISK_TLDS.has(tld)) {
    penalty += 30;
    gaps.push(`High-Risk TLD (.${tld}): Frequently associated with automated burner infrastructure`);
  }

  // 4. Brand Typosquatting / Homoglyph Detection (Levenshtein Distance = 1 or 2)
  for (const brand of PROTECTED_BRANDS) {
    // Check if the domain parts closely match a protected brand without being the brand
    if (sld !== brand) {
      const dist = getLevenshteinDistance(sld, brand);
      if (dist === 1 || (dist === 2 && sld.length > 5)) {
        penalty += 45;
        gaps.push(`Brand Impersonation Vector: "${sld}" closely mimics trusted target "${brand}"`);
        break;
      }
    }
  }

  // 5. Deceptive Credential Tokens in Subdomains or Path Mimicry
  if (subdomain) {
    for (const token of DECEPTIVE_KEYWORDS) {
      if (subdomain.includes(token)) {
        penalty += 25;
        gaps.push(`Credential Harvesting Token: "${token}" detected inside subdomain prefix`);
        break;
      }
    }
  }

  // 6. Deep Subdomain Chaining / DNS Tunneling (More than 3 sub-levels)
  if (parts.length > 4) {
    penalty += 20;
    gaps.push(`Excessive Subdomain Chaining (${parts.length - 1} levels): Potential DNS tunneling route`);
  }

  // 7. Hyphen Mimicry Flooding
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    penalty += Math.min(30, hyphenCount * 10);
    gaps.push(`Compound Hyphen Partitioning (${hyphenCount} hyphens): Pattern mirrors phishing redirection chains`);
  }

  // 8. Digit Density Ratio (DGA / Bot-generated strings)
  const digitCount = (sld.match(/\d/g) || []).length;
  if (sld.length > 5 && (digitCount / sld.length) > 0.35) {
    penalty += 20;
    gaps.push('Anomalous Digit Density: Numerical ratio indicates automated domain generation');
  }

  // 9. Shannon Entropy Threshold (Algorithmic / DGA domains)
  const entropy = calculateEntropy(sld);
  if (entropy > 3.85 && sld.length > 10) {
    penalty += 25;
    gaps.push(`High Shannon Entropy (${entropy.toFixed(2)} bits): Character distribution indicates DGA generation`);
  }

  // Calculate final score bounded between 10 and 100
  const finalScore = Math.max(10, 100 - penalty);
  const verdict = finalScore >= 75 ? 'Safe' : (finalScore >= 45 ? 'Moderate' : 'Critical');

  return {
    score: finalScore,
    verdict,
    gaps
  };
}