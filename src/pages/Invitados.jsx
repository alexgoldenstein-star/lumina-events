import { useEffect, useState } from 'react'
import { Users, Plus, Search, Upload, Check, X, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToInvitados, addInvitado, updateInvitado, deleteInvitado } from '../lib/db'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES } from '../lib/whatsapp'
import { downloadExcelTemplate } from '../lib/excel'
import { Button, Badge, Input, Select, Modal, EmptyState, Alert, Card } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   badge: 'amber', dot: 'bg-gold-400' },
  confirmed: { label: 'Confirmado',  badge: 'green', dot: 'bg-sage-500' },
  declined:  { label: 'No asiste',   badge: 'gray',  dot: 'bg-ink-300' },
  noresponse:{ label: 'Sin resp.',   badge: 'red',   dot: 'bg-red-400' },
}

function WAButton({ guest, evento }) {
  const needsFollowup = needsFollowUp(guest)
  const msgType = needsFollowup ? MESSAGE_TYPES.SEGUIMIENTO : MESSAGE_TYPES.PRIMERA_CONFIRMACION
  const msg = buildMessage({
    type: msgType,
    guestName: guest.fullName,
    eventName: evento?.nombre || '',
    eventDate: evento?.date,
    eventTime: evento?.hora,
    eventPlace: evento?.lugar,
    orgName: 'JR Eventos',
  })
  return (
    <button
      className={`btn-wa text-xs px-2.5 py-1.5 ${needsFollowup ? 'btn-wa-alert' : ''}`}
      onClick={() => openWhatsApp(guest.whatsapp, msg)}
      title={msg}
    >
      <span>💬</span>
      {needsFollowup ? 'Reenviar' : 'Abrir WA'}
    </button>
  )
}

