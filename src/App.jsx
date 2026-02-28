import { useState, useEffect, useCallback } from 'react'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Portfolio from './components/Portfolio/Portfolio'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import ProjectModal from './components/ProjectModal/ProjectModal'
import projectsData from './data/projects.json'
import './App.css'

function AppContent() {
  const { lang, tObj } = useLanguage()
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalProject, setModalProject] = useState(null)
  const [modalTheme, setModalTheme] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { themes } = projectsData
  const totalProjects = themes.reduce((acc, th) => acc + th.projects.length, 0)

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = ['home', 'about', 'portfolio', 'contact']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Filtered projects
  const getFilteredProjects = () => {
    let items = []
    themes.forEach((theme) => {
      theme.projects.forEach((project) => {
        if (activeFilter === 'all' || activeFilter === theme.id) {
          items.push({ project, theme })
        }
      })
    })
    if (searchQuery.trim()) {
      items = items.filter(({ project }) => {
        const title = tObj(project.title).toLowerCase()
        const desc = tObj(project.description).toLowerCase()
        return title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase())
      })
    }
    return items
  }

  const openModal = useCallback((project, theme) => {
    setModalProject(project)
    setModalTheme(theme)
  }, [])

  const closeModal = useCallback(() => {
    setModalProject(null)
    setModalTheme(null)
  }, [])

  const handleFooterSearch = () => {
    setActiveFilter('all')
    scrollTo('portfolio')
  }

  return (
    <div className="App">
      <Navbar
        activeSection={activeSection}
        scrolled={scrolled}
        onScrollTo={scrollTo}
      />
      <Hero
        onScrollTo={scrollTo}
        totalProjects={totalProjects}
        totalCategories={themes.length}
      />
      <About onScrollTo={scrollTo} />
      <Portfolio
        themes={themes}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filteredProjects={getFilteredProjects()}
        onOpenModal={openModal}
      />
      <Contact />
      <Footer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleFooterSearch}
      />

      {modalProject && modalTheme && (
        <ProjectModal
          project={modalProject}
          theme={modalTheme}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
