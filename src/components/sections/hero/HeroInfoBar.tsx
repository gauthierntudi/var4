export function HeroInfoBar() {
  return (
    <div className="hero-info-bar" data-hero="info-bar">
      <div className="hero-info-bar__inner">
        <div className="hero-info-bar__entry" aria-label="Entrée libre">
          Entrée libre
        </div>

        <div className="hero-info-bar__date">
          <span className="hero-info-bar__date-day">09</span>
          <span className="hero-info-bar__date-month">
            <span>Août</span>
            <span>2026</span>
          </span>
        </div>

        <div className="hero-info-bar__venue">
          <p className="hero-info-bar__venue-name">
            Académie des Beaux-Arts
          </p>
        </div>

        <div className="hero-info-bar__time">
          <span className="hero-info-bar__time-label">
            Ouverture des portes
          </span>
          <span className="hero-info-bar__time-value">12H</span>
        </div>
      </div>
    </div>
  );
}
