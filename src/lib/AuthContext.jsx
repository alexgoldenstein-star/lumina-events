import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await get(ref(db, `users/${u.uid}/profile`))
        setProfile(snap.val())
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function register(email, password, { nombre, orgName }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: nombre })
    const profileData = {
      nombre,
      orgName: orgName || nombre,
      email,
      role: 'organizadora',
      createdAt: new Date().toISOString(),
      plan: 'free',
    }
    await set(ref(db, `users/${cred.user.uid}/profile`), profileData)
    setProfile(profileData)
    return cred
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function updateProfileData(data) {
    if (!user) return
    await set(ref(db, `users/${user.uid}/profile`), { ...profile, ...data })
    setProfile(p => ({ ...p, ...data }))
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout, resetPassword, updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
