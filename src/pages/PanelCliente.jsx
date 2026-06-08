import { useState } from 'react'
import { Sparkles, Heart, Eye, EyeOff } from 'lucide-react'
import { get, ref, query, orderByChild, equalTo } from 'firebase/database'
import { db } from '../lib/firebase'

// Panel cliente — acceso por código único generado por la organizadora
// URL: /cliente/:accessCode  o  /cliente con input de código

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
        <span className="text-3xl font-serif text-white font-bold">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-white/70 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function Countdown({ date }) {
  const [now, setNow] = useState(new Date())
  useState(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  })

  const target = new Date(date + 'T00:00:00')
  const diff = target - now
  if (diff <= 0) return <p className="text-white text-lg font-serif">¡Hoy es el gran día! 🎉</p>

  const days    = Math.floor(diff / (1000*60*60*24))
  const hours   = Math.floor((diff % (1000*60*60*24)) / (1000*60*60))
  const minutes = Math.floor((diff % (1000*60*60)) / (1000*60))
  const seconds = Math.floor((diff % (1000*60)) / 1000)

  return (
    <div className="flex gap-3 justify-center">
      <CountdownUnit value={days}    label="días"     />
      <CountdownUnit value={hours}   label="horas"    />
      <CountdownUnit value={minutes} label="minutos"  />
      <CountdownUnit value={seconds} label="segundos" />
    </div>
  )
}

function ChecklistItem({ tarea, onToggle, isClient }) {
  return (
    <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${tarea.done ? 'opacity-60' : 'hover:bg-rose-50'}`}>
      <div
        onClick={() => isClient && tarea.clientVisible && onToggle(tarea.id, !tarea.done)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          tarea.done ? 'bg-rose-500 border-rose-500' : 'border-ink-300'
        } ${isClient && !tarea.clientVisible ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {tarea.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${tarea.done ? 'line-through text-ink-400' : 'text-ink-800'}`}>{tarea.titulo}</p>
        {tarea.dueDate && <p className="text-xs text-ink-400 mt-0.5">Vence: {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>}
      </div>
      {tarea.clientVisible && <span className="text-[10px] text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded">Tuyo</span>}
    </label>
  )
}

