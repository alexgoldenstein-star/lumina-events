import { useState, useEffect } from 'react'
import { get, ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import {
  Heart, Calendar, CheckSquare, LayoutGrid, FileText, DollarSign,
  Users, Clock, MapPin, ChevronRight, Lock
} from 'lucide-react'
import LogoJR from '../components/ui/LogoJR'

// ─── Countdown ────────────────────────────────────────────────────────────────
function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
        <span className="text-2xl md:text-3xl font-light text-white" style={{fontFamily:'Georgia, serif'}}>
          {String(value).padStart(2,'0')}
        </span>
      </div>
      <span className="text-[10px] text-white/60 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function Countdown({ date }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!date) return null
  const target = new Date(date + 'T00:00:00')
  const diff = target - now
  if (diff <= 0) return <p className="text-white text-xl font-light" style={{fontFamily:'Georgia, serif'}}>¡Hoy es el gran día! 🎉</p>

  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return (
    <div className="flex gap-2.5 md:gap-4 justify-center">
      <CountdownUnit value={days}    label="días"/>
      <CountdownUnit value={hours}   label="horas"/>
      <CountdownUnit value={minutes} label="min"/>
      <CountdownUnit value={seconds} label="seg"/>
    </div>
  )
}

// ─── Login por código ───────────────────────────────────────────────────────────
function CodeLogin({ onAccess }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const snap = await get(ref(db, `accessCodes/${code.trim().toUpperCase()}`))
      if (!snap.exists()) { setError('Código no encontrado. Verificá que esté bien escrito.'); setLoading(false); return }
      onAccess(snap.val())
    } catch(e) { setError('Error al verificar el código') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <LogoJR size="lg" className="mb-10 mx-auto"/>
        <h1 className="text-2xl font-light text-ink-900 mb-2" style={{fontFamily:'Georgia, serif'}}>Tu panel de evento</h1>
        <p className="text-sm text-ink-400 mb-8">Ingresá el código que te enviamos</p>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            maxLength={8}
            className="w-full px-4 py-4 text-center text-xl tracking-[0.3em] font-mono border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors uppercase"
          />
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-ink-900 text-white text-xs tracking-widest uppercase hover:bg-ink-700 transition-colors disabled:opacity-50">
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <p className="text-xs text-ink-400 mt-8">
          ¿No tenés tu código? Contactanos por WhatsApp
        </p>
      </div>
    </div>
  )
}

// ─── Tabs del panel ───────────────────────────────────────────────────────────
const TABS = [
  { id:'resumen',     label:'Resumen',     icon:Heart        },
  { id:'checklist',   label:'Checklist',   icon:CheckSquare  },
  { id:'presupuesto', label:'Presupuesto', icon:DollarSign   },
  { id:'mesas',       label:'Mesas',       icon:LayoutGrid   },
  { id:'calendario',  label:'Fechas clave',icon:Calendar     },
  { id:'documentos',  label:'Documentos',  icon:FileText     },
]

function fmtMoney(v) {
  const n = parseFloat(String(v||0).replace(/[^0-9.]/g,'')) || 0
  return '$' + n.toLocaleString('es-AR')
}