function GuestRow({ guest, onStatusChange, onDelete, evento }) {
  const [saving, setSaving] = useState(false)
  const statusCfg = STATUS_CONFIG[guest.status] || STATUS_CONFIG.pending
  const followUp = needsFollowUp(guest)

  async function changeStatus(status) {
    setSaving(true)
    await onStatusChange(guest.id, status)
    setSaving(false)
  }

  return (
    <tr className={`hover:bg-rose-50 transition-colors ${followUp ? 'bg-red-50/40' : ''}`}>
      <td className="px-4 py-3">
        <div className="font-medium text-sm text-ink-800">{guest.fullName}</div>
        {guest.email && <div className="text-xs text-ink-400">{guest.email}</div>}
      </td>
      <td className="px-4 py-3">
        {guest.whatsapp ? (
          <span className="text-sm text-ink-600">{guest.whatsapp}</span>
        ) : (
          <span className="text-xs text-ink-300">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-ink-700">{guest.lugares || 1}</span>
      </td>
      <td className="px-4 py-3">
        {guest.menu
          ? <Badge variant="pink">{guest.menu}</Badge>
          : <span className="text-xs text-ink-300">—</span>
        }
      </td>
      <td className="px-4 py-3">
        <select
          value={guest.status || 'pending'}
          onChange={e => changeStatus(e.target.value)}
          disabled={saving}
          className={`text-xs rounded-full px-2.5 py-1 border font-medium outline-none cursor-pointer ${
            guest.status === 'confirmed' ? 'bg-sage-50 text-sage-700 border-sage-200' :
            guest.status === 'declined'  ? 'bg-ink-50 text-ink-500 border-ink-200'   :
            followUp                     ? 'bg-red-50 text-red-600 border-red-200'   :
                                           'bg-gold-50 text-gold-700 border-gold-200'
          }`}
        >
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado ✓</option>
          <option value="declined">No asiste</option>
        </select>
      </td>
      <td className="px-4 py-3">
        {followUp && (
          <span className="flex items-center gap-1 text-xs text-red-500 mb-1">
            <AlertTriangle size={11} /> +72hs
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {guest.whatsapp && <WAButton guest={guest} evento={evento} />}
          <button
            onClick={() => onDelete(guest.id)}
            className="text-ink-300 hover:text-red-400 transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function Invitados({ eventoId, evento }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ nombre: '', apellido: '', whatsapp: '', email: '', lugares: 1, menu: '', notas: '' })
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  const uid = user?.uid

  useEffect(() => {
    if (!uid || !eventoId) return
    const unsub = subscribeToInvitados(uid, eventoId, data => {
      setGuests(data)
      setLoading(false)
    })
    return unsub
  }, [uid, eventoId])

  async function handleStatusChange(guestId, status) {
    await updateInvitado(uid, eventoId, guestId, {
      status,
      lastContact: status === 'confirmed' ? new Date().toISOString() : undefined
    })
  }

  async function handleDelete(guestId) {
    if (!confirm('¿Eliminar invitado?')) return
    await deleteInvitado(uid, eventoId, guestId)
  }

  async function handleAdd() {
    if (!newGuest.nombre.trim()) { setAddError('El nombre es requerido'); return }
    setAdding(true)
    await addInvitado(uid, eventoId, {
      ...newGuest,
      fullName: [newGuest.nombre, newGuest.apellido].filter(Boolean).join(' '),
      status: 'pending',
      lastContact: null,
    })
    setAdding(false)
    setShowAddModal(false)
    setNewGuest({ nombre: '', apellido: '', whatsapp: '', email: '', lugares: 1, menu: '', notas: '' })
    setAddError('')
  }

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.fullName?.toLowerCase().includes(search.toLowerCase()) || g.whatsapp?.includes(search)
    const matchFilter =
      filter === 'all'       ? true :
      filter === 'confirmed' ? g.status === 'confirmed' :
      filter === 'pending'   ? g.status === 'pending' :
      filter === 'alert'     ? needsFollowUp(g) :
      filter === 'restriction' ? !!g.menu : true
    return matchSearch && matchFilter
  })

  const stats = {
    total:      guests.length,
    confirmed:  guests.filter(g => g.status === 'confirmed').length,
    pending:    guests.filter(g => g.status === 'pending').length,
    alert:      guests.filter(needsFollowUp).length,
    restriction:guests.filter(g => g.menu).length,
  }

  return (
    <div className="p-6 fade-in">
      {/* Stats */}
      <div className="flex gap-3 flex-wrap mb-5">
        {[
          { key: 'all',        label: `Todos (${stats.total})`,           variant: filter === 'all' ? 'pink' : 'gray' },
          { key: 'confirmed',  label: `✓ Confirmados (${stats.confirmed})`, variant: filter === 'confirmed' ? 'green' : 'gray' },
          { key: 'pending',    label: `Pendientes (${stats.pending})`,    variant: filter === 'pending' ? 'amber' : 'gray' },
          { key: 'alert',      label: `⚠ Sin resp. +72hs (${stats.alert})`, variant: filter === 'alert' ? 'red' : 'gray' },
          { key: 'restriction',label: `Restricción (${stats.restriction})`, variant: filter === 'restriction' ? 'pink' : 'gray' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}>
            <Badge variant={f.variant} className="cursor-pointer hover:opacity-80 transition-opacity">{f.label}</Badge>
          </button>
        ))}
      </div>

      {stats.alert > 0 && (
        <Alert variant="danger" className="mb-4">
          <AlertTriangle size={14} className="inline mr-1" />
          <strong>{stats.alert} invitado{stats.alert !== 1 ? 's' : ''}</strong> sin respuesta hace más de 72hs — abrí WA desde la tabla para reenviar el mensaje.
        </Alert>
      )}

      <Card>
        <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
            <Upload size={13} /> Template
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={13} /> Agregar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32"><span className="text-sm text-ink-400">Cargando...</span></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hay invitados que coincidan"
            description={guests.length === 0 ? 'Agregá invitados manualmente o importá desde Excel.' : 'Probá con otro filtro.'}
            action={guests.length === 0 && <Button size="sm" onClick={() => setShowAddModal(true)}><Plus size={13} /> Agregar invitado</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">WhatsApp</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-ink-400 uppercase tracking-wide">Lugares</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Menú / Restricción</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Alerta</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(g => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    evento={evento}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add guest modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar invitado" size="md">
        <div className="space-y-4">
          {addError && <Alert variant="danger">{addError}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre *" value={newGuest.nombre} onChange={e => setNewGuest(g => ({...g, nombre: e.target.value}))} />
            <Input label="Apellido" value={newGuest.apellido} onChange={e => setNewGuest(g => ({...g, apellido: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="WhatsApp" placeholder="11 1234-5678" value={newGuest.whatsapp} onChange={e => setNewGuest(g => ({...g, whatsapp: e.target.value}))} />
            <Input label="Email" type="email" value={newGuest.email} onChange={e => setNewGuest(g => ({...g, email: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cantidad de lugares" type="number" min="1" value={newGuest.lugares} onChange={e => setNewGuest(g => ({...g, lugares: parseInt(e.target.value)||1}))} />
            <Input label="Menú / Restricción" placeholder="Sin TACC, Vegano..." value={newGuest.menu} onChange={e => setNewGuest(g => ({...g, menu: e.target.value}))} />
          </div>
          <Input label="Notas" value={newGuest.notas} onChange={e => setNewGuest(g => ({...g, notas: e.target.value}))} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button onClick={handleAdd} loading={adding}>Agregar invitado</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
