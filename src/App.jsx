import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react'
import { bd } from './firebase/init'
import { collection, getDocs, onSnapshot, doc } from 'firebase/firestore'
import { useAuth } from './context/AuthContext'
import { NavLink as RouterNavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { FiArrowRight, FiCheckCircle, FiExternalLink, FiFileText, FiImage, FiLayers, FiMonitor, FiPackage, FiPenTool, FiPlayCircle, FiSearch, FiStar } from 'react-icons/fi'
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineArrowDownTray } from 'react-icons/hi2'
import en from './i18n/en.json'
import fr from './i18n/fr.json'
import es from './i18n/es.json'
import zh from './i18n/zh.json'
import projectsData from './data/projects.json'
import { useSeo } from './hooks/useSeo.js'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import AdminPage from './admin-page/Admin.jsx'
import { useToast, ToastProvider } from './context/ToastContext'
import { basculerLike } from './firebase/project-modele' 

/************************************************/
/** Seulement pour remplir les données de test **/
/************************************************/
// import remplirCollectionProjects from './scripts/donnees-test'
// remplirCollectionProjects()

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
// Resolve a stored path or a full URL: if it's already an absolute URL, return as-is,
// otherwise prefix with the app `BASE` (used for local assets from `projects.json`).
function resolveUrl(pathOrUrl) {
  if (!pathOrUrl) return null
  try {
    if (typeof pathOrUrl === 'string' && pathOrUrl.startsWith('http')) return pathOrUrl
  } catch (e) {
    return null
  }
  // If the path is already absolute (starts with '/'), return as-is so it points
  // to the `public/` folder (e.g. '/webs/custome-web01/'). Otherwise prefix
  // with the app `BASE` for local asset paths.
  if (typeof pathOrUrl === 'string' && pathOrUrl.startsWith('/')) return pathOrUrl
  return `${BASE}${pathOrUrl}`
}
const LANGUAGES = ['en', 'fr', 'es', 'zh']
const CATEGORY_ICONS = { web: '🌐', video: '🎬', design: '🎨', documents: '📄', prototype: '📱' }
const OVERLAY_ICONS = { video: FiPlayCircle, web: FiExternalLink, pdf: HiOutlineArrowDownTray, 'image-gallery': FiImage }
const NAV_ITEMS = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about' },
  { id: 'portfolio', path: '/portfolio' },
  { id: 'service', path: '/service' },
  { id: 'contact', path: '/contact' },
]
const SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Figma',
  'Video Editing', 'Maya', 'UI/UX Design',
  'Unity', 'Adobe Suite', 'Git','Agile Methodologies','WordPress','Communication','Teamwork'
]
const CONTACT_INFO = [
  { icon: '📍', key: 'location', value: 'Montréal, Canada' },
  { icon: '📧', key: 'email', value: 'tsengyunyeh@gmail.com', href: 'mailto:tsengyunyeh@gmail.com' },
  { icon: '📱', key: 'phone', value: '+1 (438) 509-8158', href: 'tel:+14385098158' },
]

