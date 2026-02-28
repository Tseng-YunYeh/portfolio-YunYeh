import { useLanguage } from '../../context/LanguageContext'
import ProjectCard from '../ProjectCard/ProjectCard'
import categoryIcons from '../../data/categoryIcons'
import './Portfolio.css'

export default function Portfolio({ themes, activeFilter, setActiveFilter, filteredProjects, onOpenModal }) {
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
              {categoryIcons[theme.id]} {tObj(theme.title)}
            </button>
          ))}
        </div>

        <div className="projects-grid" key={activeFilter}>
          {filteredProjects.map(({ project, theme }, idx) => (
            <ProjectCard
              key={`${theme.id}-${idx}`}
              project={project}
              theme={theme}
              onClick={onOpenModal}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
