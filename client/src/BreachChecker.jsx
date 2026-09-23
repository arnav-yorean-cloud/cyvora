import React, { useState } from 'react';

/**
 * Cyvora Production Breach Checker Component
 * Integrated with the official XposedOrNot REST API via Cyvora backend
 */
export default function BreachChecker({ currentUser }) {
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleCheckBreach = async (overrideEmail) => {
    const targetEmail = (overrideEmail || emailInput).trim();
    setError(null);

    if (!targetEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!EMAIL_REGEX.test(targetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Cyvora backend route: POST /api/tools/breach-check
      const token = currentUser?.id || localStorage.getItem('cyvora_user') || 'cyvora-authenticated-session';
      const response = await fetch('http://localhost:5000/api/tools/breach-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        const errorData = data.error || {};
        if (response.status === 429 || errorData.code === 'RATE_LIMITED') {
          setError('XposedOrNot rate limit reached. Please try again later.');
        } else if (response.status === 400 || errorData.code === 'INVALID_EMAIL') {
          setError('Please enter a valid email address.');
        } else {
          setError(errorData.message || 'Breach intelligence service is temporarily unavailable. Please try again.');
        }
      }
    } catch (err) {
      setError('Breach intelligence service is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmailInput('');
    setResult(null);
    setError(null);
    setSearchTerm('');
  };

  // Filter breaches by search query
  const filteredBreaches = result?.breaches?.filter(b => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.name?.toLowerCase().includes(term) ||
      b.domain?.toLowerCase().includes(term) ||
      b.exposedData?.some(d => d.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn text-left font-sans">
      {/* Header Segment */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-black text-rose-500 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            CYVORA THREAT RADAR // XPOSEDORNOT ENGINE
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white font-mono tracking-wider uppercase mt-1">
            DATA BREACH INTELLIGENCE CHECKER
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Audit your email against billions of known credential records compromised in public cyber incidents, database leaks, and underground dumps.
          </p>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto h-9 px-4 rounded-xl border border-white/10 bg-white/5 font-mono text-xs font-bold tracking-wider text-slate-300 uppercase hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
          >
            New Scan
          </button>
        )}
      </div>

      {/* Input / Control Terminal */}
      <div className="rounded-2xl border border-purple-500/20 bg-[#0f172a]/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckBreach();
          }}
          className="space-y-4 relative z-10"
        >
          <label className="block text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            TARGET EMAIL SIGNATURE
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@example.com"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#070a13]/80 border border-slate-700/60 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-11 sm:h-auto px-8 rounded-xl font-mono text-xs font-bold tracking-widest uppercase text-white shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-purple-500/20 active:scale-95 shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>AUDITING...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>CHECK BREACH</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Pre-fill Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-slate-400">
            <span className="text-slate-500 uppercase tracking-wider">Quick test:</span>
            <button
              type="button"
              onClick={() => {
                setEmailInput('test@example.com');
                handleCheckBreach('test@example.com');
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              Demo: Breached Email (test@example.com)
            </button>
            <button
              type="button"
              onClick={() => {
                const safeDemo = 'safe-audit-operator@cyvora.org';
                setEmailInput(safeDemo);
                handleCheckBreach(safeDemo);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Demo: Safe Clean Email
            </button>
          </div>
        </form>

        {/* User-friendly Error Display */}
        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-start gap-3 animate-fadeIn font-mono text-xs">
            <svg className="w-5 h-5 shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-bold uppercase tracking-wider">Audit Alert</div>
              <div className="mt-0.5 text-slate-300 font-sans text-xs">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Radar Animation State */}
      {isLoading && (
        <div className="rounded-2xl border border-purple-500/20 bg-[#0b0f19]/80 p-12 text-center shadow-2xl space-y-4 animate-fadeIn">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-purple-400 font-mono text-xl">
              🛡️
            </div>
          </div>
          <div className="font-mono text-sm font-black tracking-wider text-white uppercase">
            Auditing Global Breach Telemetry
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Querying XposedOrNot Free REST API nodes and cross-verifying indexed credential leak signatures...
          </p>
        </div>
      )}

      {/* RESULT VIEWPORT */}
      {result && !isLoading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Status Banner Card */}
          <div className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden ${
            result.breached
              ? 'border-red-500/30 bg-gradient-to-br from-red-950/40 via-[#0b0f19] to-[#070a13]'
              : 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-[#0b0f19] to-[#070a13]'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-mono text-xs font-black tracking-widest uppercase border ${
                    result.breached
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  }`}>
                    {result.breached ? 'STATUS: EXPOSED' : 'STATUS: NO KNOWN BREACHES FOUND'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Source: {result.source || 'XposedOrNot'}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Queried Identifier:</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide break-all">
                    {result.email}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {result.breached
                    ? `Warning: This email was detected in ${result.breachCount} verified public data incident${result.breachCount === 1 ? '' : 's'}. Immediate credential rotation is recommended.`
                    : 'Good news! This email does not appear in any cataloged public database breaches tracked by XposedOrNot.'}
                </p>
              </div>

              {/* Big Metric Box */}
              <div className={`p-6 rounded-xl border text-center shrink-0 min-w-[160px] font-mono ${
                result.breached
                  ? 'border-red-500/20 bg-red-500/5 text-red-400'
                  : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
              }`}>
                <div className="text-4xl sm:text-5xl font-black">
                  {result.breachCount}
                </div>
                <div className="text-[11px] font-bold tracking-widest uppercase mt-1 text-slate-400">
                  Breaches Found
                </div>
              </div>
            </div>
          </div>

          {/* BREACHED STATE DETAILS */}
          {result.breached && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Breach Incident Cards (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                  <div className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Compromised Records Catalog</span>
                    <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {filteredBreaches.length} of {result.breachCount}
                    </span>
                  </div>

                  {result.breachCount > 3 && (
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter breaches..."
                      className="px-3 py-1.5 bg-[#070a13] border border-slate-700/60 rounded-lg text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                  {filteredBreaches.length === 0 ? (
                    <div className="p-6 rounded-xl border border-white/5 bg-[#0b0f19] text-center text-xs font-mono text-slate-400">
                      No breaches matching "{searchTerm}".
                    </div>
                  ) : (
                    filteredBreaches.map((breach, index) => (
                      <div
                        key={`${breach.name}-${index}`}
                        className="rounded-xl border border-white/10 bg-[#0f172a]/60 hover:bg-[#0f172a]/90 p-5 space-y-3 transition-all duration-200 shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {breach.logoUrl ? (
                              <img
                                src={breach.logoUrl}
                                alt={breach.name}
                                className="w-10 h-10 rounded-lg object-contain bg-black/40 p-1 border border-white/10 shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-mono text-xs font-black shrink-0">
                                ⚠️
                              </div>
                            )}

                            <div>
                              <div className="font-mono text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                                {breach.name}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                {breach.domain || 'Domain unspecified'} • {breach.breachDate !== 'Unknown' ? breach.breachDate : 'Date unrecorded'}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[10px]">
                            {breach.verified && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                                Verified
                              </span>
                            )}
                            {breach.recordsExposed > 0 && (
                              <span className="text-slate-400">
                                {breach.recordsExposed.toLocaleString()} records
                              </span>
                            )}
                          </div>
                        </div>

                        {breach.description && (
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {breach.description}
                          </p>
                        )}

                        {/* Exposed Data Categories */}
                        {breach.exposedData && breach.exposedData.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                              Exposed Sensitive Parameters:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {breach.exposedData.map((dataItem, dIdx) => {
                                const isCritical = /password|hash|pin|social|secret/i.test(dataItem);
                                return (
                                  <span
                                    key={dIdx}
                                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-medium border ${
                                      isCritical
                                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {dataItem}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Password Risk & References */}
                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
                          {breach.passwordRisk && breach.passwordRisk !== 'unknown' && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <span>Password Risk:</span>
                              <strong className="uppercase">{breach.passwordRisk}</strong>
                            </span>
                          )}
                          <a
                            href={breach.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 ml-auto"
                          >
                            <span>XposedOrNot Record</span>
                            <span>↗</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Actionable Remediation Checklist */}
              <div className="space-y-4">
                <div className="font-mono text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span>RECOMMENDED ACTIONS</span>
                </div>

                <div className="rounded-xl border border-yellow-500/20 bg-[#0f172a]/80 p-5 space-y-4 shadow-xl text-xs font-mono">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-yellow-500/20 space-y-1">
                      <div className="font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                        <span>1. Change Affected Passwords</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        Immediately rotate credentials for the affected services listed above, as well as any other accounts sharing similar passwords.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-yellow-500/20 space-y-1">
                      <div className="font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                        <span>2. Eliminate Password Reuse</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        Credential stuffing attacks leverage passwords stolen from one site to gain unauthorized access to email, banking, and shopping portals.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-yellow-500/20 space-y-1">
                      <div className="font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                        <span>3. Enable Two-Factor Auth (2FA)</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        Enforce app-based TOTP (Google Authenticator, Bitwarden) or hardware FIDO keys to protect against compromised credentials.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-yellow-500/20 space-y-1">
                      <div className="font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                        <span>4. Review Account Activity</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        Inspect active sessions, connected OAuth devices, and forwarding rules in your primary email inbox.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-yellow-500/20 space-y-1">
                      <div className="font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                        <span>5. Use Password Manager</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                        Generate and store high-entropy random passwords (20+ characters) with an encrypted password vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLEAN STATE: NO KNOWN BREACHES FOUND */}
          {!result.breached && (
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0f172a]/60 p-8 space-y-6 shadow-xl font-mono text-xs">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg">
                  ✓
                </span>
                <span>CLEAN CREDENTIAL REPORT</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/10 space-y-2">
                <div className="text-white font-bold uppercase tracking-wide">
                  No known breaches were found for this email.
                </div>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Your address does not match any compromised records in the XposedOrNot leak repository.
                </p>
              </div>

              {/* Official Disclaimer as required */}
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 space-y-2 text-yellow-300/90 font-sans text-xs">
                <div className="font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>SECURITY DISCLAIMER</span>
                </div>
                <p className="leading-relaxed">
                  Absence from this database does not guarantee that an account has never been compromised. This tool audits indexed public leaks and cyber telemetry; zero-day compromises, targeted spear phishing, unindexed private breaches, or malware on local endpoints may not appear here. Maintain active vigilance, use unique passwords, and keep 2FA enabled.
                </p>
              </div>

              {/* Proactive Hygiene Tips */}
              <div className="pt-2">
                <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  PROACTIVE SECURITY MEASURES:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
                    <div className="font-bold text-white text-[11px] uppercase">Unique Passwords</div>
                    <div className="font-sans text-[11px] text-slate-400">Never share credentials across accounts.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
                    <div className="font-bold text-white text-[11px] uppercase">2FA Everywhere</div>
                    <div className="font-sans text-[11px] text-slate-400">Enforce multi-factor verification on all major portals.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
                    <div className="font-bold text-white text-[11px] uppercase">Periodic Checks</div>
                    <div className="font-sans text-[11px] text-slate-400">Re-audit periodically to detect newly indexed incidents.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
