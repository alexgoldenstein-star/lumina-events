import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Trash2, Users, Save, RotateCcw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToMesas, createMesa, updateMesa, deleteMesa, subscribeToInvitados, updateInvitado } from '../lib/db'
import { Card, CardHeader, Button, Input, Modal, Badge } from '../components/ui'

const FORMAS      = ['redonda','rectangular','cuadrada']
const FORMA_LABEL = { redonda:'⭕ Redonda', rectangular:'▭ Rectangular', cuadrada:'⬜ Cuadrada' }
const COLORS      = ['#F5E6EF','#DBE8D7','#FAEFD4','#E8E5EF','#E0F0F8','#F8EBE0','#FDE8E8','#E8F0FD']

export default function LayoutMesas({ eventoId }) {
  const { user } = useAuth()
  const [mesas,   setMesas]   = useState([])
  const [guests,  setGuests]  = useState([])
  const [selected,setSelected]= useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre:'', capacidad:8, forma:'redonda', color:COLORS[0] })
  const [saving, setSaving] = useState(false)

  // Drag state via refs to avoid re-renders during drag
  const dragging  = useRef(null)
  const dragStart = useRef({ mx:0, my:0, ox:0, oy:0 })
  const canvasRef = useRef()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    const u1 = subscribeToMesas(user.uid, eventoId, ms => { setMesas(ms); forceUpdate(n=>n+1) })
    const u2 = subscribeToInvitados(user.uid, eventoId, setGuests)
    return () => { u1(); u2() }
  }, [user?.uid, eventoId])

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e, mesa) => {
    e.preventDefault(); e.stopPropagation()
    const rect = canvasRef.current.getBoundingClientRect()
    dragging.current  = mesa.id
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: mesa.x||0, oy: mesa.y||0 }
    setSelected(mesa)
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const rect  = canvasRef.current.getBoundingClientRect()
    const dx    = e.clientX - dragStart.current.mx
    const dy    = e.clientY - dragStart.current.my
    const newX  = Math.max(0, Math.min(rect.width  - 100, dragStart.current.ox + dx))
    const newY  = Math.max(0, Math.min(rect.height - 100, dragStart.current.oy + dy))
    setMesas(ms => ms.map(m => m.id === dragging.current ? { ...m, x: newX, y: newY } : m))
  }, [])

  const onMouseUp = useCallback(async () => {
    if (!dragging.current) return
    const id   = dragging.current
    const mesa = mesas.find(m => m.id === id)
    dragging.current = null
    if (mesa) {
      try { await updateMesa(user.uid, eventoId, id, { x: Math.round(mesa.x||0), y: Math.round(mesa.y||0) }) }
      catch(e) { console.error('Error saving mesa position', e) }
    }
  }, [mesas, user?.uid, eventoId])

  // ── CRUD ───────────────────────────────────────────────────────────────────
  async function handleAdd() {
    setSaving(true)
    const n = mesas.length + 1
    await createMesa(user.uid, eventoId, {
      ...form,
      numero: n,
      nombre: form.nombre || `Mesa ${n}`,
      x: 30 + ((n-1) % 4) * 120,
      y: 30 + Math.floor((n-1) / 4) * 120,
    })
    setSaving(false); setShowModal(false)
    setForm({ nombre:'', capacidad:8, forma:'redonda', color:COLORS[0] })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar mesa?')) return
    // unassign guests
    const assigned = guests.filter(g => g.mesaId === id)
    await Promise.all(assigned.map(g => updateInvitado(user.uid, eventoId, g.id, { mesaId: null })))
    await deleteMesa(user.uid, eventoId, id)
    if (selected?.id === id) setSelected(null)
  }

  async function handleAssign(guestId, mesaId) {
    await updateInvitado(user.uid, eventoId, guestId, { mesaId: mesaId || null })
  }

  const unassigned = guests.filter(g => !g.mesaId && g.status === 'confirmed')
  const totalCap   = mesas.reduce((s,m) => s + (parseInt(m.capacidad)||8), 0)
  const assigned   = guests.filter(g => g.mesaId).length

  return (
    <div className="p-6 fade-in space-y-4">
      {/* Stats */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-2.5 text-sm"><span className="text-ink-400">Mesas: </span><strong>{mesas.length}</strong></div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-2.5 text-sm"><span className="text-ink-400">Capacidad: </span><strong>{totalCap}</strong></div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-2.5 text-sm"><span className="text-ink-400">Asignados: </span><strong className="text-sage-700">{assigned}</strong></div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-2.5 text-sm"><span className="text-ink-400">Sin asignar: </span><strong className="text-gold-700">{unassigned.length}</strong></div>
        <Button size="sm" className="ml-auto" onClick={() => setShowModal(true)}><Plus size={13}/> Nueva mesa</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Users size={15} className="text-rose-400"/> Layout del salón
              <span className="text-xs text-ink-400 font-normal ml-1">— arrastrá las mesas para posicionarlas</span>
            </CardHeader>
            <div
              ref={canvasRef}
              className="relative bg-[#FAFAF8] overflow-hidden select-none"
              style={{ height: 460 }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Dot grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <defs>
                  <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1" fill="#C4BFD0"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dotgrid)"/>
              </svg>

              {mesas.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-300 pointer-events-none">
                  <Users size={40} strokeWidth={1.5} className="mb-3"/>
                  <p className="text-sm">Agregá mesas para empezar</p>
                </div>
              )}

              {mesas.map(mesa => {
                const asignados = guests.filter(g => g.mesaId === mesa.id)
                const cap       = parseInt(mesa.capacidad) || 8
                const libre     = cap - asignados.length
                const isCircle  = mesa.forma === 'redonda'
                const isRect    = mesa.forma === 'rectangular'
                const w = isRect ? 100 : 80
                const h = isRect ? 60  : 80
                const isSelected = selected?.id === mesa.id

                return (
                  <div
                    key={mesa.id}
                    onMouseDown={e => onMouseDown(e, mesa)}
                    onClick={() => setSelected(mesa)}
                    style={{
                      position:  'absolute',
                      left:      mesa.x || 0,
                      top:       mesa.y || 0,
                      width:     w,
                      height:    h,
                      cursor:    'grab',
                      userSelect:'none',
                    }}
                  >
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center border-2 transition-all
                        ${isCircle ? 'rounded-full' : isRect ? 'rounded-xl' : 'rounded-2xl'}
                        ${isSelected ? 'border-rose-500 shadow-lg shadow-rose-200' : 'border-white/80 hover:border-rose-300'}`}
                      style={{ background: mesa.color || '#F5E6EF' }}
                    >
                      <span className="text-xs font-bold text-ink-800 leading-tight px-1 text-center truncate w-full text-center">
                        {mesa.nombre || `Mesa ${mesa.numero}`}
                      </span>
                      <span className="text-[10px] text-ink-500">{asignados.length}/{cap}</span>
                    </div>
                    {/* Badge */}
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white
                      ${libre === 0 ? 'bg-ink-400' : 'bg-sage-500'}`}>
                      {libre === 0 ? '✓' : libre}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Mesa seleccionada */}
          {selected && (
            <Card>
              <CardHeader action={
                <button onClick={() => handleDelete(selected.id)} className="text-ink-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13}/>
                </button>
              }>
                {selected.nombre || `Mesa ${selected.numero}`}
              </CardHeader>
              <div className="px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto">
                {guests.filter(g => g.mesaId === selected.id).length === 0
                  ? <p className="text-xs text-ink-400">Sin invitados asignados aún</p>
                  : guests.filter(g => g.mesaId === selected.id).map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-xs group">
                      <span className="flex-1 text-ink-700 truncate">{g.fullName}</span>
                      <button onClick={() => handleAssign(g.id, null)} className="text-ink-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                    </div>
                  ))
                }
              </div>
            </Card>
          )}

          {/* Sin asignar */}
          <Card>
            <CardHeader><Badge variant="amber">{unassigned.length}</Badge> Confirmados sin mesa</CardHeader>
            <div className="max-h-64 overflow-y-auto divide-y divide-ink-50">
              {unassigned.length === 0
                ? <p className="px-4 py-3 text-xs text-ink-400">¡Todos asignados!</p>
                : unassigned.map(g => (
                  <div key={g.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-xs text-ink-700 flex-1 truncate">{g.fullName}</span>
                    <select
                      className="text-xs border border-ink-200 rounded-lg px-1.5 py-1 outline-none focus:border-rose-400 max-w-28"
                      defaultValue=""
                      onChange={e => e.target.value && handleAssign(g.id, e.target.value)}
                    >
                      <option value="">Asignar...</option>
                      {mesas.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre || `Mesa ${m.numero}`} ({guests.filter(gg => gg.mesaId === m.id).length}/{m.capacidad||8})
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Lista de mesas */}
          {mesas.length > 0 && (
            <Card>
              <CardHeader>Todas las mesas</CardHeader>
              <div className="divide-y divide-ink-50 max-h-48 overflow-y-auto">
                {mesas.map(m => {
                  const asignados = guests.filter(g => g.mesaId === m.id).length
                  return (
                    <div key={m.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-rose-50 transition-colors ${selected?.id===m.id?'bg-rose-50':''}`}
                      onClick={() => setSelected(m)}>
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{background: m.color||'#F5E6EF', border:'1px solid rgba(0,0,0,0.1)'}}/>
                      <span className="text-xs text-ink-700 flex-1">{m.nombre||`Mesa ${m.numero}`}</span>
                      <span className="text-xs text-ink-400">{asignados}/{m.capacidad||8}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal nueva mesa */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva mesa" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre / número" placeholder={`Mesa ${mesas.length+1}`} value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}/>
            <Input label="Capacidad" type="number" min="1" max="40" value={form.capacidad} onChange={e => setForm(f=>({...f,capacidad:parseInt(e.target.value)||8}))}/>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Forma</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAS.map(f => (
                <button key={f} onClick={() => setForm(fm=>({...fm,forma:f}))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all
                    ${form.forma===f?'border-rose-400 bg-rose-50 text-rose-700':'border-ink-200 text-ink-500 hover:border-rose-200'}`}>
                  {FORMA_LABEL[f]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f=>({...f,color:c}))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color===c?'border-rose-500 scale-110':'border-transparent hover:scale-105'}`}
                  style={{background:c}}/>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleAdd} loading={saving}>Agregar mesa</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
