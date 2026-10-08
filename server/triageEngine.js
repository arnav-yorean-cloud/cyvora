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

// Shannon Entropy Calculation for algorithmic randomness detection
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

// Lightweight Lexical Model (Evaluates structural phishing patterns)
function evaluateLexicalFeatures(domain) {
  let riskScore = 0;
  const gaps = [];

  // 1. Domain Length & Hyphen Mimicry
  if (domain.length > 32) {
    riskScore += 15;
    gaps.push('Anomalous domain length');
  }
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    riskScore += hyphenCount * 10;
    gaps.push(`High hyphen count (${hyphenCount}) matching phishing mimicry`);
  }

  // 2. High-Risk TLD Detection
  const riskyTLDs = ['.xyz', '.top', '.work', '.click', '.loan', '.gq', '.tk', '.cf', '.buzz'];
  if (riskyTLDs.some(tld => domain.endsWith(tld))) {
    riskScore += 30;
    gaps.push('High-risk disposable Top-Level Domain (TLD)');
  }

  // 3. Phishing Keyword Spoofing in Subdomains
  const deceptiveKeywords = ['login', 'verify', 'secure', 'account', 'update', 'banking', 'wallet', 'token'];
  const subparts = domain.split('.');
  if (subparts.length > 2) {
    const subdomain = subparts.slice(0, -2).join('.');
    deceptiveKeywords.forEach(word => {
      if (subdomain.includes(word)) {
        riskScore += 25;
        gaps.push(`Deceptive keyword "${word}" in subdomain context`);
      }
    });
    if (subparts.length >= 4) {
      riskScore += 15;
      gaps.push('Deep subdomain nesting (>3 levels)');
    }
  }

  // 4. IP-as-a-hostname Detection
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    riskScore += 40;
    gaps.push('Direct raw IPv4 address used instead of hostname');
  }

  // 5. Lexical Randomness / Domain Generation Algorithm (DGA)
  const baseName = subparts[0] || '';
  if (baseName.length > 8 && calculateEntropy(baseName) > 3.8) {
    riskScore += 20;
    gaps.push('High Shannon entropy (Potential DGA generation)');
  }

  return { riskScore, gaps };
}

// Fast Triage orchestrator
async function runFastTriage(domain) {
  // Check Whitelist
  if (TOP_WHITELIST.has(domain)) {
    return { score: 98, verdict: 'Safe', gaps: [] };
  }
  const parts = domain.split('.');
  if (parts.length > 2 && TOP_WHITELIST.has(parts.slice(-2).join('.'))) {
    return { score: 98, verdict: 'Safe', gaps: [] };
  }

  const lexical = evaluateLexicalFeatures(domain);
  let baseScore = Math.max(10, 100 - lexical.riskScore);

  // Fast DNS Validation (Check if domain is live & verified)
  try {
    const [txt] = await Promise.allSettled([dnsPromises.resolveTxt(`_dmarc.${domain}`)]);
    let hasDMARC = false;
    if (txt.status === 'fulfilled') {
      hasDMARC = txt.value.some(entry => entry.join('').includes('v=DMARC1'));
    }
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

module.exports = { runFastTriage, TOP_WHITELIST };