export default function PanelCliente() {
  const [accessData, setAccessData] = useState(null)
  const [evento,     setEvento]     = useState(null)
  const [tareas,     setTareas]     = useState([])
  const [mesas,      setMesas]      = useState([])
  const [guests,     setGuests]     = useState([])
  const [budget,     setBudget]     = useState({})
  const [gastos,     setGastos]     = useState([])
  const [calItems,   setCalItems]   = useState([])
  const [documentos, setDocumentos] = useState([])
  const [tab,        setTab]        = useState('resumen')
  const [loading,    setLoading]    = useState(true)

  function handleAccess(data) {
    setAccessData(data)
    sessionStorage.setItem('clientAccess', JSON.stringify(data))
  }

  // Restaurar sesión
  useEffect(() => {
    const saved = sessionStorage.getItem('clientAccess')
    if (saved) setAccessData(JSON.parse(saved))
  }, [])

  // Cargar todos los datos del evento
  useEffect(() => {
    if (!accessData) return
    const { ownerUid, eventoId } = accessData
    setLoading(true)

    const refs = {
      evento:     ref(db, `users/${ownerUid}/eventos/${eventoId}`),
      tareas:     ref(db, `users/${ownerUid}/eventos/${eventoId}/tareas`),
      mesas:      ref(db, `users/${ownerUid}/eventos/${eventoId}/mesas`),
      invitados:  ref(db, `users/${ownerUid}/eventos/${eventoId}/invitados`),
      budget:     ref(db, `users/${ownerUid}/eventos/${eventoId}/budget`),
      gastos:     ref(db, `users/${ownerUid}/eventos/${eventoId}/gastos`),
      calendario: ref(db, `users/${ownerUid}/calendario`),
      documentos: ref(db, `users/${ownerUid}/eventos/${eventoId}/documentos`),
    }

    const unsubs = []
    unsubs.push(onValue(refs.evento, s => { setEvento(s.val()); setLoading(false) }))
    unsubs.push(onValue(refs.tareas, s => setTareas(Object.values(s.val()||{}))))
    unsubs.push(onValue(refs.mesas,  s => setMesas(Object.values(s.val()||{}))))
    unsubs.push(onValue(refs.invitados, s => setGuests(Object.values(s.val()||{}))))
    unsubs.push(onValue(refs.budget, s => setBudget(s.val()||{})))
    unsubs.push(onValue(refs.gastos, s => setGastos(Object.values(s.val()||{}))))
    unsubs.push(onValue(refs.calendario, s => {
      const all = Object.values(s.val()||{})
      setCalItems(all.filter(c => c.eventoId === eventoId || !c.eventoId))
    }))
    unsubs.push(onValue(refs.documentos, s => setDocumentos(Object.values(s.val()||{}))))

    return () => { Object.values(refs).forEach(r => off(r)) }
  }, [accessData])

  if (!accessData) return <CodeLogin onAccess={handleAccess}/>
  if (loading) return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!evento) return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-6 text-center">
      <p className="text-ink-500">No se pudo cargar tu evento. Contactá a la organizadora.</p>
    </div>
  )

  // Datos calculados — SIN comisiones, SIN honorarios internos
  const tareasVisibles = tareas.filter(t => t.clientVisible)
  const tareasHechas   = tareasVisibles.filter(t => t.done).length
  const totalGastoConfirmado = gastos
    .filter(g => g.tipo === 'confirmado')
    .reduce((s,g) => s + (parseFloat(String(g.valor||0).replace(/[^0-9.]/g,''))||0), 0)
  const presupuestoTotal = parseFloat(String(budget.total||0).replace(/[^0-9.]/g,'')) || 0
  const confirmados = guests.filter(g => g.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-nude-50">
      {/* Hero con countdown */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55"/>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-[10px] tracking-widest uppercase mb-2">Tu evento</p>
          <h1 className="text-2xl md:text-3xl font-light text-white mb-1" style={{fontFamily:'Georgia, serif'}}>
            {evento.nombre}
          </h1>
          {evento.lugar && (
            <p className="flex items-center gap-1.5 text-white/70 text-xs mb-6">
              <MapPin size={11}/> {evento.lugar}
            </p>
          )}
          <Countdown date={evento.date}/>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-nude-200 overflow-x-auto">
        <div className="flex max-w-3xl mx-auto px-2">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  tab===t.id ? 'border-ink-900 text-ink-900 font-medium' : 'border-transparent text-ink-400 hover:text-ink-700'
                }`}>
                <Icon size={13}/> {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-5 md:p-7">

        {/* RESUMEN */}
        {tab === 'resumen' && (
          <div className="space-y-5 fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-5 border border-nude-200 text-center">
                <Users size={20} className="text-ink-300 mx-auto mb-2"/>
                <p className="text-2xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>{confirmados}</p>
                <p className="text-xs text-ink-400">de {guests.length} confirmados</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-nude-200 text-center">
                <CheckSquare size={20} className="text-ink-300 mx-auto mb-2"/>
                <p className="text-2xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>{tareasHechas}/{tareasVisibles.length}</p>
                <p className="text-xs text-ink-400">tareas completadas</p>
              </div>
            </div>

            {evento.hora && (
              <div className="bg-white rounded-2xl p-5 border border-nude-200 flex items-center gap-4">
                <div className="w-10 h-10 bg-nude-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-ink-600"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-800">Hora del evento</p>
                  <p className="text-xs text-ink-400">{evento.hora} hs</p>
                </div>
              </div>
            )}

            {evento.clienteNotas && (
              <div className="bg-white rounded-2xl p-5 border border-nude-200">
                <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-2">Notas del evento</p>
                <p className="text-sm text-ink-600 leading-relaxed">{evento.clienteNotas}</p>
              </div>
            )}

            <div className="bg-ink-900 rounded-2xl p-6 text-center">
              <p className="text-white/60 text-xs mb-2">¿Tenés alguna consulta?</p>
              <a href="https://wa.me/5491157092994" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-ink-900 rounded-full text-xs font-medium hover:bg-nude-100 transition-colors">
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {tab === 'checklist' && (
          <div className="space-y-2 fade-in">
            {tareasVisibles.length === 0 ? (
              <div className="text-center py-12 text-ink-400 text-sm">Sin tareas compartidas todavía</div>
            ) : tareasVisibles.map(t => (
              <div key={t.id} className={`bg-white rounded-xl p-4 border border-nude-200 flex items-center gap-3 ${t.done?'opacity-60':''}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${t.done?'bg-sage-500 border-sage-500':'border-nude-300'}`}>
                  {t.done && <CheckSquare size={12} className="text-white"/>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${t.done?'line-through text-ink-400':'text-ink-800'}`}>{t.titulo}</p>
                  {t.dueDate && <p className="text-xs text-ink-400">Vence {new Date(t.dueDate+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'long'})}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRESUPUESTO — solo monto total y ejecutado, SIN comisiones ni honorarios */}
        {tab === 'presupuesto' && (
          <div className="space-y-5 fade-in">
            {presupuestoTotal > 0 ? (
              <>
                <div className="bg-white rounded-2xl p-6 border border-nude-200">
                  <p className="text-xs text-ink-400 uppercase tracking-wide mb-4">Presupuesto del evento</p>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>{fmtMoney(totalGastoConfirmado)}</p>
                      <p className="text-xs text-ink-400">ejecutado de {fmtMoney(presupuestoTotal)}</p>
                    </div>
                    <p className="text-lg font-light text-sage-600">{Math.round((totalGastoConfirmado/presupuestoTotal)*100)}%</p>
                  </div>
                  <div className="h-2 bg-nude-100 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-900 rounded-full transition-all" style={{width:`${Math.min(100,(totalGastoConfirmado/presupuestoTotal)*100)}%`}}/>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-400 bg-white rounded-xl p-3 border border-nude-200">
                  <Lock size={12}/> El detalle de proveedores y costos internos es gestionado por la organizadora
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-ink-400 text-sm">El presupuesto se compartirá pronto</div>
            )}
          </div>
        )}

        {/* MESAS */}
        {tab === 'mesas' && (
          <div className="space-y-3 fade-in">
            {mesas.length === 0 ? (
              <div className="text-center py-12 text-ink-400 text-sm">La distribución de mesas se compartirá pronto</div>
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-nude-200">
                <p className="text-xs text-ink-400 uppercase tracking-wide mb-4">{mesas.length} mesas configuradas</p>
                <div className="grid grid-cols-2 gap-3">
                  {mesas.map(m => {
                    const asignados = guests.filter(g => g.mesaId === m.id).length
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-nude-50 rounded-xl">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:m.color||'#EDE0D0'}}/>
                        <div>
                          <p className="text-sm font-medium text-ink-800">{m.nombre||`Mesa ${m.numero}`}</p>
                          <p className="text-xs text-ink-400">{asignados}/{m.capacidad||8} invitados</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CALENDARIO */}
        {tab === 'calendario' && (
          <div className="space-y-2 fade-in">
            {calItems.length === 0 ? (
              <div className="text-center py-12 text-ink-400 text-sm">Sin fechas clave compartidas todavía</div>
            ) : calItems
              .filter(c => c.notificarCliente)
              .sort((a,b) => new Date(a.date) - new Date(b.date))
              .map((c,i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-nude-200 flex items-center gap-4">
                  <div className="text-center flex-shrink-0 w-12">
                    <p className="text-lg font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>
                      {new Date(c.date+'T12:00:00').getDate()}
                    </p>
                    <p className="text-[10px] text-ink-400 uppercase">
                      {new Date(c.date+'T12:00:00').toLocaleDateString('es-AR',{month:'short'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{c.titulo}</p>
                    {c.hora && <p className="text-xs text-ink-400">{c.hora} hs</p>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* DOCUMENTOS */}
        {tab === 'documentos' && (
          <div className="space-y-2 fade-in">
            {documentos.length === 0 ? (
              <div className="text-center py-12 text-ink-400 text-sm">Sin documentos compartidos todavía</div>
            ) : documentos.map(d => (
              <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-nude-200 hover:border-ink-300 transition-colors">
                <FileText size={18} className="text-ink-400 flex-shrink-0"/>
                <span className="text-sm text-ink-700 flex-1 truncate">{d.titulo}</span>
                <ChevronRight size={14} className="text-ink-300"/>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="text-center py-8">
        <LogoJR size="sm" className="mx-auto opacity-50"/>
      </div>
    </div>
  )
}
