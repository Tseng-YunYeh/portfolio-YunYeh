import { createContext, useContext, useEffect, useState } from 'react'
import { auth, provider, bd } from '../firebase/init'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [estConnecte, setEstConnecte] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUtilisateur(null)
        setEstConnecte(false)
        return
      }

      // Ensure user doc exists and read admin flag
      const uref = doc(bd, 'utilisateurs', user.uid)
      await setDoc(
        uref,
        { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL },
        { merge: true }
      )
      const snap = await getDoc(uref)
      const data = snap.exists() ? snap.data() : { estAdmin: false }
      setUtilisateur({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL, ...data })
      setEstConnecte(true)
    })

    return () => unsub()
  }, [])

  const connexion = async () => {
    await signInWithPopup(auth, provider)
  }

  const deconnexion = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, estConnecte, connexion, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
