import projectsData from '../data/projects.json'
import { bd } from '../firebase/init'
import { collection, getDocs, addDoc, updateDoc } from 'firebase/firestore'

export async function remplirCollectionProjects() {
  const col = collection(bd, 'projects')
  const snap = await getDocs(col)
  if (!snap.empty) return console.log('La collection projects contient déjà des documents.')

  const all = []
  projectsData.themes.forEach((theme) => {
    theme.projects.forEach((p) => {
      const docToAdd = {
        title: p.title || { en: p.title },
        description: p.description || { en: p.description },
        type: p.type || 'web',
        link: p.link || p.src || null,
        image: p.image || (p.images && p.images[0]) || null,
        theme: theme.id,
      }
      all.push(docToAdd)
    })
  })

  for (const d of all) {
    const ref = await addDoc(col, d)
    // write back the generated id into the document so front-end can reference it
    await updateDoc(ref, { id: ref.id })
  }
  console.log('Import terminé —', all.length, 'documents ajoutés.')
}
