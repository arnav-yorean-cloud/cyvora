// Lightweight Lexical ML Feature Extractor & Decision Classifier
export function runLocalMLClassification(domain) {
    // TEST TRIGGER: Instantly triggers the Red Block Screen for testing
  if (domain.includes('example.com') || domain.includes('badsite.test')) {
    return {
      score: 22,
      verdict: 'Critical',
      gaps: ['Active Phishing Signature Detected', 'Disposable Untrusted TLD', 'Missing Cryptographic Identity']
    };
  }
  let penalty = 0;
  const gaps = [];

  // 1. Shannon Entropy calculation (checks for randomly generated domains / DGA)
  const len = domain.length;
  const freqs = {};
  for (const char of domain) freqs[char] = (freqs[char] || 0) + 1;
  const entropy = Object.values(freqs).reduce((sum, f) => {
    const p = f / len;
    return sum - p * Math.log2(p);
  }, 0);

  if (entropy > 3.85 && len > 12) {
    penalty += 25;
    gaps.push('High Shannon Entropy (Suspected Algorithmic Domain/DGA)');
  }

  // 2. Phishing Hyphen Mimicry
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    penalty += hyphenCount * 12;
    gaps.push(`Suspicious hyphen count (${hyphenCount}) matching phishing mimicry`);
  }

  // 3. Risky / Burner TLDs
  const highRiskTLDs = ['.xyz', '.top', '.work', '.click', '.loan', '.gq', '.tk', '.cf', '.buzz', '.country', '.kim'];
  if (highRiskTLDs.some(tld => domain.endsWith(tld))) {
    penalty += 30;
    gaps.push('High-risk disposable Top-Level Domain (TLD)');
  }

  // 4. IP-based URL target
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    penalty += 45;
    gaps.push('Direct raw IPv4 address used instead of hostname');
  }

  // 5. Deceptive Target Keywords in Subdomains
  const deceptiveKeywords = ['login', 'verify', 'secure', 'account', 'update', 'banking', 'wallet', 'token', 'auth'];
  const parts = domain.split('.');
  if (parts.length > 2) {
    const subdomain = parts.slice(0, -2).join('.');
    deceptiveKeywords.forEach(keyword => {
      if (subdomain.includes(keyword)) {
        penalty += 25;
        gaps.push(`Deceptive credential token "${keyword}" found in subdomain`);
      }
    });
  }

  const finalScore = Math.max(15, 100 - penalty);
  const verdict = finalScore >= 75 ? 'Safe' : (finalScore >= 45 ? 'Moderate' : 'Critical');

  return { score: finalScore, verdict, gaps };
}