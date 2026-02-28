import { useLanguage } from '../../context/LanguageContext'
import categoryIcons from '../../data/categoryIcons'
import './ProjectCard.css'

const BASE = import.meta.env.BASE_URL

export default function ProjectCard({ project, theme, onClick, index }) {
  const { lang, tObj } = useLanguage()
  const title = tObj(project.title)
  const desc = tObj(project.description)
  const categoryTitle = tObj(theme.title)

  const getThumbnail = () => {
    if (project.images && project.images.length > 0) {
      return <img src={`${BASE}${project.images[0]}`} alt={title} loading="lazy" />
    }
    if (project.image) {
      return <img src={`${BASE}${project.image}`} alt={title} loading="lazy" />
    }
    if (project.type === 'video' && project.src) {
      return <video src={`${BASE}${project.src}`} muted preload="metadata" />
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
