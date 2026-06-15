import { useState } from 'react'
import { ref, set, get } from 'firebase/database'
import { db, auth } from '../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Sparkles, Check, AlertTriangle } from 'lucide-react'

// Usuarios a configurar como admin
const ADMINS = [
  { email: 'alex@niviko.com.ar', nombre: 'Alex',  orgName: 'JR Eventos' },
  { email: 'mp@niviko.com.ar',   nombre: 'MP',    orgName: 'JR Eventos' },
]

export default function Setup() {
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [done,    setDone]    = useState(false)

  async function runSetup() {
    setRunning(true)
    const logs = []

    for (const admin of ADMINS) {
      try {
        // Get current user to find UID from Auth
        // We set the profile directly using the known UID
        // First check if user exists in DB already
        const currentUser = auth.currentUser
        if (!currentUser) {
          logs.push({ email: admin.email, ok: false, msg: 'Necesitás estar logueado primero' })
          continue
        }

        // Check if this is the current user
        if (currentUser.email === admin.email) {
          const profileRef = ref(db, `users/${currentUser.uid}/profile`)
          const snap = await get(profileRef)
          const existing = snap.val() || {}
          await set(profileRef, {
            ...existing,
            role: 'admin',
            nombre: existing.nombre || admin.nombre,
            email: admin.email,
            orgName: existing.orgName || admin.orgName,
            hideComisiones: existing.hideComisiones || false,
            updatedAt: new Date().toISOString(),
          })
          logs.push({ email: admin.email, ok: true, msg: 'Rol admin asignado ✓' })
        } else {
          logs.push({ email: admin.email, ok: false, msg: 'No es el usuario actual — iniciá sesión con ese email y volvé a esta página' })
        }
      } catch (e) {
        logs.push({ email: admin.email, ok: false, msg: e.message })
      }
    }

    setResults(logs)
    setRunning(false)
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-nude-200 shadow-sm p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-warm-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white"/>
          </div>
          <h1 className="text-2xl font-serif text-ink-800">Setup de administradores</h1>
          <p className="text-sm text-ink-400 mt-1">Asigna rol admin a los usuarios configurados</p>
        </div>

        <div className="bg-nude-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Usuarios a configurar</p>
          {ADMINS.map(a => (
            <div key={a.email} className="flex items-center gap-2 text-sm text-ink-700">
              <span className="text-lg">👑</span> {a.email}
            </div>
          ))}
        </div>

        <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 text-xs text-warm-700">
          <strong>Instrucciones:</strong><br/>
          1. Iniciá sesión con <strong>alex@niviko.com.ar</strong> → volvé a <code>/setup</code> → Ejecutar<br/>
          2. Cerrá sesión → iniciá con <strong>mp@niviko.com.ar</strong> → volvé a <code>/setup</code> → Ejecutar
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${r.ok ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-red-600'}`}>
                {r.ok ? <Check size={15} className="flex-shrink-0 mt-0.5"/> : <AlertTriangle size={15} className="flex-shrink-0 mt-0.5"/>}
                <div>
                  <strong>{r.email}</strong><br/>
                  {r.msg}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={runSetup}
          disabled={running}
          className="w-full py-3 bg-warm-500 text-white rounded-xl font-medium hover:bg-warm-600 transition-colors disabled:opacity-50"
        >
          {running ? 'Ejecutando...' : 'Ejecutar setup'}
        </button>

        {done && results.every(r => r.ok) && (
          <div className="text-center">
            <p className="text-sm text-sage-600 font-medium">✓ Listo — cerrá sesión y volvé a entrar para ver los cambios</p>
            <a href="/dashboard" className="text-sm text-warm-600 hover:underline mt-1 block">Ir al dashboard</a>
          </div>
        )}
      </div>
    </div>
  )
}