// EmailJS config — you need to set these up at https://www.emailjs.com
const EMAILJS_SERVICE_ID = 'service_4dpqq8q'
const EMAILJS_TEMPLATE_ID = 'template_tdit6uf'
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
function NavItem({ text, path, onClick }) {
  return (
    <RouterNavLink to={path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-link-label">{text}</span>
      <span className="nav-link-line" />
    </RouterNavLink>
  )
}

/* ===== Navbar ===== */
function Navbar({ scrolled }) {
  const { lang, switchLanguage, i18n } = useLanguage()
  const { utilisateur, connexion, deconnexion } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)

  const handleNav = () => setMobileNav(false)

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
      <div className="nav-logo" onClick={() => navigate('/')}>YunYeh.</div>

      <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} text={i18n.nav[item.id]} path={item.path} onClick={handleNav} />
        ))}
        <div className="lang-selector">
          {LANGUAGES.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => switchLanguage(l)}>
              {l}
            </button>
          ))}
        </div>
        {utilisateur && utilisateur.estAdmin === true && (
          <RouterNavLink to="/admin" className="nav-admin" onClick={handleNav}>{i18n.nav?.admin || 'Admin'}</RouterNavLink>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
          {!utilisateur ? (
            <div className="nav-user nav-user-login">
              <button className="btn-logout" onClick={connexion}>{i18n.nav?.login || 'Connect'}</button>
            </div>
          ) : (
            <div className="nav-user">
              <img src={utilisateur.photoURL} alt={utilisateur.displayName} className="user-avatar" />
              <button className="btn-logout" onClick={deconnexion}>{i18n.nav?.logout || 'Logout'}</button>
            </div>
          )}
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
function Hero({ onGoPortfolio, totalProjects, totalCategories }) {
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
            <button className="btn btn-primary" onClick={onGoPortfolio}>
              {i18n.home.viewWork} →
            </button>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <HiOutlineArrowDownTray /> {i18n.home.downloadCV}
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
function About({ onGoContact }) {
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
            <button className="btn btn-primary" onClick={onGoContact}>
              {a.letsTalk} →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== Service ===== */
function Service() {
  const { i18n } = useLanguage()
  const navigate = useNavigate()
  const s = i18n.service
  const serviceGroups = [
    { icon: FiPenTool, ...s.graphicDesign },
    { icon: FiMonitor, ...s.webDevelopment },
  ]
  const clientProjects = useMemo(() => {
    const fallbackIcons = [FiExternalLink, FiStar, FiLayers, FiPackage]
    return (s.clientWork.items || []).map((item, index) => ({
      ...item,
      kind: item.url ? 'web' : 'logo',
      icon: fallbackIcons[index] || FiFileText,
    }))
  }, [s])
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    if (activeProjectIndex >= clientProjects.length) setActiveProjectIndex(0)
  }, [activeProjectIndex, clientProjects.length])

  const shiftProject = (delta) => {
    if (!clientProjects.length) return
    setActiveProjectIndex((current) => (current + delta + clientProjects.length) % clientProjects.length)
  }

  return (
    <section id="service" className="service-section">
      <div className="service-hero">
        <div className="service-hero-copy">
          <span className="section-badge">✦ {s.badge}</span>
          <h1 className="service-title">{s.heroTitle}</h1>
          <p className="service-lead">{s.heroLead}</p>
          <div className="service-hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/contact')}>
              {s.requestQuote} <FiArrowRight />
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/portfolio')}>
              {s.viewSchoolWork}
            </button>
          </div>
          <div className="service-hero-points">
            {s.points.map((point) => (
              <span key={point}><FiCheckCircle /> {point}</span>
            ))}
          </div>
        </div>

        <div className="service-hero-panel">
          <div className="service-panel-card">
            <div className="service-panel-label">{s.startingPricesLabel}</div>
            <div className="service-panel-value">{s.startingPricesValue}</div>
            <p>{s.startingPricesText}</p>
          </div>
          <div className="service-panel-card service-panel-card-accent">
            <div className="service-panel-label">{s.webBuildsLabel}</div>
            <div className="service-panel-value">{s.webBuildsValue}</div>
            <p>{s.webBuildsText}</p>
          </div>
          <div className="service-panel-card">
            <div className="service-panel-label">{s.customWorkLabel}</div>
            <div className="service-panel-value">{s.customWorkValue}</div>
            <p>{s.customWorkText}</p>
          </div>
        </div>
      </div>

      <div className="service-catalog section">
        <div className="section-header">
          <span className="section-badge">✦ {s.whatIDoBadge}</span>
          <h2 className="section-title">{s.servicesTitle}</h2>
          <p className="section-subtitle">{s.servicesSubtitle}</p>
        </div>

        <div className="service-grid">
          {serviceGroups.map(({ icon: Icon, title, subtitle, items }) => (
            <article key={title} className="service-card">
              <div className="service-card-top">
                <div className="service-card-icon"><Icon /></div>
                <div>
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                </div>
              </div>
              <div className="service-list">
                {items.map((item) => (
                  <div key={item.name} className="service-list-item">
                    <div className="service-list-heading">
                      <span className="service-item-name">{item.name}</span>
                      <span className="service-item-price">{item.price}</span>
                    </div>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="service-showcase section">
        <div className="section-header">
          <span className="section-badge">✦ {s.clientWork.badge}</span>
          <h2 className="section-title">{s.clientWork.title}</h2>
          <p className="section-subtitle">{s.clientWork.subtitle}</p>
        </div>

        <div className="service-showcase-carousel">
          <button
            type="button"
            className="service-carousel-btn service-carousel-btn-left"
            onClick={() => shiftProject(-1)}
            aria-label="Previous client project"
          >
            ‹
          </button>

          <div className="service-project-stage" aria-label="Client project carousel">
            {clientProjects.map((project, index) => {
              const total = clientProjects.length
              const offset = (index - activeProjectIndex + total) % total
              const variant = offset === 0 ? 'active' : offset === 1 ? 'next' : offset === total - 1 ? 'prev' : 'hidden'
              const Icon = project.icon

              return (
                <button
                  key={`${project.title}-${index}`}
                  type="button"
                  className={`service-project-card service-project-card-${variant}`}
                  onClick={() => {
                    if (variant === 'active') setSelectedProject(project)
                    else setActiveProjectIndex(index)
                  }}
                >
                  <div className="service-project-media">
                    {project.image && <img src={resolveUrl(project.image)} alt={project.title} className="service-project-image" />}
                    <span className="service-project-badge">{project.label}</span>
                    <span className="service-project-icon"><Icon /></span>
                  </div>
                  <div className="service-project-content">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="service-project-action-hint">
                      {variant === 'active'
                        ? (project.kind === 'web' ? 'Open web preview' : 'Open full image')
                        : 'Move to center'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="service-carousel-btn service-carousel-btn-right"
            onClick={() => shiftProject(1)}
            aria-label="Next client project"
          >
            ›
          </button>
        </div>
      </div>

      {selectedProject && (
        <ServiceProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          viewLiveLabel={s.viewLive || 'View live'}
        />
      )}
    </section>
  )
}

/* ===== ServiceProjectModal ===== */
function ServiceProjectModal({ project, onClose, viewLiveLabel }) {
  const title = project?.title || ''

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="service-project-modal-backdrop" onClick={onClose}>
      <div className={`service-project-modal service-project-modal-${project.kind}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="service-project-modal-close" onClick={onClose} aria-label="Close project preview">
          ✕
        </button>

        <div className="service-project-modal-media">
          {project.kind === 'web' ? (
            <div className="service-project-preview-shell">
              <div className="service-project-preview-topbar">
                <span />
                <span />
                <span />
              </div>
              <iframe src={resolveUrl(project.url)} title={title} className="service-project-preview-frame" />
            </div>
          ) : (
            <img src={resolveUrl(project.image)} alt={title} className="service-project-full-image" />
          )}
        </div>

        <div className="service-project-modal-body">
          <div className="service-project-modal-meta">
            <span className="service-project-modal-label">{project.label}</span>
            <h3>{title}</h3>
          </div>
          <p>{project.description}</p>

          {project.kind === 'web' && project.url && (
            <a href={resolveUrl(project.url)} target="_blank" rel="noopener noreferrer" className="btn btn-primary service-project-modal-link">
              {viewLiveLabel} <FiExternalLink />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== ProjectCard ===== */
function ProjectCard({ item, onCardClick, index, registerRef, highlighted }) {
  const { tObj } = useLanguage()
  const { project, theme, key } = item
  const title = tObj(project.title)
  const OverlayIcon = OVERLAY_ICONS[project.type] || FiFileText
  const { utilisateur, connexion } = useAuth()
  const { showToast } = useToast()
  const [likeCount, setLikeCount] = useState(project.likes ? project.likes.length : 0)
  const [userLiked, setUserLiked] = useState(utilisateur && project.likes && project.likes.find((l) => l.uid === utilisateur.uid))
  const [isLiking, setIsLiking] = useState(false)

  // Real-time listener for likes
  useEffect(() => {
    if (!project.id) return
    const ref = doc(bd, 'projects', project.id)
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data()
        if (data && data.likes) {
          setLikeCount(data.likes.length)
          setUserLiked(utilisateur && data.likes.find((l) => l.uid === utilisateur.uid))
        } else {
          setLikeCount(0)
          setUserLiked(null)
        }
    })
    return () => unsub()
  }, [project.id, utilisateur])

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!project.id) { showToast("Ce projet n'est pas encore dans la base. Importez les données.", { type: 'info' }); return }
    setIsLiking(true)
    try {
      if (!utilisateur) { showToast('Connectez-vous pour aimer', { type: 'info' }); setIsLiking(false); return }
      const uid = utilisateur.uid
      const displayName = utilisateur.displayName || 'Utilisateur'
      await basculerLike(project.id, uid, displayName)
    } catch (err) {
      console.error(err)
      showToast('Erreur lors du like', { type: 'error' })
    } finally {
      setIsLiking(false)
    }
  }

  const thumbnail = useMemo(() => {
    if (project.images?.length) return <img src={resolveUrl(project.images[0])} alt={title} loading="lazy" />
    if (project.image) return <img src={resolveUrl(project.image)} alt={title} loading="lazy" />
    if (project.type === 'video' && project.src) return <video src={resolveUrl(project.src)} muted preload="metadata" />
    return <div className="project-placeholder">{CATEGORY_ICONS[theme.id] || '📁'}</div>
  }, [project, theme.id, title])

  return (
    <div
      className={`project-card ${highlighted ? 'search-hit' : ''}`}
      ref={(node) => registerRef(key, node)}
      onClick={() => onCardClick && onCardClick(project, theme)}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="project-thumbnail">
        {thumbnail}
        <button className={`like-btn ${userLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`} onClick={handleLike} title="Like" style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 999, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6 }}>
          ❤️ {likeCount}
        </button>
        <div className="project-overlay">
          <div className="project-overlay-icon"><OverlayIcon /></div>
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
function Portfolio({ themes, activeFilter, onFilterChange, filteredProjects, onOpenModal, registerProjectRef, highlightedProjectKey, hasSearchFilter }) {
  const { i18n, tObj } = useLanguage()
  const portfolioRef = useRef(null)

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="section">
        <div className="section-header">
          <span className="section-badge">✦ {i18n.portfolio.title}</span>
          <h2 className="section-title">{i18n.portfolio.title}</h2>
          <p className="section-subtitle">{i18n.portfolio.subtitle}</p>
        </div>
        <div className="filter-bar">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => onFilterChange('all')}>
            {i18n.portfolio.filterAll}
          </button>
          {themes.map((theme) => (
            <button key={theme.id} className={`filter-btn ${activeFilter === theme.id ? 'active' : ''}`} onClick={() => onFilterChange(theme.id)}>
              {CATEGORY_ICONS[theme.id]} {tObj(theme.title)}
            </button>
          ))}
        </div>
        {hasSearchFilter && filteredProjects.length === 0 && (
          <p className="portfolio-empty">{i18n.portfolio.noResults || 'No project matched your search.'}</p>
        )}
        <div className="projects-grid" key={activeFilter} ref={portfolioRef}>
          {filteredProjects.map((item, idx) => (
            <ProjectCard
              key={item.key}
              item={item}
              onCardClick={onOpenModal}
              index={idx}
              registerRef={registerProjectRef}
              highlighted={highlightedProjectKey === item.key}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== ProjectModal ===== */
function ProjectModal({ project, onClose }) {
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
      return <video src={resolveUrl(project.src)} controls preload="metadata" />
    if (project.type === 'web' && project.link) {
      if (project.link.startsWith('http'))
        return project.images?.[0] ? <img src={resolveUrl(project.images[0])} alt={title} /> : <iframe src={project.link} title={title} />
      return <iframe src={resolveUrl(project.link)} title={title} />
    }
    if (project.type === 'pdf')
      return project.image ? <img src={resolveUrl(project.image)} alt={title} /> : <iframe src={resolveUrl(project.src)} title={title} />
    if (project.type === 'image-gallery' && project.images)
      return <img src={resolveUrl(project.images[galleryIdx])} alt={`${title} ${galleryIdx + 1}`} />
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
              <a href={project.link.startsWith('http') ? project.link : resolveUrl(project.link)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {i18n.portfolio.viewLive} ↗
              </a>
            )}
            {project.type === 'pdf' && project.src && (
              <a href={resolveUrl(project.src)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <HiOutlineArrowDownTray /> {i18n.portfolio.clickToDownload}
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
    } catch (err) {
      console.error('EmailJS error:', err)
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
function Footer({ searchInput, setSearchInput, onSearch }) {
  const { i18n } = useLanguage()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand">YunYeh.</div>
          <p className="footer-desc">{i18n.footer.description}</p>
          <div className="footer-social">
            <a href="https://github.com/Tseng-YunYeh" target="_blank" rel="noopener noreferrer" className="social-link github" title="GitHub"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/yun-yeh-tseng-52193a34b/" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" className="social-link twitter" title="X (Twitter)"><FaXTwitter /></a>
          </div>
        </div>
        <div className="footer-column">
          <h4>{i18n.footer.searchProjects}</h4>
          <p>{i18n.footer.searchText}</p>
          <form className="footer-search" onSubmit={(e) => { e.preventDefault(); onSearch() }}>
            <input
              type="text"
              placeholder={i18n.footer.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" aria-label="Search"><FiSearch /></button>
          </form>
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
  const { lang, i18n, tObj } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalProject, setModalProject] = useState(null)
  const [modalTheme, setModalTheme] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [highlightedProjectKey, setHighlightedProjectKey] = useState(null)
  const projectRefs = useRef({})

  const { themes } = projectsData
  const [firestoreProjects, setFirestoreProjects] = useState([])

  useEffect(() => {
    // try to load projects from Firestore; if none, keep using local JSON
    const load = async () => {
      try {
        const col = collection(bd, 'projects')
        const snap = await getDocs(col)
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          setFirestoreProjects(docs)
        }
      } catch (err) {
        console.error('Failed to load firestore projects', err)
      }
    }
    load()
  }, [])

  const totalProjects = useMemo(() => {
    if (firestoreProjects.length > 0) return firestoreProjects.length
    return themes.reduce((acc, th) => acc + th.projects.length, 0)
  }, [themes, firestoreProjects])

  const allProjects = useMemo(() => {
    if (firestoreProjects.length > 0) {
      // When using Firestore projects, preserve missing media fields from local JSON as a fallback.
      const localProjects = projectsData.themes.flatMap((theme) =>
        theme.projects.map((project, projectIndex) => ({
          key: `${theme.id}-${projectIndex}`,
          project,
          theme,
        }))
      )

      return firestoreProjects.map((project) => {
        const localMatch = project.title?.en
          ? localProjects.find(({ project: localProject }) => localProject.title?.en === project.title.en)
          : null
        const mergedProject = localMatch ? { ...localMatch.project, ...project } : { ...project }
        const mergedTheme = localMatch
          ? project.theme
            ? { id: project.theme, title: { en: project.theme } }
            : localMatch.theme
          : { id: project.theme || 'imported', title: { en: project.theme || 'Imported' } }

        return {
          key: mergedProject.id || mergedProject._id || mergedProject.title?.en,
          project: mergedProject,
          theme: mergedTheme,
        }
      })
    }
    return themes.flatMap((theme) => theme.projects.map((project, projectIndex) => ({ key: `${theme.id}-${projectIndex}`, project, theme })) )
  }, [themes, firestoreProjects])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const registerProjectRef = useCallback((key, node) => {
    if (node) projectRefs.current[key] = node
    else delete projectRefs.current[key]
  }, [])

  const onFilterChange = useCallback((nextFilter) => {
    setActiveFilter(nextFilter)
    if (nextFilter === 'all') {
      setSearchFilter('')
      setHighlightedProjectKey(null)
    }
  }, [])

  const filteredProjects = useMemo(() => {
    const q = searchFilter.trim().toLowerCase()
    return allProjects
      .filter(({ theme }) => activeFilter === 'all' || activeFilter === theme.id)
      .filter(({ project }) => !q || `${tObj(project.title)} ${tObj(project.description)}`.toLowerCase().includes(q))
  }, [allProjects, activeFilter, searchFilter, tObj])

  const openModal = useCallback((project, theme) => { setModalProject(project); setModalTheme(theme) }, [])
  const closeModal = useCallback(() => { setModalProject(null); setModalTheme(null) }, [])

  const seoConfig = useMemo(() => {
    const pageConfig = {
      '/': {
        title: i18n.home.role,
        description: i18n.about.description,
      },
      '/about': {
        title: i18n.about.title,
        description: i18n.about.subtitle,
      },
      '/portfolio': {
        title: i18n.portfolio.title,
        description: i18n.portfolio.subtitle,
      },
      '/service': {
        title: i18n.service?.title || 'Service',
        description: i18n.service?.subtitle || 'Client services and pricing.',
      },
      '/contact': {
        title: i18n.contact.title,
        description: i18n.contact.subtitle,
      },
    }

    return pageConfig[location.pathname] || {
      title: i18n.home.role,
      description: i18n.about.description,
    }
  }, [i18n, location.pathname])

  useSeo({
    title: seoConfig.title,
    description: seoConfig.description,
    lang,
  })

  const handleFooterSearch = useCallback(() => {
    const q = searchInput.trim().toLowerCase()
    setActiveFilter('all')
    navigate('/portfolio')

    if (!q) {
      setSearchFilter('')
      setHighlightedProjectKey(null)
      return
    }

    setSearchFilter(q)
    const firstMatch = allProjects.find(({ project }) => `${tObj(project.title)} ${tObj(project.description)}`.toLowerCase().includes(q))
    setHighlightedProjectKey(firstMatch?.key || null)
    setSearchInput('')
  }, [allProjects, navigate, searchInput, tObj])

  useEffect(() => {
    if (location.pathname !== '/portfolio' || !highlightedProjectKey) return

    const target = projectRefs.current[highlightedProjectKey]
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const timer = setTimeout(() => setHighlightedProjectKey(null), 2200)
    return () => clearTimeout(timer)
  }, [filteredProjects.length, highlightedProjectKey, location.pathname])

  return (
    <div className="App">
      <Navbar key={location.pathname} scrolled={scrolled} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Hero onGoPortfolio={() => navigate('/portfolio')} totalProjects={totalProjects} totalCategories={themes.length} />} />
          <Route path="/about" element={<About onGoContact={() => navigate('/contact')} />} />
          <Route
            path="/portfolio"
            element={
              <Portfolio
                themes={themes}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                filteredProjects={filteredProjects}
                onOpenModal={openModal}
                registerProjectRef={registerProjectRef}
                highlightedProjectKey={highlightedProjectKey}
                hasSearchFilter={Boolean(searchFilter)}
              />
            }
          />
          <Route path="/service" element={<Service />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Hero onGoPortfolio={() => navigate('/portfolio')} totalProjects={totalProjects} totalCategories={themes.length} />} />
        </Routes>
      </main>
      <Footer searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleFooterSearch} />
      {modalProject && modalTheme && <ProjectModal project={modalProject} onClose={closeModal} />}
    </div>
  )
}

/* ===== App ===== */
export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </LanguageProvider>
    </ToastProvider>
  )
}
