import { useState } from 'react'
import Header from './components/Header'
import Predictions from './components/Predictions'
import GroupStage from './components/GroupStage'
import MatchPredictor from './components/MatchPredictor'
import TeamRatings from './components/TeamRatings'
import TournamentSim from './components/TournamentSim'
import './App.css'

const TABS = [
  { id: 'predictions', label: 'Title Odds' },
  { id: 'groups',      label: 'Groups' },
  { id: 'match',       label: 'Match Predictor' },
  { id: 'tournament',  label: 'Simulate Tournament' },
  { id: 'ratings',     label: 'Team Ratings' },
]

export default function App() {
  const [tab, setTab] = useState('predictions')

  return (
    <div className="app">
      <Header />

      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {tab === 'predictions' && <Predictions />}
        {tab === 'groups'      && <GroupStage />}
        {tab === 'match'       && <MatchPredictor />}
        {tab === 'tournament'  && <TournamentSim />}
        {tab === 'ratings'     && <TeamRatings />}
      </main>

      <footer className="footer">
        <span>World Cup 2026 Prediction Model &mdash; Monte Carlo Simulation</span>
      </footer>
    </div>
  )
}
