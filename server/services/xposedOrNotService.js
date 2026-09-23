/**
 * Cyvora Security Engine - XposedOrNot Integration Service
 * 
 * Communicates with the official XposedOrNot FREE REST API:
 * GET https://api.xposedornot.com/v1/check-email/{email}?details=true
 * 
 * Features:
 * - URL encoded query paths
 * - Built-in timeout enforcement
 * - Normalized Cyvora schema
 * - Privacy protection (no plaintext logging)
 * - Safe handling for 200, 404, 429, 5xx, and network errors
 */

const XPOSED_OR_NOT_BASE_URL = 'https://api.xposedornot.com/v1/check-email';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Normalizes individual breach record data safely handling missing fields
 */
function normalizeBreachDetail(detail, fallbackName = 'Unknown Incident') {
  if (!detail) {
    return {
      name: fallbackName,
      domain: '',
      breachDate: 'Unknown',
      exposedData: [],
      recordsExposed: 0,
      passwordRisk: 'unknown',
      verified: false,
      description: '',
      industry: '',
      logoUrl: '',
      referenceUrl: `https://xposedornot.com/breaches#${encodeURIComponent(fallbackName)}`
    };
  }

  // If detail is a plain string name (when breach_details is not supplied)
  if (typeof detail === 'string') {
    return {
      name: detail,
      domain: '',
      breachDate: 'Unknown',
      exposedData: [],
      recordsExposed: 0,
      passwordRisk: 'unknown',
      verified: false,
      description: '',
      industry: '',
      logoUrl: '',
      referenceUrl: `https://xposedornot.com/breaches#${encodeURIComponent(detail)}`
    };
  }

  const name = detail.name || detail.title || fallbackName;
  const companyName = detail.company?.name || detail.domain || '';
  const breachDate = detail.breach_date || detail.date || 'Unknown';
  
  // Normalize exposed data categories into array of clean strings
  let exposedData = [];
  if (Array.isArray(detail.exposed_data)) {
    exposedData = detail.exposed_data.map(item => String(item).trim()).filter(Boolean);
  } else if (typeof detail.exposed_data === 'string') {
    exposedData = detail.exposed_data.split(',').map(s => s.trim()).filter(Boolean);
  }

  const recordsExposed = typeof detail.records_exposed === 'number'
    ? detail.records_exposed
    : parseInt(detail.records_exposed, 10) || 0;

  const passwordRisk = (detail.security?.password_risk || detail.password_risk || 'unknown').toLowerCase();
  const verified = Boolean(detail.security?.is_verified ?? detail.verified ?? false);
  const description = detail.description ? String(detail.description).replace(/<[^>]*>?/gm, '') : '';
  const industry = detail.company?.industry || detail.industry || '';
  const logoUrl = detail.company?.logo_url || detail.logo_url || '';
  const referenceUrl = `https://xposedornot.com/breaches#${encodeURIComponent(name)}`;

  return {
    name,
    domain: companyName,
    breachDate,
    exposedData,
    recordsExposed,
    passwordRisk,
    verified,
    description,
    industry,
    logoUrl,
    referenceUrl
  };
}

/**
 * Checks an email against the XposedOrNot Breach Database
 * 
 * @param {string} email - Normalized target email address
 * @returns {Promise<{ breached: boolean, breachCount: number, breaches: Array, source: string }>}
 */
async function checkEmailBreaches(email) {
  if (!email || typeof email !== 'string') {
    const error = new Error('Please enter a valid email address.');
    error.code = 'INVALID_EMAIL';
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.trim().toLowerCase();
  const encodedEmail = encodeURIComponent(cleanEmail);
  const targetUrl = `${XPOSED_OR_NOT_BASE_URL}/${encodedEmail}?details=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cyvora-Breach-Checker/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // HTTP 404: Definitely not found in breach database
    if (response.status === 404) {
      return {
        breached: false,
        breachCount: 0,
        breaches: [],
        source: 'XposedOrNot'
      };
    }

    // HTTP 429: Rate limit exceeded
    if (response.status === 429) {
      const error = new Error('XposedOrNot rate limit reached. Please try again later.');
      error.code = 'RATE_LIMITED';
      error.statusCode = 429;
      throw error;
    }

    // HTTP 5xx: Third-party upstream server errors
    if (response.status >= 500) {
      const error = new Error('Breach intelligence service is temporarily unavailable. Please try again.');
      error.code = 'SERVICE_UNAVAILABLE';
      error.statusCode = 503;
      throw error;
    }

    // Attempt to parse JSON response
    let rawData;
    try {
      rawData = await response.json();
    } catch {
      // If parsing fails but status was 200, check if it was empty/not found text
      return {
        breached: false,
        breachCount: 0,
        breaches: [],
        source: 'XposedOrNot'
      };
    }

    // Check for explicit "Not found" responses
    // XposedOrNot returns HTTP 200 with {"Error": "Not found", "email": null} for clean emails
    if (
      rawData.Error === 'Not found' ||
      rawData.status === 'not_found' ||
      rawData.status === 'clean' ||
      rawData.message === 'No breaches found' ||
      (Array.isArray(rawData.breaches) && rawData.breaches.length === 0)
    ) {
      return {
        breached: false,
        breachCount: 0,
        breaches: [],
        source: 'XposedOrNot'
      };
    }

    // Parse breaches
    let normalizedBreaches = [];

    // Detailed breach items are in rawData.breach_details
    if (Array.isArray(rawData.breach_details) && rawData.breach_details.length > 0) {
      normalizedBreaches = rawData.breach_details.map(item => normalizeBreachDetail(item));
    } else if (Array.isArray(rawData.breaches)) {
      // Sometimes rawData.breaches is an array of arrays or array of strings, e.g. [["ToonDoo", "BigBasket"]]
      const breachNames = Array.isArray(rawData.breaches[0])
        ? rawData.breaches[0]
        : rawData.breaches;

      normalizedBreaches = breachNames.map(name => normalizeBreachDetail(null, name));
    }

    const breachCount = normalizedBreaches.length;
    const breached = breachCount > 0;

    return {
      breached,
      breachCount,
      breaches: normalizedBreaches,
      source: 'XposedOrNot'
    };

  } catch (err) {
    clearTimeout(timeoutId);

    // Distinguish between our thrown custom errors and network/timeout failures
    if (err.code === 'RATE_LIMITED' || err.code === 'INVALID_EMAIL' || err.code === 'SERVICE_UNAVAILABLE') {
      throw err;
    }

    if (err.name === 'AbortError' || err.code === 'ETIMEDOUT') {
      const error = new Error('Breach intelligence service is temporarily unavailable. Please try again.');
      error.code = 'SERVICE_UNAVAILABLE';
      error.statusCode = 503;
      throw error;
    }

    // Generic network or unexpected upstream error
    const error = new Error('Breach intelligence service is temporarily unavailable. Please try again.');
    error.code = 'SERVICE_UNAVAILABLE';
    error.statusCode = 503;
    throw error;
  }
}

module.exports = {
  checkEmailBreaches,
  normalizeBreachDetail
};
