import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { auth, db } from './firebase'
import { tienePermiso, PERMISOS_DEFAULT } from './roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [teamOwner, setTeamOwner] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await get(ref(db, `users/${u.uid}/profile`))
        const p = snap.val()
        setProfile(p)

        if (p) {
          // Admin con ownerUid = su propio uid → es el workspace master
          // Admin con ownerUid de otro → está vinculado a ese workspace
          // Cualquier rol con ownerUid → usa ese como teamOwner
          const owner = p.ownerUid || u.uid
          setTeamOwner(owner)
        } else {
          // Sin perfil → usa su propio uid
          setTeamOwner(u.uid)
        }
      } else {
        setProfile(null)
        setTeamOwner(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function register(email, password, { nombre, orgName, role = 'admin', ownerUid = null, permisos = null }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: nombre })
    const effectiveOwner = ownerUid || cred.user.uid
    const profileData = {
      nombre, orgName: orgName||nombre, email, role,
      ownerUid: effectiveOwner,
      permisos: permisos||PERMISOS_DEFAULT[role]||[],
      hideComisiones: false,
      createdAt: new Date().toISOString(),
      plan: 'free',
    }
    await set(ref(db, `users/${cred.user.uid}/profile`), profileData)
    setProfile(profileData)
    setTeamOwner(effectiveOwner)
    return cred
  }

  async function logout() { await signOut(auth) }
  async function resetPassword(email) { return sendPasswordResetEmail(auth, email) }

  async function updateProfileData(data) {
    if (!user) return
    const updated = { ...profile, ...data }
    await update(ref(db, `users/${user.uid}/profile`), updated)
    setProfile(updated)
  }

  async function toggleHideComisiones() {
    const val = !profile?.hideComisiones
    await updateProfileData({ hideComisiones: val })
    return val
  }

  function can(permiso) { return tienePermiso(profile, permiso) }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout, resetPassword,
      updateProfileData, toggleHideComisiones,
      hideComisiones: profile?.hideComisiones || false,
      can,
      isAdmin:   profile?.role === 'admin',
      teamOwner: teamOwner || user?.uid,
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
