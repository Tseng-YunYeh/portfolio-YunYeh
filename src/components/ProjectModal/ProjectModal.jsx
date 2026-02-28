import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './ProjectModal.css'

const BASE = import.meta.env.BASE_URL

export default function ProjectModal({ project, theme, onClose }) {
  const { lang, i18n, tObj } = useLanguage()
  const [galleryIdx, setGalleryIdx] = useState(0)
  const title = tObj(project.title)
  const desc = tObj(project.description)

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
