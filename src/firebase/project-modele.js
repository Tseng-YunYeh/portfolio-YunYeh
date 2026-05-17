import { bd } from './init'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

export async function basculerLike(projectId, uid, displayName) {
  if (!projectId || !uid) throw new Error('projectId and uid required')
  const ref = doc(bd, 'projects', projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Project not found')
  const data = snap.data()
  const likes = data.likes || []

  const already = likes.find((l) => l.uid === uid)
  if (already) {
    // remove
    await updateDoc(ref, { likes: likes.filter((l) => l.uid !== uid) })
    return { liked: false }
  } else {
    const newLike = { uid, displayName, date: Date.now() }
    // use arrayUnion to avoid race but store objects
    await updateDoc(ref, { likes: arrayUnion(newLike) })
    return { liked: true }
  }
}
