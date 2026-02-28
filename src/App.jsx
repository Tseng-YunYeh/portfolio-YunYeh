import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react'
import emailjs from '@emailjs/browser'
import en from './i18n/en.json'
import fr from './i18n/fr.json'
import es from './i18n/es.json'
import zh from './i18n/zh.json'
import projectsData from './data/projects.json'
import './App.css'

/* ===== Language Context ===== */
const TRANSLATIONS = { en, fr, es, zh }
const LanguageContext = createContext()

function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const switchLanguage = useCallback((newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }, [])

  const i18n = useMemo(() => TRANSLATIONS[lang], [lang])

  const tObj = useCallback(
    (obj) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      return obj[lang] || obj.en || ''
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, i18n, tObj }}>
      {children}
    </LanguageContext.Provider>
  )
}

function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

/* ===== Constants ===== */
const BASE = import.meta.env.BASE_URL
const SECTIONS = ['home', 'about', 'portfolio', 'contact']
const LANGUAGES = ['en', 'fr', 'es', 'zh']
const CATEGORY_ICONS = { web: '🌐', video: '🎬', design: '🎨', documents: '📄', prototype: '📱' }
const OVERLAY_ICONS = { video: '▶', web: '↗', pdf: '📥', 'image-gallery': '🖼' }
const SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Figma',
  'Video Editing', '3D Rendering', 'UI/UX Design',
  'Responsive Design', 'Adobe Suite', 'Git',
]
const CONTACT_INFO = [
  { icon: '📍', key: 'location', value: 'Montréal, Canada' },
  { icon: '📧', key: 'email', value: 'tsengyunyeh@gmail.com', href: 'mailto:tsengyunyeh@gmail.com' },
  { icon: '📱', key: 'phone', value: '+1 (438) 509-8158', href: 'tel:+14385098158' },
]

// EmailJS config — you need to set these up at https://www.emailjs.com
const EMAILJS_SERVICE_ID = 'service_portfolio'
const EMAILJS_TEMPLATE_ID = 'template_contact'
const EMAILJS_PUBLIC_KEY = 't9trF3SmgKE8L7cYG' // Replace with your EmailJS public key

/* ===== Animated Counter ===== */
function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const num = typeof end === 'string' ? parseInt(end, 10) : end
          if (isNaN(num)) { setCount(end); return }
          const start = performance.now()
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
            setCount(Math.floor(eased * num))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ===== Creative Nav Link ===== */
