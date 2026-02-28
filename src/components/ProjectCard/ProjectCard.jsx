import { useLanguage } from '../../context/LanguageContext'
import categoryIcons from '../../data/categoryIcons'
import './ProjectCard.css'

const BASE = import.meta.env.BASE_URL

export default function ProjectCard({ project, theme, onClick, index }) {
  const { tObj } = useLanguage()
  const [title, desc, categoryTitle] = [project.title, project.description, theme.title].map(tObj)

  const overlayIcons = { video: '▶', web: '↗', pdf: '📥', 'image-gallery': '🖼' }

  const getThumbnail = () => {
    if (project.images?.length) return <img src={`${BASE}${project.images[0]}`} alt={title} loading="lazy" />
    if (project.image) return <img src={`${BASE}${project.image}`} alt={title} loading="lazy" />
    if (project.type === 'video' && project.src) return <video src={`${BASE}${project.src}`} muted preload="metadata" />
    return <div className="project-placeholder">{categoryIcons[theme.id] || '📁'}</div>
  }

  return (
    <div className="project-card" onClick={() => onClick(project, theme)} style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="project-thumbnail">
        {getThumbnail()}
        <div className="project-overlay">
          <div className="project-overlay-icon">{overlayIcons[project.type] || '👁'}</div>
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
