import { useState } from 'react'

function FlagImg({ src, cls = 'flag-sm' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className={cls} style={{ background: '#3a4a3d', display: 'inline-block', borderRadius: 2 }} />
  return <img src={src} alt="" className={cls} onError={() => setErr(true)} />
}

export default function TournamentSim() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [showGroups, setShowGroups] = useState(false)

  async function simulate() {
    setLoading(true)
    setErr(null)
    setResult(null)
    setShowGroups(false)
    try {
      const res = await fetch('/api/simulate/tournament', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="section-title">SIMULATE <span>TOURNAMENT</span></h2>
      <p className="section-sub">Run a single full World Cup simulation from group stage to final</p>

      <button className="sim-btn" onClick={simulate} disabled={loading}>
        {loading ? 'Simulating...' : 'Run Full Tournament'}
      </button>

      {err && <div className="error-msg">{err}</div>}

      {result && (
        <>
          {/* Champion */}
          <div className="champion-banner">
            <div className="champion-label">World Cup 2026 Champion</div>
            <FlagImg src={result.champion_flag} cls="champion-flag" />
            <div className="champion-name">{result.champion}</div>
            <div style={{ fontSize: 12, color: '#8a9e8e', letterSpacing: 2 }}>
              WORLD CHAMPION
            </div>
          </div>

          {/* Toggle group stage results */}
          <button
            onClick={() => setShowGroups(v => !v)}
            style={{
              background: 'transparent',
              border: '1px solid #3a4a3d',
              color: '#8a9e8e',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 20,
              cursor: 'pointer',
            }}
          >
            {showGroups ? 'Hide' : 'Show'} Group Results
          </button>

          {showGroups && (
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ fontSize: 22, marginBottom: 16 }}>GROUP <span>RESULTS</span></div>
              <div className="groups-grid">
                {Object.entries(result.groups).map(([group, standings]) => (
                  <div key={group} className="group-card">
                    <div className="group-header">
                      <span className="group-label">{group}</span>
                    </div>
                    <div className="group-body">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, auto)', gap: '0 8px', padding: '6px 16px 2px', fontSize: 10, fontWeight: 600, letterSpacing: 1, color: '#8a9e8e', textTransform: 'uppercase' }}>
                        <span>Team</span><span>W</span><span>D</span><span>L</span><span>Pts</span>
                      </div>
                      {standings.map((s, i) => (
                        <div key={s.team} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, auto)', gap: '0 8px', padding: '6px 16px', alignItems: 'center', background: i < 2 ? 'rgba(26,107,53,0.08)' : 'transparent', borderLeft: i < 2 ? '3px solid #1a6b35' : '3px solid transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FlagImg src={s.flag_url} cls="flag-sm" />
                            <span style={{ fontSize: 13, fontWeight: i < 2 ? 700 : 500 }}>{s.team}</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#8a9e8e', textAlign: 'center' }}>{s.wins}</span>
                          <span style={{ fontSize: 12, color: '#8a9e8e', textAlign: 'center' }}>{s.draws}</span>
                          <span style={{ fontSize: 12, color: '#8a9e8e', textAlign: 'center' }}>{s.losses}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: i < 2 ? '#2dbd5a' : '#f0f4f0', textAlign: 'center' }}>{s.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knockout rounds */}
          <div className="section-title" style={{ fontSize: 22, marginBottom: 16 }}>KNOCKOUT <span>BRACKET</span></div>
          <div className="knockout-rounds">
            {(() => {
              const ORDER = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final']
              const sorted = ORDER.filter(r => result.knockout[r]).map(r => [r, result.knockout[r]])
              return sorted
            })().map(([round, matches]) => (
              <div key={round} className="round-block">
                <div className="round-header">{round}</div>
                <div className="round-matches">
                  {matches.map((m, i) => (
                    <div key={i} className="ko-match">
                      <div className={`ko-team${m.winner === m.team1 ? ' winner' : ''}`}>
                        <FlagImg src={m.flag1} cls="flag-sm" />
                        <span>{m.team1}</span>
                      </div>
                      <div className="ko-divider" />
                      <div className={`ko-team${m.winner === m.team2 ? ' winner' : ''}`}>
                        <FlagImg src={m.flag2} cls="flag-sm" />
                        <span>{m.team2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
