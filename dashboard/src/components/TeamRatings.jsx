import { useEffect, useState } from 'react'

function FlagImg({ src }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className="flag" style={{ background: '#3a4a3d', display: 'inline-block', borderRadius: 3 }} />
  return <img src={src} alt="" className="flag" onError={() => setErr(true)} />
}

function rankClass(i) {
  if (i === 0) return 'gold'
  if (i === 1) return 'silver'
  if (i === 2) return 'bronze'
  return 'plain'
}

function fmtMarket(v) {
  if (!v) return '—'
  if (v >= 1e9) return `€${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `€${(v / 1e6).toFixed(0)}M`
  return `€${(v / 1e3).toFixed(0)}K`
}

const CONF_COLORS = {
  UEFA:     { bg: 'rgba(52,100,196,.2)',  c: '#7aafff' },
  CONMEBOL: { bg: 'rgba(34,136,63,.2)',   c: '#2dbd5a' },
  CONCACAF: { bg: 'rgba(212,160,23,.2)',  c: '#d4a017' },
  CAF:      { bg: 'rgba(192,57,43,.2)',   c: '#e74c3c' },
  AFC:      { bg: 'rgba(155,89,182,.2)',  c: '#c39bd3' },
  OFC:      { bg: 'rgba(26,188,156,.2)',  c: '#1abc9c' },
}

export default function TeamRatings() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [search, setSearch] = useState('')
  const [confFilter, setConfFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then(d => { setTeams(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading team ratings...</span></div>
  if (err)     return <div className="error-msg">Failed to load: {err}</div>

  const confs = ['ALL', ...Array.from(new Set(teams.map(t => t.confederation).filter(Boolean))).sort()]

  const filtered = teams.filter(t => {
    const matchName = t.name.toLowerCase().includes(search.toLowerCase())
    const matchConf = confFilter === 'ALL' || t.confederation === confFilter
    return matchName && matchConf
  })

  const maxRating = teams[0]?.rating || 1

  return (
    <div>
      <h2 className="section-title">TEAM <span>RATINGS</span></h2>
      <p className="section-sub">Model rating = 40% FIFA ranking + 60% squad market value</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#111a14',
            border: '1px solid #3a4a3d',
            color: '#f0f4f0',
            borderRadius: 8,
            padding: '9px 14px',
            fontSize: 13,
            fontFamily: 'inherit',
            flex: 1,
            minWidth: 160,
            outline: 'none',
          }}
        />
        <select
          value={confFilter}
          onChange={e => setConfFilter(e.target.value)}
          className="team-select"
          style={{ flex: 'none', width: 'auto' }}
        >
          {confs.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ratings-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Team</th>
              <th>Conf.</th>
              <th>FIFA</th>
              <th>Market Value</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((team, i) => {
              const globalRank = teams.indexOf(team) + 1
              const confStyle = CONF_COLORS[team.confederation] || { bg: '#1a1f1a', c: '#8a9e8e' }
              return (
                <tr key={team.name}>
                  <td>
                    <span className={`rank-badge ${rankClass(globalRank - 1)}`}>{globalRank}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FlagImg src={team.flag_url} />
                      <span style={{ fontWeight: 600 }}>{team.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="conf-badge" style={{ background: confStyle.bg, color: confStyle.c }}>
                      {team.confederation || '—'}
                    </span>
                  </td>
                  <td style={{ color: '#8a9e8e' }}>
                    {team.fifa_ranking != null ? `#${team.fifa_ranking}` : '—'}
                  </td>
                  <td className="market-val">{fmtMarket(team.market_value)}</td>
                  <td>
                    <div className="rating-cell">
                      <div className="prob-bar-wrap" style={{ maxWidth: 120 }}>
                        <div
                          className="prob-bar-fill"
                          style={{ width: `${(team.rating / maxRating) * 100}%` }}
                        />
                      </div>
                      <span className="rating-num">{team.rating.toFixed(3)}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
