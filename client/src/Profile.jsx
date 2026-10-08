import React, { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:5000';

function StatusBadge({ status }) {
  const safe = status === 'TRUSTED';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black tracking-widest ${
      safe
        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
        : 'border-red-400/30 bg-red-400/10 text-red-300'
    }`}>
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function getScanStatus(scan) {
  if (typeof scan.score === 'number') return scan.score >= 75 ? 'TRUSTED' : 'UNTRUSTED';
  const text = String(scan.statusText || '').toLowerCase();
  return text.includes('safe') || scan.grade === 'A' || scan.grade === 'B' ? 'TRUSTED' : 'UNTRUSTED';
}

export default function Profile({ email, username, currentUser }) {
  const [profile, setProfile] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const identity = email || currentUser?.email;
      if (!identity) {
        setLoading(false);
        setError('No active user session found.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [profileRes, historyRes] = await Promise.all([
          fetch(`${API}/api/profile?email=${encodeURIComponent(identity)}`),
          fetch(`${API}/api/history/user?email=${encodeURIComponent(identity)}`)
        ]);

        const profileData = await profileRes.json();
        const historyData = await historyRes.json();

        if (!profileRes.ok) throw new Error(profileData.message || 'Unable to load profile.');
        if (!historyRes.ok) throw new Error(historyData.message || 'Unable to load scan history.');

        if (!cancelled) {
          setProfile(profileData.user || null);
          setScans(Array.isArray(historyData) ? historyData : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Profile service unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [email, currentUser?.email]);

  const stats = useMemo(() => {
    const total = scans.length;
    const trusted = scans.filter(s => getScanStatus(s) === 'TRUSTED').length;
    const untrusted = total - trusted;
    const scores = scans.map(s => Number(s.score)).filter(Number.isFinite);
    const average = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 100;

    // Scan-derived security score: average Cyvora safety score.
    return { total, trusted, untrusted, average };
  }, [scans]);

  const alerts = useMemo(() => {
    return scans
      .filter(scan => getScanStatus(scan) === 'UNTRUSTED')
      .slice(0, 4)
      .map(scan => ({
        domain: scan.domain || scan.url || 'Unknown target',
        score: Number.isFinite(Number(scan.score)) ? Number(scan.score) : null,
        date: scan.date || scan.createdAt || scan.timestamp
      }));
  }, [scans]);

  const displayName = profile?.username || username || currentUser?.username || email?.split('@')[0] || 'Cyvora User';
  const displayEmail = profile?.email || email || currentUser?.email || '—';

  if (loading) {
    return (
      <div className="flex-1 w-full overflow-y-auto p-6 md:p-10 flex items-center justify-center">
        <div className="rounded-2xl border border-purple-500/20 bg-[#111827]/70 px-8 py-6 text-center font-mono">
          <div className="text-xs font-black tracking-[0.3em] text-purple-300">LOADING PROFILE...</div>
          <div className="mt-2 text-[10px] text-slate-500">SYNCING CYVORA SECURITY TELEMETRY</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full overflow-y-auto p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-[#111827]/80 px-8 py-7 font-mono">
          <div className="text-sm font-black text-red-300">PROFILE SYNC FAILED</div>
          <p className="mt-2 text-xs text-slate-400">{error}</p>
          <p className="mt-4 text-[10px] text-slate-600">Make sure the Cyvora backend is running on port 5000.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-8 md:px-10 md:py-10 scroll-smooth animate-fadeIn relative z-10">
      <div className="mx-auto max-w-7xl space-y-6 pb-24">
        <div className="border-b border-white/5 pb-5">
          <div className="text-[10px] font-mono font-black tracking-[0.35em] text-purple-400">IDENTITY_NODE // USER_PROFILE</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black uppercase tracking-wider text-white">My Profile</h1>
          <p className="mt-2 text-xs font-mono text-slate-500">Identity, security posture and Cyvora scan telemetry.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Basic information */}
          <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black tracking-[0.25em] text-slate-500">01 // BASIC INFORMATION</div>
                <h2 className="mt-2 text-lg font-black text-white">Identity</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/10 text-xl font-black text-purple-300">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="FULL NAME / USERNAME" value={displayName} />
              <Info label="EMAIL" value={displayEmail} />
              <Info label="AGE" value={profile?.age || 'Not provided'} />
              <Info label="GENDER" value={profile?.gender || 'Not provided'} />
              <Info label="AUTH METHOD" value={(profile?.authMethod || 'email').toUpperCase()} />
              <Info label="ACCOUNT CREATED" value={formatDate(profile?.createdAt)} />
              <Info label="LAST ACTIVE" value={formatDate(profile?.lastActive)} />
            </div>
          </section>

          {/* Security score */}
          <section className="rounded-2xl border border-emerald-400/15 bg-[#0b1220]/80 p-6 shadow-2xl">
            <div className="text-[10px] font-black tracking-[0.25em] text-slate-500">02 // SECURITY SCORE</div>
            <div className="mt-5 flex items-center gap-5">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-8 border-emerald-400/20">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-300">{stats.average}</div>
                  <div className="text-[9px] font-black tracking-widest text-slate-500">/ 100</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-black uppercase text-white">
                  {stats.average >= 85 ? 'Excellent' : stats.average >= 75 ? 'Good' : stats.average >= 50 ? 'Needs Attention' : 'High Risk'}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">Based on your average Cyvora URL safety score.</p>
              </div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, stats.average))}%` }} />
            </div>
          </section>
        </div>

        {/* Cyvora activity */}
        <section className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-2xl">
          <div className="text-[10px] font-black tracking-[0.25em] text-slate-500">03 // CYVORA ACTIVITY</div>
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="TOTAL SCANS" value={stats.total} />
            <Stat label="TRUSTED" value={stats.trusted} valueClass="text-emerald-300" />
            <Stat label="UNTRUSTED" value={stats.untrusted} valueClass="text-red-300" />
            <Stat label="AVG ML SCORE" value={stats.average} valueClass="text-purple-300" />
          </div>
        </section>

        {/* Recent scans + alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black tracking-[0.25em] text-slate-500">04 // RECENT SCANS</div>
                <h2 className="mt-2 text-lg font-black text-white">Latest Security Checks</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-600">{Math.min(scans.length, 6)} shown</span>
            </div>

            <div className="mt-5 overflow-x-auto">
              {scans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs font-mono text-slate-600">No scans yet.</div>
              ) : (
                <table className="w-full min-w-[620px] text-left font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] tracking-widest text-slate-600">
                      <th className="pb-3">TARGET</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3">ML SCORE</th>
                      <th className="pb-3">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.slice(0, 6).map((scan, index) => {
                      const status = getScanStatus(scan);
                      return (
                        <tr key={`${scan.url}-${index}`} className="border-b border-white/5 last:border-0">
                          <td className="py-4 pr-4 max-w-[280px] truncate text-xs font-bold text-slate-200">{scan.domain || scan.url}</td>
                          <td className="py-4 pr-4"><StatusBadge status={status} /></td>
                          <td className="py-4 pr-4 text-xs font-black text-purple-300">{Number.isFinite(Number(scan.score)) ? Number(scan.score) : '—'}</td>
                          <td className="py-4 text-[10px] text-slate-500">{scan.date || scan.timestamp || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-red-400/10 bg-[#0b1220]/80 p-6 shadow-2xl">
            <div className="text-[10px] font-black tracking-[0.25em] text-slate-500">05 // SECURITY ALERTS</div>
            <h2 className="mt-2 text-lg font-black text-white">Attention Required</h2>
            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-5">
                  <div className="text-xs font-black text-emerald-300">NO ACTIVE ALERTS</div>
                  <p className="mt-2 text-[10px] leading-5 text-slate-500">No recent scan is below the Cyvora trusted threshold.</p>
                </div>
              ) : alerts.map((alert, index) => (
                <div key={`${alert.domain}-${index}`} className="rounded-xl border border-red-400/10 bg-red-400/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black tracking-wider text-red-300">UNTRUSTED TARGET</span>
                    {alert.score !== null && <span className="text-[10px] font-black text-red-400">SCORE {alert.score}</span>}
                  </div>
                  <div className="mt-2 truncate text-xs font-bold text-white">{alert.domain}</div>
                  <div className="mt-1 text-[9px] text-slate-600">{formatDate(alert.date)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[9px] font-black tracking-widest text-slate-600">{label}</div>
      <div className="mt-2 truncate text-xs font-bold text-slate-200">{value}</div>
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="text-[9px] font-black tracking-widest text-slate-600">{label}</div>
      <div className={`mt-2 text-2xl font-black ${valueClass}`}>{value}</div>
    </div>
  );
}
