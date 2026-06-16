import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = [
  '#d4a017', '#f0c040', '#2dbd5a', '#22883f', '#1a6b35',
  '#1a6b35', '#1a6b35', '#1a6b35', '#1a6b35', '#1a6b35',
]

function FlagImg({ src, cls = 'flag' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className={cls} style={{ background: '#3a4a3d', display:'inline-block' }} />
  return <img src={src} alt="" className={cls} onError={() => setErr(true)} />
}

function rankClass(i) {
  if (i === 0) return 'gold'
  if (i === 1) return 'silver'
  if (i === 2) return 'bronze'
  return 'plain'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#111a14', border: '1px solid #3a4a3d', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{d.team}</div>
      <div style={{ color: '#d4a017', fontSize: 13 }}>{d.probability}% chance</div>
      <div style={{ color: '#8a9e8e', fontSize: 12 }}>{d.titles.toLocaleString()} / 10,000 sims</div>
    </div>
  )
}

export default function Predictions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch('/api/predictions')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading predictions...</span></div>
  if (err)     return <div className="error-msg">Failed to load: {err}</div>

  const top10 = data.slice(0, 10)
  const maxProb = top10[0]?.probability || 1

  return (
    <div>
      <h2 className="section-title">TITLE <span>PROBABILITIES</span></h2>
      <p className="section-sub">Based on 10,000 Monte Carlo simulations of the full tournament</p>

      <div className="predictions-layout">
        {/* Left: ranked list */}
        <div className="card" style={{ padding: '16px 8px' }}>
          {data.slice(0, 20).map((team, i) => (
            <div key={team.team} className="team-row">
              <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
              <FlagImg src={team.flag_url} cls="flag" />
              <span className="team-name">{team.team}</span>
              <div className="prob-bar-wrap">
                <div
                  className={`prob-bar-fill${i < 3 ? ' gold' : ''}`}
                  style={{ width: `${(team.probability / maxProb) * 100}%` }}
                />
              </div>
              <span className="team-pct">{team.probability}%</span>
            </div>
          ))}
        </div>

        {/* Right: chart */}
        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 16, letterSpacing: 2, color: '#8a9e8e', marginBottom: 16 }}>
            TOP 10 WIN PROBABILITY
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={top10}
              layout="vertical"
              margin={{ top: 0, right: 24, bottom: 0, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3a4a3d" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={v => `${v}%`}
                tick={{ fill: '#8a9e8e', fontSize: 11 }}
                axisLine={{ stroke: '#3a4a3d' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="team"
                width={80}
                tick={{ fill: '#f0f4f0', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,136,63,0.08)' }} />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                {top10.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? '#d4a017' : i === 1 ? '#f0c040' : i === 2 ? '#2dbd5a' : '#1a6b35'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
