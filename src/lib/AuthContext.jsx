import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail,
} from 'firebase/auth'
import { ref, set, get, update } from 'firebase/database'
import { auth, db } from './firebase'
import { tienePermiso, PERMISOS_DEFAULT } from './roles'

const AuthContext = createContext(null)

// El workspace principal — todos los admins comparten el mismo team root
// Usamos el UID del primer admin que se registró, o podemos usar un workspace fijo
// Para simplificar: cada admin ES su propio workspace root
// Cuando dos admins quieren compartir team, uno debe estar en el equipo del otro

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [profile,   setProfile]   = useState(null)
  const [teamOwner, setTeamOwner] = useState(null) // el UID raíz del workspace
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await get(ref(db, `users/${u.uid}/profile`))
        const p = snap.val()
        setProfile(p)

        // Determinar el workspace owner
        // Si es admin → es su propio workspace
        // Si tiene ownerUid explícito en profile → usa ese
        // Fallback → su propio uid
        if (p) {
          const owner = p.role === 'admin' ? u.uid : (p.ownerUid || u.uid)
          setTeamOwner(owner)
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

    // Para admins: ownerUid = su propio uid (son su propio workspace)
    const effectiveOwner = role === 'admin' ? cred.user.uid : (ownerUid || cred.user.uid)

    const profileData = {
      nombre,
      orgName:        orgName || nombre,
      email,
      role,
      ownerUid:       effectiveOwner,
      permisos:       permisos || PERMISOS_DEFAULT[role] || [],
      hideComisiones: false,
      createdAt:      new Date().toISOString(),
      plan:           'free',
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
      isAdmin:    profile?.role === 'admin',
      // teamOwner = el UID bajo el cual están los datos del equipo
      // Para un admin: su propio uid
      // Para un miembro: el uid del admin que lo creó
      teamOwner:  teamOwner || user?.uid,
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
