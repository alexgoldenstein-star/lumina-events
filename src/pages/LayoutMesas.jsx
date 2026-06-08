import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Edit, Users, RotateCcw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToMesas, createMesa, updateMesa, deleteMesa, subscribeToInvitados } from '../lib/db'
import { Card, CardHeader, Button, Input, Modal, Badge } from '../components/ui'

const FORMAS = [
  { value: 'redonda',     label: '⭕ Redonda'   },
  { value: 'rectangular', label: '▭ Rectangular' },
  { value: 'cuadrada',    label: '⬜ Cuadrada'  },
]

const MESA_COLORS = ['#F5E6EF','#DBE8D7','#FAEFD4','#E8E5EF','#E0F0F8','#F8EBE0']

function MesaVisual({ mesa, guests, onClick, selected }) {
  const assigned = guests.filter(g => g.mesaId === mesa.id)
  const libre = (mesa.capacidad || 8) - assigned.length
  const isRedonda = mesa.forma === 'redonda'
  const isRect = mesa.forma === 'rectangular'

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all select-none ${selected ? 'scale-105' : 'hover:scale-102'}`}
      style={{
        left: mesa.x || 0,
        top: mesa.y || 0,
        position: 'absolute',
      }}
    >
      <div
        className={`flex flex-col items-center justify-center border-2 transition-all ${
          selected ? 'border-rose-500 shadow-lg' : 'border-transparent hover:border-rose-300'
        } ${isRedonda ? 'rounded-full' : isRect ? 'rounded-lg' : 'rounded-xl'}`}
        style={{
          width: isRect ? 96 : 72,
          height: isRect ? 56 : 72,
          background: mesa.color || '#F5E6EF',
        }}
      >
        <span className="text-xs font-bold text-ink-700 leading-tight">{mesa.nombre || `Mesa ${mesa.numero}`}</span>
        <span className="text-[10px] text-ink-500">{assigned.length}/{mesa.capacidad || 8}</span>
      </div>
      {libre > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">{libre}</span>
        </div>
      )}
      {libre === 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-ink-400 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white">✓</span>
        </div>
      )}
    </div>
  )
}

export default function LayoutMesas({ eventoId }) {
  const { user } = useAuth()
  const [mesas, setMesas] = useState([])
  const [guests, setGuests] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [form, setForm] = useState({ nombre: '', capacidad: 8, forma: 'redonda', color: MESA_COLORS[0] })
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef()
  const [assignModal, setAssignModal] = useState(null)

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    const u1 = subscribeToMesas(user.uid, eventoId, setMesas)
    const u2 = subscribeToInvitados(user.uid, eventoId, setGuests)
    return () => { u1(); u2() }
  }, [user?.uid, eventoId])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleAdd() {
    const numero = mesas.length + 1
    await createMesa(user.uid, eventoId, {
      ...form,
      numero,
      x: 50 + (numero % 4) * 110,
      y: 50 + Math.floor(numero / 4) * 110,
    })
    setShowModal(false)
    setForm({ nombre: '', capacidad: 8, forma: 'redonda', color: MESA_COLORS[0] })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar mesa?')) return
    // Desasignar invitados de esta mesa
    const assigned = guests.filter(g => g.mesaId === id)
    for (const g of assigned) {
      await import('./Invitados').then(async () => {
        const { updateInvitado } = await import('../lib/db')
        await updateInvitado(user.uid, eventoId, g.id, { mesaId: null })
      })
    }
    await deleteMesa(user.uid, eventoId, id)
    if (selected?.id === id) setSelected(null)
  }

  // Drag and drop
  function handleMouseDown(e, mesa) {
    e.stopPropagation()
    const rect = canvasRef.current.getBoundingClientRect()
    setDragging(mesa.id)
    setDragOffset({ x: e.clientX - rect.left - (mesa.x || 0), y: e.clientY - rect.top - (mesa.y || 0) })
    setSelected(mesa)
  }

  function handleMouseMove(e) {
    if (!dragging) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width - 80, e.clientX - rect.left - dragOffset.x))
    const y = Math.max(0, Math.min(rect.height - 80, e.clientY - rect.top - dragOffset.y))
    setMesas(ms => ms.map(m => m.id === dragging ? { ...m, x, y } : m))
  }

  async function handleMouseUp() {
    if (!dragging) return
    const mesa = mesas.find(m => m.id === dragging)
    if (mesa) await updateMesa(user.uid, eventoId, mesa.id, { x: mesa.x, y: mesa.y })
    setDragging(null)
  }

  async function assignGuest(guestId, mesaId) {
    const { updateInvitado } = await import('../lib/db')
    await updateInvitado(user.uid, eventoId, guestId, { mesaId: mesaId || null })
  }

  const unassigned = guests.filter(g => !g.mesaId && g.status === 'confirmed')
  const totalCapacity = mesas.reduce((s, m) => s + (parseInt(m.capacidad) || 8), 0)
  const totalAssigned = guests.filter(g => g.mesaId).length

  return (
    <div className="p-6 fade-in space-y-5">
      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-400">Mesas: </span><strong className="text-ink-800">{mesas.length}</strong>
        </div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-400">Capacidad total: </span><strong className="text-ink-800">{totalCapacity}</strong>
        </div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-400">Asignados: </span><strong className="text-sage-700">{totalAssigned}</strong>
        </div>
        <div className="bg-white border border-ink-100 rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-400">Sin asignar: </span><strong className="text-gold-700">{unassigned.length}</strong>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="ml-auto">
          <Plus size={13} /> Nueva mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Users size={15} className="text-rose-400" /> Layout del salón
              <span className="text-xs text-ink-400 ml-1">— arrastrá las mesas</span>
            </CardHeader>
            <div
              ref={canvasRef}
              className="relative bg-[#FAFAF8] border-b border-ink-100 overflow-hidden"
              style={{ height: 420 }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => setSelected(null)}
            >
              {/* Grid dots */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#C4BFD0" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {mesas.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-300">
                  <Users size={40} strokeWidth={1} className="mb-3" />
                  <p className="text-sm">Agregá mesas para empezar</p>
                </div>
              )}

              {mesas.map(mesa => (
                <div
                  key={mesa.id}
                  onMouseDown={e => handleMouseDown(e, mesa)}
                  style={{ position: 'absolute', left: mesa.x || 0, top: mesa.y || 0, cursor: dragging === mesa.id ? 'grabbing' : 'grab' }}
                >
                  <MesaVisual
                    mesa={mesa}
                    guests={guests}
                    selected={selected?.id === mesa.id}
                    onClick={() => { setSelected(mesa); setAssignModal(mesa) }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Selected mesa detail */}
          {selected && (
            <Card>
              <CardHeader action={
                <button onClick={() => handleDelete(selected.id)} className="text-ink-300 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              }>
                {selected.nombre || `Mesa ${selected.numero}`}
              </CardHeader>
              <CardBody className="space-y-2">
                {guests.filter(g => g.mesaId === selected.id).map(g => (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <span className="text-ink-700 truncate">{g.fullName}</span>
                    <button
                      onClick={() => assignGuest(g.id, null)}
                      className="text-ink-300 hover:text-red-400 ml-2 flex-shrink-0"
                    >✕</button>
                  </div>
                ))}
                {guests.filter(g => g.mesaId === selected.id).length === 0 && (
                  <p className="text-xs text-ink-400">Sin invitados asignados</p>
                )}
              </CardBody>
            </Card>
          )}

          {/* Sin asignar */}
          <Card>
            <CardHeader><Badge variant="amber">{unassigned.length}</Badge> Sin asignar</CardHeader>
            <div className="max-h-60 overflow-y-auto divide-y divide-ink-50">
              {unassigned.length === 0 ? (
                <p className="px-4 py-3 text-xs text-ink-400">¡Todos asignados!</p>
              ) : unassigned.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs text-ink-700 flex-1 truncate">{g.fullName}</span>
                  <select
                    className="text-xs border border-ink-200 rounded-lg px-1.5 py-1 outline-none focus:border-rose-400"
                    defaultValue=""
                    onChange={e => e.target.value && assignGuest(g.id, e.target.value)}
                  >
                    <option value="">Asignar...</option>
                    {mesas.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre || `Mesa ${m.numero}`} ({guests.filter(gg => gg.mesaId === m.id).length}/{m.capacidad || 8})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add mesa modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva mesa" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre / número" placeholder="Mesa 1 / VIP" value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
            <Input label="Capacidad" type="number" min="1" max="30" value={form.capacidad} onChange={e => setField('capacidad', parseInt(e.target.value) || 8)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Forma</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setField('forma', f.value)}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.forma === f.value ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-ink-200 text-ink-500 hover:border-rose-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Color</label>
            <div className="flex gap-2">
              {MESA_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setField('color', c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-rose-500 scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Agregar mesa</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
