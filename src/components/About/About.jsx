import { useLanguage } from '../../context/LanguageContext'
import './About.css'

const BASE = import.meta.env.BASE_URL

const skills = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Figma',
  'Video Editing', '3D Rendering', 'UI/UX Design',
  'Responsive Design', 'Adobe Suite', 'Git'
]

export default function About({ onScrollTo }) {
  const { i18n } = useLanguage()

  return (
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

            <button className="btn btn-primary" onClick={() => onScrollTo('contact')}>
              {i18n.about.letsTalk} →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
