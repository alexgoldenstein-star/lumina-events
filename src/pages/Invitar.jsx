import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { getInvite, markInviteUsed } from '../lib/db'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from '../lib/firebase'
import { PERMISOS_DEFAULT } from '../lib/roles'
import { Input, Button, Alert } from '../components/ui'

export default function Invitar() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const [invite,      setInvite]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    if (!code) return
    getInvite(code).then(inv => {
      setInvite(inv)
      setLoading(false)
    })
  }, [code])

  async function handleAccept() {
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setSaving(true); setError('')
    try {
      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, invite.email, password)
      await updateProfile(cred.user, { displayName: invite.email.split('@')[0] })

      // Get member data from team
      const { get: fbGet, ref: fbRef } = await import('firebase/database')
      const memberSnap = await fbGet(fbRef(db, `teams/${invite.ownerUid}/members/${invite.memberId}`))
      const memberData = memberSnap.val() || {}

      // Save profile
      const profileData = {
        nombre:      memberData.nombre || invite.email.split('@')[0],
        email:       invite.email,
        role:        invite.role,
        ownerUid:    invite.ownerUid,
        permisos:    memberData.permisos || PERMISOS_DEFAULT[invite.role] || [],
        hideComisiones: false,
        createdAt:   new Date().toISOString(),
        plan:        'team',
      }
      await set(fbRef(db, `users/${cred.user.uid}/profile`), profileData)

      // Update member with uid
      await import('firebase/database').then(({ update: fbUpdate }) =>
        fbUpdate(fbRef(db, `teams/${invite.ownerUid}/members/${invite.memberId}`), { uid: cred.user.uid })
      )

      await markInviteUsed(code, cred.user.uid)
      navigate('/')
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setError('Ese email ya tiene una cuenta. Iniciá sesión normalmente.')
      else setError(e.message)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">❌</span></div>
        <h1 className="text-xl font-serif text-ink-800">Invitación no encontrada</h1>
        <p className="text-sm text-ink-400 mt-2">El código es inválido o ya fue usado.</p>
        <button onClick={() => navigate('/login')} className="mt-4 text-rose-500 hover:underline text-sm">Ir al login</button>
      </div>
    </div>
  )

  if (invite.used) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✅</span></div>
        <h1 className="text-xl font-serif text-ink-800">Invitación ya usada</h1>
        <p className="text-sm text-ink-400 mt-2">Esta invitación ya fue aceptada. Iniciá sesión normalmente.</p>
        <button onClick={() => navigate('/login')} className="mt-4 text-rose-500 hover:underline text-sm">Ir al login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white"/>
          </div>
          <h1 className="text-3xl font-serif text-ink-800">Te invitaron a</h1>
          <p className="text-rose-600 font-medium mt-1">Lumina Events</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 p-8 shadow-sm space-y-5">
          <div className="p-3 bg-rose-50 rounded-xl text-sm text-center">
            <p className="text-ink-500">Vas a acceder como</p>
            <p className="font-medium text-ink-800">{invite.email}</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="relative">
            <Input label="Elegí tu contraseña" type={showPass ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"/>
            <button onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-7 text-ink-400 hover:text-ink-600">
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          <Input label="Confirmá la contraseña" type="password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAccept()}/>

          <Button className="w-full justify-center" onClick={handleAccept} loading={saving}>
            Crear mi acceso
          </Button>
        </div>
      </div>
    </div>
  )
}
