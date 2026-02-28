import { useLanguage } from '../../context/LanguageContext'
import projectsData from '../../data/projects.json'
import './Hero.css'

const BASE = import.meta.env.BASE_URL

export default function Hero({ onScrollTo, totalProjects, totalCategories }) {
  const { i18n } = useLanguage()

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        {[1, 2, 3].map((n) => <div key={n} className={`hero-blob hero-blob-${n}`} />)}
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="dot" />
            {i18n.home.role}
          </div>
          <p className="hero-greeting">{i18n.home.greeting}</p>
          <h1 className="hero-name">
            <span className="gradient-text">Yun Yeh</span> Tseng
          </h1>
          <p className="hero-role">{i18n.home.role}</p>
          <p className="hero-desc">{i18n.about.description}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onScrollTo('portfolio')}>
              {i18n.home.viewWork} →
            </button>
            <a href={`${BASE}${projectsData.cv}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              {i18n.home.downloadCV} ↓
            </a>
          </div>
          <div className="hero-stats">
            {[
              { value: `${totalProjects}+`, label: i18n.home.statProjects || 'Projects' },
              { value: totalCategories, label: i18n.home.statCategories || 'Categories' },
              { value: 4, label: i18n.home.statLanguages || 'Languages' },
            ].map(({ value, label }) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-number">{value}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-avatar-wrapper">
            <div className="hero-avatar-ring" />
            <img className="hero-avatar" src={`${BASE}imgs/me.jpg`} alt="Yun Yeh Tseng" />
          </div>
        </div>
      </div>
    </section>
  )
}
