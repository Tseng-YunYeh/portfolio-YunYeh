import { useState, useEffect, useCallback } from 'react'
import './App.css'
import projectsData from './data/projects.json'
import en from './i18n/en.json'
import fr from './i18n/fr.json'
import es from './i18n/es.json'
import zh from './i18n/zh.json'

const translations = { en, fr, es, zh }
const BASE = import.meta.env.BASE_URL

// ─── Helper: get localized text ───
function t(obj, lang) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.en || ''
}

// ─── Category icon map ───
const categoryIcons = {
  web: '🌐',
  video: '🎬',
  design: '🎨',
  documents: '📄',
  prototype: '📱',
}

// ─── Skill Tags ───
const skills = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Figma',
  'Video Editing', '3D Rendering', 'UI/UX Design',
  'Responsive Design', 'Adobe Suite', 'Git'
]

// ─── PROJECT CARD ───
function ProjectCard({ project, theme, lang, onClick, index }) {
  const title = t(project.title, lang)
  const desc = t(project.description, lang)
  const categoryTitle = t(theme.title, lang)

  const getThumbnail = () => {
    if (project.images && project.images.length > 0) {
      return <img src={`${BASE}${project.images[0]}`} alt={title} loading="lazy" />
    }
    if (project.image) {
      return <img src={`${BASE}${project.image}`} alt={title} loading="lazy" />
    }
    if (project.type === 'video' && project.src) {
      return (
        <video src={`${BASE}${project.src}`} muted preload="metadata" />
      )
    }
    return <div className="project-placeholder">{categoryIcons[theme.id] || '📁'}</div>
  }

  const overlayIcon = () => {
    switch (project.type) {
      case 'video': return '▶'
      case 'web': return '↗'
      case 'pdf': return '📥'
      case 'image-gallery': return '🖼'
      default: return '👁'
    }
  }

  return (
    <div className="project-card" onClick={() => onClick(project, theme)} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="project-thumbnail">
        {getThumbnail()}
        <div className="project-overlay">
          <div className="project-overlay-icon">{overlayIcon()}</div>
        </div>
      </div>
      <div className="project-info">
        <div className="project-category-badge">{categoryTitle}</div>
        <h3 className="project-title">{title}</h3>
        <p className="project-desc">{desc}</p>
        {project.technologies && (
          <div className="project-tech">
            {project.technologies.map((tech, i) => (
              <span key={i} className="tech-tag">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MODAL ───
function ProjectModal({ project, theme, lang, onClose, i18n }) {
  const [galleryIdx, setGalleryIdx] = useState(0)
  const title = t(project.title, lang)
  const desc = t(project.description, lang)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (project.type === 'image-gallery' && project.images) {
        if (e.key === 'ArrowRight') setGalleryIdx(prev => (prev + 1) % project.images.length)
        if (e.key === 'ArrowLeft') setGalleryIdx(prev => (prev - 1 + project.images.length) % project.images.length)
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, project])

  const renderMedia = () => {
    if (project.type === 'video' && project.src) {
      return <video src={`${BASE}${project.src}`} controls autoPlay />
    }
    if (project.type === 'web' && project.link) {
      if (project.link.startsWith('http')) {
        return project.images?.[0]
          ? <img src={`${BASE}${project.images[0]}`} alt={title} />
          : <iframe src={project.link} title={title} />
      }
      return <iframe src={`${BASE}${project.link}`} title={title} />
    }
    if (project.type === 'pdf') {
      return project.image
        ? <img src={`${BASE}${project.image}`} alt={title} />
        : <iframe src={`${BASE}${project.src}`} title={title} />
    }
    if (project.type === 'image-gallery' && project.images) {
      return <img src={`${BASE}${project.images[galleryIdx]}`} alt={`${title} ${galleryIdx + 1}`} />
    }
    return null
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-media">
          {renderMedia()}
        </div>
        {project.type === 'image-gallery' && project.images && project.images.length > 1 && (
          <div className="gallery-nav">
            <button className="gallery-btn" onClick={() => setGalleryIdx(prev => (prev - 1 + project.images.length) % project.images.length)}>‹</button>
            <div className="gallery-dots">
              {project.images.map((_, i) => (
                <span key={i} className={`gallery-dot ${i === galleryIdx ? 'active' : ''}`} onClick={() => setGalleryIdx(i)} />
              ))}
            </div>
            <button className="gallery-btn" onClick={() => setGalleryIdx(prev => (prev + 1) % project.images.length)}>›</button>
          </div>
        )}
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-desc">{desc}</p>
          <div className="modal-actions">
            {project.type === 'web' && project.link && (
              <a href={project.link.startsWith('http') ? project.link : `${BASE}${project.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {i18n.portfolio.viewLive} ↗
              </a>
            )}
            {project.type === 'pdf' && project.src && (
              <a href={`${BASE}${project.src}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {i18n.portfolio.clickToDownload} 📥
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ───
function App() {
  const [lang, setLang] = useState('en')
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalProject, setModalProject] = useState(null)
  const [modalTheme, setModalTheme] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const i18n = translations[lang]
  const { themes } = projectsData

  // Count total projects
  const totalProjects = themes.reduce((acc, th) => acc + th.projects.length, 0)

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = ['home', 'about', 'portfolio', 'contact']
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileNav(false)
  }

  // Filtered projects
  const getFilteredProjects = () => {
    let items = []
    themes.forEach((theme) => {
      theme.projects.forEach((project) => {
        if (activeFilter === 'all' || activeFilter === theme.id) {
          items.push({ project, theme })
        }
      })
    })
    if (searchQuery.trim()) {
      items = items.filter(({ project }) => {
        const title = t(project.title, lang).toLowerCase()
        const desc = t(project.description, lang).toLowerCase()
        return title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase())
      })
    }
    return items
  }

  const openModal = useCallback((project, theme) => {
    setModalProject(project)
    setModalTheme(theme)
  }, [])

  const closeModal = useCallback(() => {
    setModalProject(null)
    setModalTheme(null)
  }, [])

  return (
    <div className="App">
      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">YunYeh.</div>
        <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
          {['home', 'about', 'portfolio', 'contact'].map((section) => (
            <button
              key={section}
              className={`nav-link ${activeSection === section ? 'active' : ''}`}
              onClick={() => scrollTo(section)}
            >
              {i18n.nav[section]}
            </button>
          ))}
          <div className="lang-selector">
            {['en', 'fr', 'es', 'zh'].map((l) => (
              <button
                key={l}
                className={`lang-btn ${lang === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <button className={`nav-toggle ${mobileNav ? 'open' : ''}`} onClick={() => setMobileNav(!mobileNav)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* ═══════ HERO ═══════ */}
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
              <button className="btn btn-primary" onClick={() => scrollTo('portfolio')}>
                {i18n.home.viewWork} →
              </button>
              <a href={`${BASE}${projectsData.cv}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                {i18n.home.downloadCV} ↓
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">{totalProjects}+</div>
                <div className="hero-stat-label">Projects</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">{themes.length}</div>
                <div className="hero-stat-label">Categories</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">4</div>
                <div className="hero-stat-label">Languages</div>
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

      {/* ═══════ ABOUT ═══════ */}
      <section id="about" className="about-section">
        <div className="section">
          <div className="section-header">
            <span className="section-badge">✦ {i18n.about.title}</span>
            <h2 className="section-title">{i18n.about.whoIAm}</h2>
            <p className="section-subtitle">{i18n.about.subtitle}</p>
          </div>
          <div className="about-grid">
            <div className="about-image-wrap">
              <img className="about-image" src={`${BASE}imgs/me.jpg`} alt="About Yun Yeh" />
              <div className="about-image-decoration" />
            </div>
            <div className="about-content">
              <h3>{i18n.about.whoIAm}</h3>
              <p>{i18n.about.description}</p>

              <h3>{i18n.about.mySkills}</h3>
              <div className="skills-grid">
                {skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>

              <h3>{i18n.about.experience}</h3>
              <div className="experience-list">
                <div className="experience-item">
                  <div className="exp-dot" />
                  <div>
                    <div className="exp-date">{i18n.about.exp1_date}</div>
                    <div className="exp-role">{i18n.about.exp1_role}</div>
                    <div className="exp-company">{i18n.about.exp1_company}</div>
                    <div className="exp-desc">{i18n.about.exp1_desc}</div>
                  </div>
                </div>
                <div className="experience-item">
                  <div className="exp-dot" />
                  <div>
                    <div className="exp-date">{i18n.about.exp2_date}</div>
                    <div className="exp-role">{i18n.about.exp2_role}</div>
                    <div className="exp-company">{i18n.about.exp2_company}</div>
                    <div className="exp-desc">{i18n.about.exp2_desc}</div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
                {i18n.about.letsTalk} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PORTFOLIO ═══════ */}
      <section id="portfolio" className="portfolio-section">
        <div className="section">
          <div className="section-header">
            <span className="section-badge">✦ {i18n.portfolio.title}</span>
            <h2 className="section-title">{i18n.portfolio.title}</h2>
            <p className="section-subtitle">{i18n.portfolio.subtitle}</p>
          </div>

          <div className="filter-bar">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {i18n.portfolio.filterAll}
            </button>
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`filter-btn ${activeFilter === theme.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(theme.id)}
              >
                {categoryIcons[theme.id]} {t(theme.title, lang)}
              </button>
            ))}
          </div>

          <div className="projects-grid" key={activeFilter}>
            {getFilteredProjects().map(({ project, theme }, idx) => (
              <ProjectCard
                key={`${theme.id}-${idx}`}
                project={project}
                theme={theme}
                lang={lang}
                onClick={openModal}
                index={idx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" className="contact-section">
        <div className="section">
          <div className="section-header">
            <span className="section-badge">✦ {i18n.contact.title}</span>
            <h2 className="section-title">{i18n.contact.title}</h2>
            <p className="section-subtitle">{i18n.contact.subtitle}</p>
          </div>
          <div className="contact-grid">
            <div>
              <div className="contact-info-card">
                <div className="contact-icon">📍</div>
                <div>
                  <div className="contact-info-label">{i18n.contact.location}</div>
                  <div className="contact-info-value">Québec, Canada</div>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="contact-icon">📧</div>
                <div>
                  <div className="contact-info-label">{i18n.contact.email}</div>
                  <div className="contact-info-value">yunyeh.tseng@email.com</div>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="contact-icon">📱</div>
                <div>
                  <div className="contact-info-label">{i18n.contact.phone}</div>
                  <div className="contact-info-value">+1 (XXX) XXX-XXXX</div>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" placeholder={i18n.contact.formName} />
                </div>
                <div className="form-group">
                  <input type="email" placeholder={i18n.contact.formEmail} />
                </div>
              </div>
              <div className="form-group">
                <input type="text" placeholder={i18n.contact.formSubject} />
              </div>
              <div className="form-group">
                <textarea placeholder={i18n.contact.formMessage} />
              </div>
              <button type="submit" className="btn btn-primary">
                {i18n.contact.sendMessage} →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-brand">YunYeh.</div>
            <p className="footer-desc">{i18n.footer.description}</p>
            <div className="footer-social">
              <a href="https://github.com/Tseng-YunYeh" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">⌨</a>
              <a href="#" className="social-link" title="LinkedIn">💼</a>
              <a href="#" className="social-link" title="Twitter">🐦</a>
            </div>
          </div>
          <div className="footer-column">
            <h4>{i18n.footer.searchProjects}</h4>
            <p>{i18n.footer.searchText}</p>
            <div className="footer-search">
              <input
                type="text"
                placeholder={i18n.footer.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setActiveFilter('all')
                    scrollTo('portfolio')
                  }
                }}
              />
              <button onClick={() => { setActiveFilter('all'); scrollTo('portfolio') }}>🔍</button>
            </div>
          </div>
          <div className="footer-column">
            <h4>{i18n.footer.connect}</h4>
            <p>{i18n.footer.connectText}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{i18n.footer.rights}</span>
          <span>{i18n.footer.madeWith}</span>
        </div>
      </footer>

      {/* ═══════ MODAL ═══════ */}
      {modalProject && modalTheme && (
        <ProjectModal
          project={modalProject}
          theme={modalTheme}
          lang={lang}
          onClose={closeModal}
          i18n={i18n}
        />
      )}
    </div>
  )
}

export default App
