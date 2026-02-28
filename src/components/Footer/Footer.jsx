import { useLanguage } from '../../context/LanguageContext'
import './Footer.css'

export default function Footer({ searchQuery, setSearchQuery, onSearch }) {
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) onSearch()
              }}
            />
            <button onClick={onSearch}>🔍</button>
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