export default function PanelCliente() {
  const [code, setCode] = useState('')
  const [clientData, setClientData] = useState(null)
  const [eventoData, setEventoData] = useState(null)
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)

  async function handleAccess() {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      // Buscar en todos los usuarios el código de acceso
      // En producción real esto se manejaría con Cloud Functions
      // Por ahora buscamos en una tabla pública de códigos
      const snap = await get(ref(db, 'accessCodes/' + code.toUpperCase()))
      if (!snap.exists()) {
        setError('Código inválido. Verificá con tu organizadora.')
        setLoading(false)
        return
      }
      const { userId, eventoId, clienteId } = snap.val()

      const [eventoSnap, clienteSnap, tareasSnap] = await Promise.all([
        get(ref(db, `users/${userId}/eventos/${eventoId}`)),
        get(ref(db, `users/${userId}/clientes/${clienteId}`)),
        get(ref(db, `users/${userId}/eventos/${eventoId}/tareas`)),
      ])

      if (!eventoSnap.exists()) { setError('Evento no encontrado.'); setLoading(false); return }

      const tareasData = tareasSnap.val() || {}
      const tareasArr = Object.values(tareasData)
        .filter(t => t.clientVisible || t.tipo === 'cliente')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      setEventoData(eventoSnap.val())
      setClientData({ ...clienteSnap.val(), userId, eventoId, clienteId })
      setTareas(tareasArr)
    } catch (e) {
      setError('Error al acceder. Intentá de nuevo.')
    }
    setLoading(false)
  }

  async function handleToggleTarea(tareaId, done) {
    await import('firebase/database').then(({ update, ref: fbRef }) =>
      update(fbRef(db, `users/${clientData.userId}/eventos/${clientData.eventoId}/tareas/${tareaId}`), { done })
    )
    setTareas(t => t.map(ta => ta.id === tareaId ? { ...ta, done } : ta))
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif text-ink-800 mb-1">Tu evento</h1>
          <p className="text-sm text-ink-400 mb-8">Ingresá el código que te envió tu organizadora</p>

          <div className="bg-white rounded-2xl border border-ink-100 p-7 shadow-sm space-y-4">
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleAccess()}
                placeholder="Ej: XK4R2A"
                className="w-full text-center text-2xl font-mono tracking-[0.3em] px-4 py-3 border border-ink-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 uppercase"
                maxLength={8}
              />
              <button
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              onClick={handleAccess}
              disabled={loading || code.length < 4}
              className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Ingresar →'}
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-4">¿No tenés código? Consultá con tu organizadora.</p>
        </div>
      </div>
    )
  }

  // ── Panel del cliente ──────────────────────────────────────────────────────
  const evento = eventoData
  const done   = tareas.filter(t => t.done).length
  const total  = tareas.length
  const pct    = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-white to-sage-50">
      {/* Hero con cuenta regresiva */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={16} className="text-rose-200" />
          <span className="text-rose-200 text-sm">Lumina Events</span>
        </div>
        <h1 className="text-3xl font-serif text-white mb-1">{evento.nombre}</h1>
        {evento.lugar && <p className="text-rose-200 text-sm mb-6">{evento.lugar}</p>}
        {evento.date && (
          <>
            <p className="text-rose-100 text-xs mb-5 uppercase tracking-widest">Faltan</p>
            <Countdown date={evento.date} />
            <p className="text-rose-200 text-sm mt-5">
              {new Date(evento.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {evento.hora && ` · ${evento.hora} hs`}
            </p>
          </>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Bienvenida */}
        <div className="bg-white rounded-2xl border border-ink-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart size={18} className="text-rose-500" />
            </div>
            <div>
              <p className="font-medium text-ink-800">Hola, {clientData?.nombre || 'bienvenido/a'} 👋</p>
              <p className="text-xs text-ink-400">Acá podés seguir el estado de tu evento</p>
            </div>
          </div>
        </div>

        {/* Progreso del checklist */}
        {total > 0 && (
          <div className="bg-white rounded-2xl border border-ink-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink-700">Progreso general</p>
              <span className="text-sm font-serif text-rose-600">{pct}%</span>
            </div>
            <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-ink-400 mt-2">{done} de {total} tareas completadas</p>
          </div>
        )}

        {/* Checklist */}
        {tareas.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100">
              <p className="text-sm font-medium text-ink-700">Lista de pendientes</p>
            </div>
            <div className="divide-y divide-ink-50 px-2 py-1">
              {tareas.map(t => (
                <ChecklistItem key={t.id} tarea={t} onToggle={handleToggleTarea} isClient={true} />
              ))}
            </div>
          </div>
        )}

        {/* Detalles del evento */}
        <div className="bg-white rounded-2xl border border-ink-100 p-5 space-y-3">
          <p className="text-sm font-medium text-ink-700 mb-1">Detalles del evento</p>
          {evento.lugar && (
            <div className="flex gap-2 text-sm"><span className="text-ink-400 w-20 flex-shrink-0">Lugar</span><span className="text-ink-700 font-medium">{evento.lugar}</span></div>
          )}
          {evento.direccion && (
            <div className="flex gap-2 text-sm"><span className="text-ink-400 w-20 flex-shrink-0">Dirección</span><span className="text-ink-700">{evento.direccion}</span></div>
          )}
          {evento.hora && (
            <div className="flex gap-2 text-sm"><span className="text-ink-400 w-20 flex-shrink-0">Horario</span><span className="text-ink-700 font-medium">{evento.hora} hs</span></div>
          )}
          {evento.notas && (
            <div className="flex gap-2 text-sm"><span className="text-ink-400 w-20 flex-shrink-0">Notas</span><span className="text-ink-600 italic">{evento.notas}</span></div>
          )}
        </div>

        <p className="text-center text-xs text-ink-400 pb-4">
          Powered by <span className="text-rose-500 font-medium">Lumina Events</span>
        </p>
      </div>
    </div>
  )
}
