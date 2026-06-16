import { useEffect, useState } from 'react'

function FlagImg({ src, cls = 'flag-lg' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className={cls} style={{ background: '#3a4a3d', display: 'inline-block', borderRadius: 4 }} />
  return <img src={src} alt="" className={cls} onError={() => setErr(true)} />
}

const ALL_TEAMS = [
  'Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria','Cabo Verde',
  'Cameroon','Canada','Chile','China','Colombia','Congo DR','Costa Rica','Croatia','Czechia',
  'Denmark','Ecuador','Egypt','El Salvador','England','Estonia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala','Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Israel','Italy','Ivory Coast',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait',
  'Latvia','Lithuania','Luxembourg',
  'Mali','Malta','Mexico','Montenegro','Morocco','Mozambique',
  'Netherlands','New Zealand','Nigeria','North Macedonia','Norway',
  'Oman','Panama','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia',
  'Saudi Arabia','Scotland','Senegal','Serbia','Singapore','Slovakia','Slovenia',
  'South Africa','South Korea','Spain','Sudan','Sweden','Switzerland',
  'Tajikistan','Tunisia','Turkiye','Uganda','Ukraine','Uruguay','USA','Uzbekistan',
  'Venezuela','Wales','Zambia',
].sort()

export default function MatchPredictor() {
  const [teamA, setTeamA] = useState('Brazil')
  const [teamB, setTeamB] = useState('Argentina')
  const [result, setResult] = useState(null)
  const [flagsA, setFlagsA] = useState(null)
  const [flagsB, setFlagsB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [teams, setTeams] = useState([])

  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then(d => setTeams(d))
      .catch(() => {})
  }, [])

  const teamNames = teams.length > 0 ? teams.map(t => t.name).sort() : ALL_TEAMS

  const flagMap = {}
  teams.forEach(t => { flagMap[t.name] = t.flag_url })

  async function predict() {
    if (!teamA || !teamB || teamA === teamB) return
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/match/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_a: teamA, team_b: teamB }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const maxProb = result ? Math.max(result.prob_a, result.prob_b) : 0

  return (
    <div>
      <h2 className="section-title">MATCH <span>PREDICTOR</span></h2>
      <p className="section-sub">Select two teams and get win/draw/loss probabilities with sample scorelines</p>

      <div className="predictor-form">
        <div className="select-wrap">
          <label>Team A</label>
          <select
            className="team-select"
            value={teamA}
            onChange={e => setTeamA(e.target.value)}
          >
            {teamNames.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <span className="vs-label">VS</span>

        <div className="select-wrap">
          <label>Team B</label>
          <select
            className="team-select"
            value={teamB}
            onChange={e => setTeamB(e.target.value)}
          >
            {teamNames.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <button
          className="predict-btn"
          onClick={predict}
          disabled={loading || teamA === teamB}
        >
          {loading ? 'Calculating...' : 'Predict'}
        </button>
      </div>

      {err && <div className="error-msg">{err}</div>}

      {result && (
        <>
          <div className="match-result">
            <div className="match-team">
              <FlagImg src={flagMap[result.team_a] || ''} cls="flag-xl" />
              <div className="match-team-name">{result.team_a}</div>
              <div className={`match-team-pct${result.prob_a === maxProb ? ' high' : ''}`}>
                {result.prob_a}%
              </div>
              <div style={{ fontSize: 11, color: '#8a9e8e', letterSpacing: 1 }}>WIN</div>
            </div>

            <div className="match-divider">
              <div className="match-vs">VS</div>
              <div className="draw-pct" style={{ textAlign: 'center' }}>
                <div style={{ color: '#f0f4f0', fontSize: 18, fontWeight: 700 }}>{result.prob_draw}%</div>
                <div>DRAW</div>
              </div>
            </div>

            <div className="match-team">
              <FlagImg src={flagMap[result.team_b] || ''} cls="flag-xl" />
              <div className="match-team-name">{result.team_b}</div>
              <div className={`match-team-pct${result.prob_b === maxProb ? ' high' : ''}`}>
                {result.prob_b}%
              </div>
              <div style={{ fontSize: 11, color: '#8a9e8e', letterSpacing: 1 }}>WIN</div>
            </div>
          </div>

          {/* Probability bars */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: '#8a9e8e', textTransform: 'uppercase' }}>
              Win Probability
            </div>
            {[
              { label: result.team_a, pct: result.prob_a },
              { label: 'Draw',        pct: result.prob_draw },
              { label: result.team_b, pct: result.prob_b },
            ].map(({ label, pct }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ width: 120, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                <div className="prob-bar-wrap">
                  <div className="prob-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span style={{ width: 44, textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#d4a017' }}>{pct}%</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: 2, color: '#8a9e8e', textTransform: 'uppercase' }}>
              Sample Scorelines
            </div>
            <div className="scores-grid">
              {result.sample_scores.map((s, i) => (
                <div key={i} className="score-chip">
                  {s.a} &ndash; {s.b}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
