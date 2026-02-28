import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './Navbar.css'

export default function Navbar({ activeSection, scrolled, onScrollTo }) {
  const { lang, switchLanguage, i18n } = useLanguage()
  const [mobileNav, setMobileNav] = useState(false)

  const handleNav = (id) => {
    onScrollTo(id)
    setMobileNav(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo">YunYeh.</div>
      <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
        {['home', 'about', 'portfolio', 'contact'].map((section) => (
          <button
            key={section}
            className={`nav-link ${activeSection === section ? 'active' : ''}`}
            onClick={() => handleNav(section)}
          >
            {i18n.nav[section]}
          </button>
        ))}
        <div className="lang-selector">
          {['en', 'fr', 'es', 'zh'].map((l) => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => switchLanguage(l)}
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
  )
}
