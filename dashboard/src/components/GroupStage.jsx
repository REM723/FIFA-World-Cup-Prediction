import { useEffect, useState } from 'react'

function FlagImg({ src, cls = 'flag' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className={cls} style={{ background: '#3a4a3d', display: 'inline-block', borderRadius: 3 }} />
  return <img src={src} alt="" className={cls} onError={() => setErr(true)} />
}

const HOST_TEAMS = new Set(['Mexico', 'USA', 'Canada'])

export default function GroupStage() {
  const [groups, setGroups] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch('/api/groups')
      .then(r => r.json())
      .then(d => { setGroups(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>Loading groups...</span></div>
  if (err)     return <div className="error-msg">Failed to load: {err}</div>

  return (
    <div>
      <h2 className="section-title">GROUP <span>STAGE</span></h2>
      <p className="section-sub">48 teams across 12 groups &mdash; USA, Canada &amp; Mexico co-hosting</p>

      <div className="groups-grid">
        {Object.entries(groups).map(([groupName, teams]) => (
          <div key={groupName} className="group-card">
            <div className="group-header">
              <span className="group-label">{groupName}</span>
              <span style={{ fontSize: 11, color: '#8a9e8e', letterSpacing: 1 }}>
                {teams.length} TEAMS
              </span>
            </div>
            <div className="group-body">
              {teams.map(({ name, flag_url }) => (
                <div key={name} className="group-team-row">
                  <FlagImg src={flag_url} cls="flag" />
                  <span style={{ flex: 1 }}>{name}</span>
                  {HOST_TEAMS.has(name) && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: '#d4a017',
                      background: 'rgba(212,160,23,0.1)',
                      border: '1px solid rgba(212,160,23,0.3)',
                      borderRadius: 4,
                      padding: '2px 6px',
                    }}>
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
