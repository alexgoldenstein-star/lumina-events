import { useState, useEffect } from 'react'
import { ref, set, get, update } from 'firebase/database'
import { db, auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { Shield, Check, AlertTriangle, Link2, LogOut } from 'lucide-react'

// ─── CONFIGURACIÓN DEL WORKSPACE ─────────────────────────────────────────────
// Editá estos emails para cambiar quiénes comparten workspace
const WORKSPACE_EMAILS = [
  'mp@niviko.com.ar',
  'jazrosenberg@gmail.com',
  'alex@niviko.com.ar',
]
// El primero de la lista es el "master" (dueña de los datos)
const MASTER_EMAIL = WORKSPACE_EMAILS[0]
// ─────────────────────────────────────────────────────────────────────────────

export default function Setup() {
  const [user,     setUser]     = useState(null)
  const [running,  setRunning]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [masterUid,setMasterUid]= useState('')

  useEffect(() => {
    setUser(auth.currentUser)
    // Intentar leer masterUid ya guardado
    get(ref(db, 'workspace/masterUid')).then(s => {
      if (s.exists()) setMasterUid(s.val())
    }).catch(()=>{})
  }, [])

  const isMaster = user?.email === MASTER_EMAIL
  const isAllowed = WORKSPACE_EMAILS.includes(user?.email || '')

  async function runSetup() {
    if (!user) return
    setRunning(true); setResult(null)
    try {
      if (isMaster) {
        // ── PASO 1: master registra su UID ────────────────────────────
        await set(ref(db, 'workspace/masterUid'),   user.uid)
        await set(ref(db, 'workspace/masterEmail'), user.email)
        // Asegura que su propio perfil sea admin con ownerUid = su uid
        const profileSnap = await get(ref(db, `users/${user.uid}/profile`))
        const existing = profileSnap.val() || {}
        await update(ref(db, `users/${user.uid}/profile`), {
          ...existing,
          role:      'admin',
          email:     user.email,
          ownerUid:  user.uid,
          updatedAt: new Date().toISOString(),
        })
        setMasterUid(user.uid)
        setResult({ ok: true, msg: `✓ Workspace master configurado. Ahora las otras cuentas deben entrar a /setup y hacer clic en "Vincularme".` })
      } else {
        // ── PASO 2: otros se vinculan al workspace del master ─────────
        if (!masterUid) {
          // Intentar leer de la DB
          const s = await get(ref(db, 'workspace/masterUid'))
          if (!s.exists()) {
            setResult({ ok: false, msg: `mp@niviko.com.ar debe entrar primero a /setup y configurarse como master.` })
            setRunning(false); return
          }
          setMasterUid(s.val())
        }
        const mUid = masterUid || (await get(ref(db, 'workspace/masterUid'))).val()
        const profileSnap = await get(ref(db, `users/${user.uid}/profile`))
        const existing = profileSnap.val() || {}
        await update(ref(db, `users/${user.uid}/profile`), {
          ...existing,
          role:      existing.role || 'admin',
          email:     user.email,
          ownerUid:  mUid,   // ← CLAVE: apunta al workspace de mp@
          updatedAt: new Date().toISOString(),
        })
        setResult({ ok: true, msg: `✓ ${user.email} vinculado al workspace de ${MASTER_EMAIL}. Cerrá sesión y volvé a entrar.` })
      }
    } catch(e) {
      setResult({ ok: false, msg: `Error: ${e.message}` })
    }
    setRunning(false)
  }

  async function handleLogout() {
    await signOut(auth)
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-nude-200 shadow-sm p-8 w-full max-w-md space-y-6">

        <div className="text-center">
          <div className="w-14 h-14 bg-warm-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-white"/>
          </div>
          <h1 className="text-2xl font-serif text-ink-800">Setup de workspace</h1>
          <p className="text-sm text-ink-400 mt-1">Vinculación de cuentas para compartir datos</p>
        </div>

        {!user ? (
          <div className="text-center py-4">
            <p className="text-sm text-ink-500">Necesitás iniciar sesión primero</p>
            <a href="/login" className="text-warm-600 hover:underline text-sm mt-2 block">Ir al login →</a>
          </div>
        ) : !isAllowed ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-sm text-red-600">Email no autorizado: <strong>{user.email}</strong></p>
          </div>
        ) : (
          <>
            {/* Cuenta actual */}
            <div className="p-4 bg-nude-50 border border-nude-200 rounded-xl">
              <p className="text-xs text-ink-400 mb-1 font-medium uppercase tracking-wide">Cuenta actual</p>
              <p className="text-sm font-medium text-ink-800">{user.email}</p>
              <p className="text-xs text-warm-600 mt-1">
                {isMaster ? '👑 Master del workspace — configurá primero' : '👤 Se vinculará al workspace de ' + MASTER_EMAIL}
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-2 text-sm">
              {WORKSPACE_EMAILS.map((email, i) => (
                <div key={email} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  email === user.email ? 'border-warm-300 bg-warm-50' : 'border-nude-200 bg-white'
                }`}>
                  <span className="text-base">{i === 0 ? '👑' : '👤'}</span>
                  <div className="flex-1">
                    <p className={`text-sm ${email === user.email ? 'font-medium text-warm-800' : 'text-ink-600'}`}>{email}</p>
                    <p className="text-xs text-ink-400">{i === 0 ? 'Master — dueña de los datos' : 'Se vincula al workspace'}</p>
                  </div>
                  {email === user.email && <span className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded-full">Vos</span>}
                </div>
              ))}
            </div>

            {/* Resultado */}
            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                result.ok ? 'bg-sage-50 border-sage-200 text-sage-700' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                {result.ok ? <Check size={16} className="flex-shrink-0 mt-0.5"/> : <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"/>}
                <span>{result.msg}</span>
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={runSetup}
              disabled={running}
              className="w-full py-3 bg-warm-500 text-white rounded-xl font-medium hover:bg-warm-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {running ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Configurando...</>
              ) : isMaster ? (
                <><Shield size={16}/> Configurarme como master</>
              ) : (
                <><Link2 size={16}/> Vincularme al workspace de {MASTER_EMAIL}</>
              )}
            </button>

            {result?.ok && (
              <button onClick={handleLogout}
                className="w-full py-2.5 border border-nude-300 text-ink-600 rounded-xl text-sm hover:bg-nude-100 transition-colors flex items-center justify-center gap-2">
                <LogOut size={15}/> Cerrar sesión para aplicar cambios
              </button>
            )}
          </>
        )}

        <p className="text-center text-xs text-ink-400">
          <a href="/dashboard" className="text-warm-600 hover:underline">Volver al dashboard</a>
        </p>
      </div>
    </div>
  )
}
