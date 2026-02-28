import { useLanguage } from '../../context/LanguageContext'
import './Contact.css'

export default function Contact() {
  const { i18n } = useLanguage()

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
  )
}
