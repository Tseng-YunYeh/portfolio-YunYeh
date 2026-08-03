import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { bd, storage } from '../firebase/init'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import './Admin.css'

export default function Admin() {
  const { utilisateur, connexion, deconnexion } = useAuth()
  const { showToast } = useToast()
  const { i18n } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ title_en: '', title_fr: '', title_es: '', title_zh: '', type: 'web', link: '', imageFile: null, imageFiles: [], pdfFile: null, coverFile: null, videoFile: null })
  const [editingId, setEditingId] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const isSilentLoginCancel = (error) => {
    const code = error?.code
    return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
  }

  const colRef = collection(bd, 'projects')

  useEffect(() => {
    if (!utilisateur) return
    fetchProjects()
  }, [utilisateur])

  async function fetchProjects() {
    setLoading(true)
    const snap = await getDocs(colRef)
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setProjects(docs)
    setLoading(false)
  }

  async function handleUploadFile(file, path) {
    if (!file) return null
    const r = ref(storage, `${path}/${Date.now()}_${file.name}`)
    await uploadBytes(r, file)
    return getDownloadURL(r)
  }

  const getTotalFiles = () => {
    let count = 0
    if (form.type === 'web') count = (form.imageFile ? 1 : 0)
    if (form.type === 'pdf') count = (form.pdfFile ? 1 : 0) + (form.coverFile ? 1 : 0)
    if (form.type === 'video') count = form.videoFile ? 1 : 0
    if (form.type === 'prototype') count = (form.imageFile ? 1 : 0)
    if (form.type === 'image-gallery') count = form.imageFiles.length + (form.coverFile ? 1 : 0)
    return count
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)
    try {
      const payload = { title: { en: form.title_en, fr: form.title_fr, es: form.title_es, zh: form.title_zh }, type: form.type }

      if (form.type === 'pdf') {
        const pdfUrl = await handleUploadFile(form.pdfFile, 'projects/pdf')
        setUploadProgress(50)
        const coverUrl = await handleUploadFile(form.coverFile, 'projects/covers')
        if (pdfUrl) payload.src = pdfUrl
        if (coverUrl) payload.image = coverUrl
        setUploadProgress(100)
      }

      if (form.type === 'video') {
        const videoUrl = await handleUploadFile(form.videoFile, 'projects/video')
        if (videoUrl) payload.src = videoUrl
        setUploadProgress(100)
      }

      if (form.type === 'web') {
        if (form.link) payload.link = form.link
        const imgUrl = await handleUploadFile(form.imageFile, 'projects/images')
        if (imgUrl) payload.image = imgUrl
        setUploadProgress(100)
      }

      if (form.type === 'prototype') {
        if (form.link) payload.link = form.link
        const imgUrl = await handleUploadFile(form.imageFile, 'projects/images')
        if (imgUrl) payload.image = imgUrl
        setUploadProgress(100)
      }

      if (form.type === 'image-gallery') {
        const uploadedImages = []
        const totalFiles = form.imageFiles.length + (form.coverFile ? 1 : 0)
        let uploaded = 0
        for (const img of form.imageFiles) {
          const url = await handleUploadFile(img, 'projects/gallery')
          if (url) uploadedImages.push(url)
          uploaded++
          setUploadProgress(Math.floor((uploaded / totalFiles) * 100))
        }
        if (uploadedImages.length > 0) payload.images = uploadedImages
        const coverUrl = await handleUploadFile(form.coverFile, 'projects/covers')
        if (coverUrl) payload.image = coverUrl
        setUploadProgress(100)
      }

      if (editingId) {
        await updateDoc(doc(bd, 'projects', editingId), payload)
        showToast(i18n.toast.projectUpdated, { type: 'info' })
      } else {
        await addDoc(colRef, payload)
        showToast(i18n.toast.projectCreated, { type: 'info' })
      }

      setForm({ title_en: '', title_fr: '', title_es: '', title_zh: '', type: 'web', link: '', imageFile: null, imageFiles: [], pdfFile: null, coverFile: null, videoFile: null, existingImage: null, existingLink: null, existingImages: [] })
      setEditingId(null)
      setUploadProgress(0)
      await fetchProjects()
    } catch (err) {
      console.error(err)
      showToast(i18n.toast.saveError, { type: 'error' })
    }
    setLoading(false)
    setUploadProgress(0)
  }

  async function handleEdit(p) {
    setEditingId(p.id)
    setForm({ 
      title_en: p.title?.en || '', 
      title_fr: p.title?.fr || '', 
      title_es: p.title?.es || '', 
      title_zh: p.title?.zh || '', 
      type: p.type || 'web', 
      link: p.link || '', 
      imageFile: null, 
      imageFiles: [],
      pdfFile: null, 
      coverFile: null, 
      videoFile: null,
      existingImage: p.image,
      existingLink: p.link,
      existingImages: p.images || []
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return
    try {
      const project = projects.find(p => p.id === id)
      if (!project) throw new Error('Projet non trouvé')

      // Delete associated files from Storage
      const filePaths = []
      if (project.image) {
        // Extract path from URL like "https://...?alt=media"
        try {
          const url = new URL(project.image)
          const pathParts = url.pathname.split('/o/')[1]?.split('?')[0]
          if (pathParts) filePaths.push(decodeURIComponent(pathParts))
        } catch (e) { console.warn('Could not parse image URL') }
      }
      if (project.src) {
        try {
          const url = new URL(project.src)
          const pathParts = url.pathname.split('/o/')[1]?.split('?')[0]
          if (pathParts) filePaths.push(decodeURIComponent(pathParts))
        } catch (e) { console.warn('Could not parse src URL') }
      }
      if (project.images && Array.isArray(project.images)) {
        for (const img of project.images) {
          try {
            const url = new URL(img)
            const pathParts = url.pathname.split('/o/')[1]?.split('?')[0]
            if (pathParts) filePaths.push(decodeURIComponent(pathParts))
          } catch (e) { console.warn('Could not parse image URL') }
        }
      }

      // Delete all files
      for (const path of filePaths) {
        try {
          const fileRef = ref(storage, path)
          await deleteObject(fileRef)
        } catch (e) {
          console.warn(`Could not delete ${path}:`, e)
        }
      }

      // Delete project document
      await deleteDoc(doc(bd, 'projects', id))
      showToast(i18n.toast.projectDeleted, { type: 'info' })
      await fetchProjects()
    } catch (err) {
      console.error(err)
      showToast(i18n.toast.deleteError, { type: 'error' })
    }
  }

  const handleLogin = async () => {
    try {
      await connexion()
      showToast(i18n.auth.connectSuccess, { type: 'success' })
    } catch (error) {
      if (isSilentLoginCancel(error)) return
      console.error(error)
      showToast(i18n.auth.connectError, { type: 'error' })
    }
  }

  const handleLogout = async () => {
    try {
      await deconnexion()
      showToast(i18n.auth.disconnectSuccess, { type: 'info' })
    } catch (error) {
      console.error(error)
      showToast(i18n.auth.disconnectError, { type: 'error' })
    }
  }

  if (!utilisateur) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <button className="btn-back" onClick={() => navigate('/')}>← Retourner</button>
          <h1>Admin</h1>
        </div>
        <div className="admin-not-auth">
          <p className="admin-notice">Vous devez vous connecter pour accéder à l'administration.</p>
          <button className="btn btn-primary btn-large" onClick={handleLogin}>Se connecter</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="btn-back" onClick={() => navigate('/')}>← Retourner</button>
        <h1>Admin - Gestion des projets</h1>
        <div className="user-info">
          <img src={utilisateur.photoURL} alt={utilisateur.displayName} className="avatar-small" />
          <span>{utilisateur.displayName}</span>
          <button className="btn btn-logout" onClick={() => setLogoutOpen(true)}>{i18n.nav.logout}</button>
        </div>
      </div>

      <section className="admin-actions">
        <div className="admin-form-section">
          <h2>{editingId ? '✏️ Éditer le projet' : '➕ Créer un nouveau projet'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Titre (EN)*</label>
              <input 
                type="text" 
                value={form.title_en} 
                onChange={(e) => setForm({ ...form, title_en: e.target.value })} 
                required 
                placeholder="Entrez le titre en anglais"
              />
            </div>

            <div className="form-group">
              <label>Titre (FR)</label>
              <input 
                type="text" 
                value={form.title_fr} 
                onChange={(e) => setForm({ ...form, title_fr: e.target.value })} 
                placeholder="Titre en français"
              />
            </div>

            <div className="form-group">
              <label>Titre (ES)</label>
              <input 
                type="text" 
                value={form.title_es} 
                onChange={(e) => setForm({ ...form, title_es: e.target.value })} 
                placeholder="Título en español"
              />
            </div>

            <div className="form-group">
              <label>Titre (ZH)</label>
              <input 
                type="text" 
                value={form.title_zh} 
                onChange={(e) => setForm({ ...form, title_zh: e.target.value })} 
                placeholder="用中文輸入標題"
              />
            </div>

            <div className="form-group">
              <label>Type de projet*</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="web">🌐 Web</option>
                <option value="pdf">📄 PDF</option>
                <option value="video">🎬 Vidéo</option>
                <option value="image-gallery">🖼️ Galerie d'images</option>
                <option value="prototype">📱 Prototype</option>
              </select>
            </div>

            {form.type === 'web' && (
              <>
                <div className="form-group">
                  <label>Lien URL*</label>
                  <input 
                    type="text" 
                    value={form.link} 
                    onChange={(e) => setForm({ ...form, link: e.target.value })} 
                    placeholder="https://exemple.com"
                    required
                  />
                  {form.existingLink && !form.link && <span className="existing-value">🔗 Lien actuel: <a href={form.existingLink} target="_blank" rel="noopener noreferrer">{form.existingLink.substring(0, 50)}...</a></span>}
                </div>
                <div className="form-group">
                  <label>Image de couverture*</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })} required={!editingId && !form.existingImage} />
                  {form.imageFile && <span className="file-preview">✓ {form.imageFile.name}</span>}
                  {form.existingImage && !form.imageFile && <span className="existing-value">🖼️ Image actuelle:<br/><img src={form.existingImage} alt="preview" style={{maxWidth: '120px', maxHeight: '100px', marginTop: '8px', borderRadius: '4px'}} /></span>}
                </div>
              </>
            )}

            {form.type === 'pdf' && (
              <>
                <div className="form-group">
                  <label>Fichier PDF*</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, pdfFile: e.target.files?.[0] })} required={!editingId} />
                  {form.pdfFile && <span className="file-preview">✓ {form.pdfFile.name}</span>}
                </div>
                <div className="form-group">
                  <label>Image de couverture*</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, coverFile: e.target.files?.[0] })} />
                  {form.coverFile && <span className="file-preview">✓ {form.coverFile.name}</span>}
                  {form.existingImage && !form.coverFile && <span className="existing-value">🖼️ Image actuelle:<br/><img src={form.existingImage} alt="preview" style={{maxWidth: '120px', maxHeight: '100px', marginTop: '8px', borderRadius: '4px'}} /></span>}
                </div>
              </>
            )}

            {form.type === 'video' && (
              <div className="form-group">
                <label>Fichier vidéo*</label>
                <input type="file" accept="video/*" onChange={(e) => setForm({ ...form, videoFile: e.target.files?.[0] })} required={!editingId} />
                {form.videoFile && <span className="file-preview">✓ {form.videoFile.name}</span>}
              </div>
            )}

            {form.type === 'image-gallery' && (
              <>
                <div className="form-group">
                  <label>Images (plusieurs fichiers)*</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, imageFiles: e.target.files ? Array.from(e.target.files) : [] })} />
                  {form.imageFiles.length > 0 && <span className="file-preview">✓ {form.imageFiles.length} image(s) sélectionnée(s)</span>}
                </div>
                <div className="form-group">
                  <label>Image de couverture (affichée en liste)*</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, coverFile: e.target.files?.[0] })} />
                  {form.coverFile && <span className="file-preview">✓ {form.coverFile.name}</span>}
                </div>
              </>
            )}

            {form.type === 'prototype' && (
              <>
                <div className="form-group">
                  <label>Lien vers le prototype*</label>
                  <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." required />
                </div>
                <div className="form-group">
                  <label>Image de couverture*</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })} required={!editingId && !form.existingImage} />
                  {form.imageFile && <span className="file-preview">✓ {form.imageFile.name}</span>}
                  {form.existingImage && !form.imageFile && <span className="existing-value">🖼️ Image actuelle:<br/><img src={form.existingImage} alt="preview" style={{maxWidth: '120px', maxHeight: '100px', marginTop: '8px', borderRadius: '4px'}} /></span>}
                </div>
              </>
            )}

            <div className="form-actions">
              {loading && getTotalFiles() > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${uploadProgress}%`}}></div>
                  </div>
                  <span className="progress-text">{uploadProgress}% - Upload en cours...</span>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Enregistrement...' : (editingId ? '✓ Mettre à jour' : '➕ Ajouter le projet')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => { 
                    setEditingId(null)
                    setForm({ title_en: '', title_fr: '', title_es: '', title_zh: '', type: 'web', link: '', imageFile: null, imageFiles: [], pdfFile: null, coverFile: null, videoFile: null, existingImage: null, existingLink: null, existingImages: [] })
                  }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="admin-list-section">
        <h2>📊 Mes projets ({projects.length})</h2>
        {loading ? (
          <div className="loading">⏳ Chargement...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>Aucun projet pour l'instant.</p>
            <p>Importez les données ou créez un nouveau projet ci-dessus.</p>
          </div>
        ) : (
          <div className="projects-table">
            {projects.map((p) => (
              <div key={p.id} className="project-row">
                <div className="project-info">
                  <h3>{p.title?.en || p.title_en}</h3>
                  <span className="project-type">{p.type}</span>
                </div>
                <div className="project-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(p)}>Éditer</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <ConfirmDialog
        open={logoutOpen}
        title={i18n.auth.disconnectConfirmTitle}
        message={i18n.auth.disconnectConfirmMessage}
        confirmLabel={i18n.nav.logout}
        cancelLabel={i18n.common.cancel}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLogoutOpen(false)
          await handleLogout()
        }}
      />
    </div>
  )
}
