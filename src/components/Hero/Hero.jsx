import { useLanguage } from '../../context/LanguageContext'
import projectsData from '../../data/projects.json'
import './Hero.css'

const BASE = import.meta.env.BASE_URL

export default function Hero({ onScrollTo, totalProjects, totalCategories }) {
  const { i18n } = useLanguage()

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
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
            <div className="hero-stat">
              <div className="hero-stat-number">{totalProjects}+</div>
              <div className="hero-stat-label">{i18n.home.statProjects || 'Projects'}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">{totalCategories}</div>
              <div className="hero-stat-label">{i18n.home.statCategories || 'Categories'}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">4</div>
              <div className="hero-stat-label">{i18n.home.statLanguages || 'Languages'}</div>
            </div>
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