function NavLink({ text, isActive, onClick }) {
  return (
    <button className={`nav-link ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-link-label">{text}</span>
      <span className="nav-link-line" />
    </button>
  )
}

/* ===== Navbar ===== */
function Navbar({ activeSection, scrolled, onScrollTo }) {
  const { lang, switchLanguage, i18n } = useLanguage()
  const [mobileNav, setMobileNav] = useState(false)

  const handleNav = (id) => { onScrollTo(id); setMobileNav(false) }

  // Close mobile nav on outside click
  useEffect(() => {
    if (!mobileNav) return
    const close = (e) => {
      if (!e.target.closest('.nav-links') && !e.target.closest('.nav-toggle')) setMobileNav(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [mobileNav])

  // Lock body scroll when mobile nav open
  useEffect(() => {
    document.body.style.overflow = mobileNav ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileNav])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => handleNav('home')}>YunYeh.</div>
      <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
        {SECTIONS.map((s) => (
          <NavLink key={s} text={i18n.nav[s]} isActive={activeSection === s} onClick={() => handleNav(s)} />
        ))}
        <div className="lang-selector">
          {LANGUAGES.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => switchLanguage(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {mobileNav && <div className="nav-overlay" onClick={() => setMobileNav(false)} />}
      <button className={`nav-toggle ${mobileNav ? 'open' : ''}`} onClick={() => setMobileNav(!mobileNav)} aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}

/* ===== Hero ===== */
function Hero({ onScrollTo, totalProjects, totalCategories }) {
  const { i18n, tObj } = useLanguage()
  const cvUrl = `${BASE}${tObj(projectsData.cv)}`

  const stats = useMemo(() => [
    { value: totalProjects, suffix: '+', label: i18n.home.statProjects || 'Projects' },
    { value: totalCategories, suffix: '', label: i18n.home.statCategories || 'Categories' },
    { value: LANGUAGES.length, suffix: '', label: i18n.home.statLanguages || 'Languages' },
  ], [totalProjects, totalCategories, i18n])

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        {[1, 2, 3].map((n) => <div key={n} className={`hero-blob hero-blob-${n}`} />)}
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge"><span className="dot" />{i18n.home.role}</div>
          <p className="hero-greeting">{i18n.home.greeting}</p>
          <h1 className="hero-name"><span className="gradient-text">Yun Yeh</span> Tseng</h1>
          <p className="hero-role">{i18n.home.role}</p>
          <p className="hero-desc">{i18n.about.description}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onScrollTo('portfolio')}>
              {i18n.home.viewWork} →
            </button>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              {i18n.home.downloadCV} ↓
            </a>
          </div>
          <div className="hero-stats">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-number"><CountUp end={value} suffix={suffix} duration={2000} /></div>
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

/* ===== About ===== */
function About({ onScrollTo }) {
  const { i18n } = useLanguage()
  const a = i18n.about

  return (
    <section id="about" className="about-section">
      <div className="section">
        <div className="section-header">
          <span className="section-badge">✦ {a.title}</span>
          <h2 className="section-title">{a.whoIAm}</h2>
          <p className="section-subtitle">{a.subtitle}</p>
        </div>
        <div className="about-grid">
          <div className="about-image-wrap">
            <img className="about-image" src={`${BASE}imgs/me.jpg`} alt="About Yun Yeh" />
            <div className="about-image-decoration" />
          </div>
          <div className="about-content">
            <h3>{a.whoIAm}</h3>
            <p>{a.description}</p>
            <h3>{a.mySkills}</h3>
            <div className="skills-grid">
              {SKILLS.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}
            </div>
            <h3>{a.experience}</h3>
            <div className="experience-list">
              {[1, 2].map((n) => (
                <div key={n} className="experience-item">
                  <div className="exp-dot" />
                  <div>
                    <div className="exp-date">{a[`exp${n}_date`]}</div>
                    <div className="exp-role">{a[`exp${n}_role`]}</div>
                    <div className="exp-company">{a[`exp${n}_company`]}</div>
                    <div className="exp-desc">{a[`exp${n}_desc`]}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => onScrollTo('contact')}>
              {a.letsTalk} →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== ProjectCard ===== */
function ProjectCard({ project, theme, onClick, index }) {
  const { tObj } = useLanguage()
  const title = tObj(project.title)

  const thumbnail = useMemo(() => {
    if (project.images?.length) return <img src={`${BASE}${project.images[0]}`} alt={title} loading="lazy" />
    if (project.image) return <img src={`${BASE}${project.image}`} alt={title} loading="lazy" />
    if (project.type === 'video' && project.src) return <video src={`${BASE}${project.src}`} muted preload="metadata" />
    return <div className="project-placeholder">{CATEGORY_ICONS[theme.id] || '📁'}</div>
  }, [project, theme.id, title])

  return (
    <div className="project-card" onClick={() => onClick(project, theme)} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="project-thumbnail">
        {thumbnail}
        <div className="project-overlay">
          <div className="project-overlay-icon">{OVERLAY_ICONS[project.type] || '👁'}</div>
        </div>
      </div>
      <div className="project-info">
        <div className="project-category-badge">{tObj(theme.title)}</div>
        <h3 className="project-title">{title}</h3>
        <p className="project-desc">{tObj(project.description)}</p>
        {project.technologies?.length > 0 && (
          <div className="project-tech">
            {project.technologies.map((tech, i) => <span key={i} className="tech-tag">{tech}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== Portfolio ===== */
function Portfolio({ themes, activeFilter, setActiveFilter, filteredProjects, onOpenModal }) {
  const { i18n, tObj } = useLanguage()

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="section">
        <div className="section-header">
          <span className="section-badge">✦ {i18n.portfolio.title}</span>
          <h2 className="section-title">{i18n.portfolio.title}</h2>
          <p className="section-subtitle">{i18n.portfolio.subtitle}</p>
        </div>
        <div className="filter-bar">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            {i18n.portfolio.filterAll}
          </button>
          {themes.map((theme) => (
            <button key={theme.id} className={`filter-btn ${activeFilter === theme.id ? 'active' : ''}`} onClick={() => setActiveFilter(theme.id)}>
              {CATEGORY_ICONS[theme.id]} {tObj(theme.title)}
            </button>
          ))}
        </div>
        <div className="projects-grid" key={activeFilter}>
          {filteredProjects.map(({ project, theme }, idx) => (
            <ProjectCard key={`${theme.id}-${idx}`} project={project} theme={theme} onClick={onOpenModal} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== ProjectModal ===== */
function ProjectModal({ project, theme, onClose }) {
  const { i18n, tObj } = useLanguage()
  const [galleryIdx, setGalleryIdx] = useState(0)
  const title = tObj(project.title)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (project.type === 'image-gallery' && project.images) {
        if (e.key === 'ArrowRight') setGalleryIdx((p) => (p + 1) % project.images.length)
        if (e.key === 'ArrowLeft') setGalleryIdx((p) => (p - 1 + project.images.length) % project.images.length)
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [onClose, project])

  const media = useMemo(() => {
    if (project.type === 'video' && project.src)
      return <video src={`${BASE}${project.src}`} controls autoPlay />
    if (project.type === 'web' && project.link) {
      if (project.link.startsWith('http'))
        return project.images?.[0] ? <img src={`${BASE}${project.images[0]}`} alt={title} /> : <iframe src={project.link} title={title} />
      return <iframe src={`${BASE}${project.link}`} title={title} />
    }
    if (project.type === 'pdf')
      return project.image ? <img src={`${BASE}${project.image}`} alt={title} /> : <iframe src={`${BASE}${project.src}`} title={title} />
    if (project.type === 'image-gallery' && project.images)
      return <img src={`${BASE}${project.images[galleryIdx]}`} alt={`${title} ${galleryIdx + 1}`} />
    return null
  }, [project, title, galleryIdx])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-media">{media}</div>
        {project.type === 'image-gallery' && project.images?.length > 1 && (
          <div className="gallery-nav">
            <button className="gallery-btn" onClick={() => setGalleryIdx((p) => (p - 1 + project.images.length) % project.images.length)} aria-label="Previous">‹</button>
            <div className="gallery-dots">
              {project.images.map((_, i) => (
                <span key={i} className={`gallery-dot ${i === galleryIdx ? 'active' : ''}`} onClick={() => setGalleryIdx(i)} />
              ))}
            </div>
            <button className="gallery-btn" onClick={() => setGalleryIdx((p) => (p + 1) % project.images.length)} aria-label="Next">›</button>
          </div>
        )}
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <p className="modal-desc">{tObj(project.description)}</p>
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

/* ===== Contact ===== */
function Contact() {
  const { i18n } = useLanguage()
  const formRef = useRef(null)
  const [formState, setFormState] = useState({ status: 'idle', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormState({ status: 'sending', message: '' })

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, EMAILJS_PUBLIC_KEY)
      setFormState({ status: 'success', message: i18n.contact.successMessage || 'Message sent successfully!' })
      formRef.current.reset()
      setTimeout(() => setFormState({ status: 'idle', message: '' }), 5000)
    } catch {
      setFormState({ status: 'error', message: i18n.contact.errorMessage || 'Failed to send. Please try again.' })
      setTimeout(() => setFormState({ status: 'idle', message: '' }), 5000)
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="section">
        <div className="section-header">
          <span className="section-badge">✦ {i18n.contact.title}</span>
          <h2 className="section-title">{i18n.contact.title}</h2>
          <p className="section-subtitle">{i18n.contact.subtitle}</p>
        </div>
        <div className="contact-grid">
          <div>
            {CONTACT_INFO.map(({ icon, key, value, href }) => (
              <div key={key} className="contact-info-card">
                <div className="contact-icon">{icon}</div>
                <div>
                  <div className="contact-info-label">{i18n.contact[key]}</div>
                  {href ? (
                    <a href={href} className="contact-info-value contact-link">{value}</a>
                  ) : (
                    <div className="contact-info-value">{value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="from_name" placeholder={i18n.contact.formName} required />
              </div>
              <div className="form-group">
                <input type="email" name="from_email" placeholder={i18n.contact.formEmail} required />
              </div>
            </div>
            <div className="form-group">
              <input type="text" name="subject" placeholder={i18n.contact.formSubject} required />
            </div>
            <div className="form-group">
              <textarea name="message" placeholder={i18n.contact.formMessage} required />
            </div>

            {formState.message && (
              <div className={`form-feedback ${formState.status}`}>
                {formState.status === 'success' ? '✓' : '✕'} {formState.message}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={formState.status === 'sending'}>
              {formState.status === 'sending'
                ? (i18n.contact.sending || 'Sending...')
                : `${i18n.contact.sendMessage} →`
              }
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ===== Footer ===== */
function Footer({ searchQuery, setSearchQuery, onSearch }) {
  const { i18n } = useLanguage()

  return (
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
              onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) onSearch() }}
            />
            <button onClick={onSearch} aria-label="Search">🔍</button>
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
  )
}

/* ===== App Content ===== */
function AppContent() {
  const { tObj } = useLanguage()
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalProject, setModalProject] = useState(null)
  const [modalTheme, setModalTheme] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { themes } = projectsData
  const totalProjects = useMemo(() => themes.reduce((acc, th) => acc + th.projects.length, 0), [themes])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      for (const id of [...SECTIONS].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 200) { setActiveSection(id); break }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return themes
      .filter((th) => activeFilter === 'all' || activeFilter === th.id)
      .flatMap((th) => th.projects.map((p) => ({ project: p, theme: th })))
      .filter(({ project }) => !q || `${tObj(project.title)} ${tObj(project.description)}`.toLowerCase().includes(q))
  }, [themes, activeFilter, searchQuery, tObj])

  const openModal = useCallback((project, theme) => { setModalProject(project); setModalTheme(theme) }, [])
  const closeModal = useCallback(() => { setModalProject(null); setModalTheme(null) }, [])
  const handleFooterSearch = useCallback(() => { setActiveFilter('all'); scrollTo('portfolio') }, [scrollTo])

  return (
    <div className="App">
      <Navbar activeSection={activeSection} scrolled={scrolled} onScrollTo={scrollTo} />
      <Hero onScrollTo={scrollTo} totalProjects={totalProjects} totalCategories={themes.length} />
      <About onScrollTo={scrollTo} />
      <Portfolio themes={themes} activeFilter={activeFilter} setActiveFilter={setActiveFilter} filteredProjects={filteredProjects} onOpenModal={openModal} />
      <Contact />
      <Footer searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleFooterSearch} />
      {modalProject && modalTheme && <ProjectModal project={modalProject} theme={modalTheme} onClose={closeModal} />}
    </div>
  )
}

/* ===== App ===== */
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
