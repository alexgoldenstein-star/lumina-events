import { useEffect, useState, useRef } from 'react'
import { Users, Plus, Search, X, AlertTriangle, Upload, Download, FileSpreadsheet, Check } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToInvitados, addInvitado, updateInvitado, deleteInvitado, addManyInvitados } from '../lib/db'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES } from '../lib/whatsapp'
import { parseGuestsFromFile, downloadExcelTemplate } from '../lib/excel'
import { Button, Badge, Input, Select, Modal, EmptyState, Alert, Card } from '../components/ui'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  badge: 'amber', dot: 'bg-gold-400'  },
  confirmed: { label: 'Confirmado', badge: 'green', dot: 'bg-sage-500'  },
  declined:  { label: 'No asiste',  badge: 'gray',  dot: 'bg-ink-300'   },
}

function WAButton({ guest, evento }) {
  const isAlert = needsFollowUp(guest)
  const msgType = isAlert ? MESSAGE_TYPES.SEGUIMIENTO : MESSAGE_TYPES.PRIMERA_CONFIRMACION
  const msg = buildMessage({
    type: msgType,
    guestName: guest.fullName,
    eventName:  evento?.nombre || '',
    eventDate:  evento?.date,
    eventTime:  evento?.hora,
    eventPlace: evento?.lugar,
    orgName: 'JR Eventos',
  })
  return (
    <button
      className={`btn-wa text-xs px-2.5 py-1.5 ${isAlert ? 'btn-wa-alert' : ''}`}
      onClick={() => openWhatsApp(guest.whatsapp, msg)}
    >
      <span>💬</span> {isAlert ? 'Reenviar' : 'WA'}
    </button>
  )
}

