export default function Header() {
  return (
    <header className="site-header">
      <div className="header-brand">
        <svg className="header-ball-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#111a14" stroke="#22883f" strokeWidth="2"/>
          <polygon points="50,18 62,38 50,42 38,38" fill="#f0f4f0"/>
          <polygon points="50,42 62,38 70,52 62,66 38,66 30,52 38,38" fill="#0a4020"/>
          <polygon points="50,42 62,38 70,52 62,66 38,66 30,52 38,38" fill="none" stroke="#22883f" strokeWidth="1.5"/>
          <polygon points="50,18 62,38 38,38" fill="#f0f4f0" stroke="#22883f" strokeWidth="1"/>
          <circle cx="50" cy="18" r="4" fill="#22883f"/>
          <circle cx="70" cy="52" r="4" fill="#22883f"/>
          <circle cx="62" cy="66" r="4" fill="#22883f"/>
          <circle cx="38" cy="66" r="4" fill="#22883f"/>
          <circle cx="30" cy="52" r="4" fill="#22883f"/>
          <circle cx="38" cy="38" r="4" fill="#22883f"/>
          <circle cx="62" cy="38" r="4" fill="#22883f"/>
          <circle cx="50" cy="82" r="4" fill="#f0f4f0"/>
          <circle cx="78" cy="30" r="4" fill="#f0f4f0"/>
          <circle cx="78" cy="70" r="4" fill="#f0f4f0"/>
          <circle cx="22" cy="70" r="4" fill="#f0f4f0"/>
          <circle cx="22" cy="30" r="4" fill="#f0f4f0"/>
        </svg>
        <div>
          <div className="header-title">WORLD CUP <span>2026</span></div>
          <div className="header-subtitle">Prediction Model</div>
        </div>
      </div>
      <div className="header-badge">Monte Carlo &bull; 10,000 Sims</div>
    </header>
  )
}
