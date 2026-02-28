import { useLanguage } from '../../context/LanguageContext'
import './About.css'

const BASE = import.meta.env.BASE_URL

const skills = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Figma',
  'Video Editing', '3D Rendering', 'UI/UX Design',
  'Responsive Design', 'Adobe Suite', 'Git'
]

const experiences = [1, 2]

export default function About({ onScrollTo }) {
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
              {skills.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}
            </div>

            <h3>{a.experience}</h3>
            <div className="experience-list">
              {experiences.map((n) => (
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