// ─── Componente de import con drag & drop ──────────────────────────────────────
function ImportPanel({ eventoId, onImported }) {
  const { user } = useAuth()
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setLoading(true)
    setError('')
    setPreview(null)
    setDone(false)
    try {
      const result = await parseGuestsFromFile(file)
      setPreview(result)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleImport() {
    if (!preview?.guests?.length) return
    setImporting(true)
    await addManyInvitados(user.uid, eventoId, preview.guests)
    setImporting(false)
    setDone(true)
    setTimeout(() => {
      setPreview(null)
      setDone(false)
      onImported && onImported()
    }, 1500)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-4">
      {/* Botón descargar template */}
      <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-xl">
        <div>
          <p className="text-sm font-medium text-rose-700">1. Descargá el modelo</p>
          <p className="text-xs text-rose-500 mt-0.5">Excel con las columnas correctas e instrucciones incluidas</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
          <Download size={13} /> Descargar modelo
        </Button>
      </div>

      {/* Zona de upload */}
      <div>
        <p className="text-sm font-medium text-ink-700 mb-2">2. Subí tu lista completada</p>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !preview && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-rose-400 bg-rose-50'
              : preview
              ? 'border-sage-300 bg-sage-50 cursor-default'
              : 'border-ink-200 hover:border-rose-300 hover:bg-rose-50'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink-500">Leyendo archivo...</p>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                <Check size={24} className="text-sage-600" />
              </div>
              <p className="text-sm font-medium text-sage-700">¡Importados correctamente!</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet size={32} className="text-sage-500" />
              <p className="text-sm font-medium text-sage-700">{preview.total} invitados detectados</p>
              <p className="text-xs text-ink-400">{preview.withPhone} con WhatsApp · {preview.total - preview.withPhone} sin teléfono</p>
              <button
                onClick={e => { e.stopPropagation(); setPreview(null); setError('') }}
                className="text-xs text-ink-400 hover:text-red-500 underline mt-1"
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-rose-300" />
              <p className="text-sm font-medium text-ink-600">
                Arrastrá el archivo acá o hacé clic para seleccionar
              </p>
              <p className="text-xs text-ink-400">Formatos: .xlsx, .xls, .csv</p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Preview de invitados */}
      {preview && preview.guests.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-500 mb-2">Vista previa (primeros 5)</p>
          <div className="bg-ink-50 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-200">
                  <th className="px-3 py-2 text-left text-ink-400 font-medium">Nombre</th>
                  <th className="px-3 py-2 text-left text-ink-400 font-medium">WhatsApp</th>
                  <th className="px-3 py-2 text-left text-ink-400 font-medium">Lugares</th>
                  <th className="px-3 py-2 text-left text-ink-400 font-medium">Menú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {preview.guests.slice(0, 5).map((g, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium text-ink-800">{g.fullName}</td>
                    <td className="px-3 py-2 text-ink-500">{g.whatsapp || <span className="text-ink-300">—</span>}</td>
                    <td className="px-3 py-2 text-ink-600">{g.lugares}</td>
                    <td className="px-3 py-2">{g.menu ? <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">{g.menu}</span> : <span className="text-ink-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.total > 5 && (
              <p className="px-3 py-2 text-xs text-ink-400 border-t border-ink-200">
                ...y {preview.total - 5} invitado{preview.total - 5 !== 1 ? 's' : ''} más
              </p>
            )}
          </div>
        </div>
      )}

      {preview && (
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={() => { setPreview(null); setError('') }}>Cancelar</Button>
          <Button onClick={handleImport} loading={importing}>
            <Upload size={13} /> Importar {preview.total} invitados
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Fila de invitado ────────────────────────────────────────────────────────
function GuestRow({ guest, onStatusChange, onDelete, evento }) {
  const [saving, setSaving] = useState(false)
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
      <td className="px-4 py-3 text-sm text-ink-600">
        {guest.whatsapp || <span className="text-xs text-ink-300">—</span>}
      </td>
      <td className="px-4 py-3 text-center text-sm text-ink-700">{guest.lugares || 1}</td>
      <td className="px-4 py-3">
        {guest.menu ? <Badge variant="pink">{guest.menu}</Badge> : <span className="text-xs text-ink-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <select
          value={guest.status || 'pending'}
          onChange={e => changeStatus(e.target.value)}
          disabled={saving}
          className={`text-xs rounded-full px-2.5 py-1 border font-medium outline-none cursor-pointer ${
            guest.status === 'confirmed' ? 'bg-sage-50 text-sage-700 border-sage-200' :
            guest.status === 'declined'  ? 'bg-ink-50 text-ink-500 border-ink-200' :
            followUp                     ? 'bg-red-50 text-red-600 border-red-200' :
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
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertTriangle size={11} /> +72hs
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {guest.whatsapp && <WAButton guest={guest} evento={evento} />}
          <button onClick={() => onDelete(guest.id)} className="text-ink-300 hover:text-red-400 transition-colors p-1">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Invitados({ eventoId, evento }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ nombre: '', apellido: '', whatsapp: '', email: '', lugares: 1, menu: '', notas: '' })
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    const unsub = subscribeToInvitados(user.uid, eventoId, data => {
      setGuests(data)
      setLoading(false)
    })
    return unsub
  }, [user?.uid, eventoId])

  async function handleStatusChange(guestId, status) {
    await updateInvitado(user.uid, eventoId, guestId, {
      status,
      lastContact: status === 'confirmed' ? new Date().toISOString() : undefined
    })
  }

  async function handleDelete(guestId) {
    if (!confirm('¿Eliminar invitado?')) return
    await deleteInvitado(user.uid, eventoId, guestId)
  }

  async function handleAdd() {
    if (!newGuest.nombre.trim()) { setAddError('El nombre es requerido'); return }
    setAdding(true)
    await addInvitado(user.uid, eventoId, {
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
      filter === 'all'         ? true :
      filter === 'confirmed'   ? g.status === 'confirmed' :
      filter === 'pending'     ? g.status === 'pending' :
      filter === 'alert'       ? needsFollowUp(g) :
      filter === 'restriction' ? !!g.menu : true
    return matchSearch && matchFilter
  })

  const stats = {
    total:       guests.length,
    confirmed:   guests.filter(g => g.status === 'confirmed').length,
    pending:     guests.filter(g => g.status === 'pending').length,
    alert:       guests.filter(needsFollowUp).length,
    restriction: guests.filter(g => g.menu).length,
  }

  return (
    <div className="p-6 fade-in">
      {/* Filtros */}
      <div className="flex gap-3 flex-wrap mb-5">
        {[
          { key: 'all',         label: `Todos (${stats.total})` },
          { key: 'confirmed',   label: `✓ Confirmados (${stats.confirmed})` },
          { key: 'pending',     label: `Pendientes (${stats.pending})` },
          { key: 'alert',       label: `⚠ Sin resp. +72hs (${stats.alert})` },
          { key: 'restriction', label: `Restricción (${stats.restriction})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f.key
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-ink-500 border-ink-200 hover:border-rose-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {stats.alert > 0 && (
        <Alert variant="danger" className="mb-4">
          <AlertTriangle size={14} className="inline mr-1" />
          <strong>{stats.alert} invitado{stats.alert !== 1 ? 's' : ''}</strong> sin respuesta hace más de 72hs
        </Alert>
      )}

      <Card>
        <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          {/* Botón importar Excel — destacado */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <FileSpreadsheet size={13} /> Importar Excel
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={13} /> Agregar uno
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-sm text-ink-400">Cargando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={guests.length === 0 ? 'Sin invitados todavía' : 'No hay resultados'}
            description={guests.length === 0 ? 'Importá tu lista desde Excel o agregá invitados uno por uno.' : 'Probá con otro filtro.'}
            action={guests.length === 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowImportModal(true)}>
                  <FileSpreadsheet size={13} /> Importar Excel
                </Button>
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus size={13} /> Agregar uno
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Nombre</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">WhatsApp</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-ink-400 uppercase tracking-wide">Lugares</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide">Menú</th>
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

      {/* Modal importar Excel */}
      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Importar invitados desde Excel" size="lg">
        <ImportPanel
          eventoId={eventoId}
          onImported={() => setShowImportModal(false)}
        />
      </Modal>

      {/* Modal agregar uno */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar invitado" size="md">
        <div className="space-y-4">
          {addError && <Alert variant="danger">{addError}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre *" value={newGuest.nombre} onChange={e => setNewGuest(g => ({...g, nombre: e.target.value}))} />
            <Input label="Apellido" value={newGuest.apellido} onChange={e => setNewGuest(g => ({...g, apellido: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="WhatsApp" placeholder="1112345678" value={newGuest.whatsapp} onChange={e => setNewGuest(g => ({...g, whatsapp: e.target.value}))} />
            <Input label="Email" type="email" value={newGuest.email} onChange={e => setNewGuest(g => ({...g, email: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cantidad de lugares" type="number" min="1" value={newGuest.lugares} onChange={e => setNewGuest(g => ({...g, lugares: parseInt(e.target.value)||1}))} />
            <Input label="Menú / Restricción" placeholder="Sin TACC, Vegano..." value={newGuest.menu} onChange={e => setNewGuest(g => ({...g, menu: e.target.value}))} />
          </div>
          <Input label="Notas" value={newGuest.notas} onChange={e => setNewGuest(g => ({...g, notas: e.target.value}))} />
          <p className="text-xs text-ink-400">
            📱 Formatos de WhatsApp aceptados: <code className="bg-ink-100 px-1 rounded">1112345678</code> · <code className="bg-ink-100 px-1 rounded">11 1234-5678</code> · <code className="bg-ink-100 px-1 rounded">+54 9 11 1234-5678</code>
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button onClick={handleAdd} loading={adding}>Agregar invitado</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
