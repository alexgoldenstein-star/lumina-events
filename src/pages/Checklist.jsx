import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckSquare, Calendar, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToTareas, createTarea, toggleTarea, deleteTarea } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, Button, Input, Select, Modal, EmptyState, Alert, ProgressBar } from '../components/ui'

const CATEGORIAS = ['General', 'Catering', 'Decoración', 'Música', 'Fotografía', 'Indumentaria', 'Papelería', 'Logística', 'Pago / seña', 'Otro']
const PRIORIDADES = [
  { value: 'alta',   label: '🔴 Alta',   color: 'red'   },
  { value: 'media',  label: '🟡 Media',  color: 'amber' },
  { value: 'baja',   label: '🟢 Baja',   color: 'green' },
]

const emptyForm = { titulo: '', categoria: 'General', prioridad: 'media', dueDate: '', clientVisible: false, notas: '' }

function TareaRow({ tarea, onToggle, onDelete }) {
  const overdue = tarea.dueDate && !tarea.done && new Date(tarea.dueDate + 'T23:59:00') < new Date()
  const prioColor = { alta: 'text-red-500', media: 'text-gold-500', baja: 'text-sage-500' }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${tarea.done ? 'opacity-50' : overdue ? 'bg-red-50/50' : 'hover:bg-rose-50/50'}`}>
      <button
        onClick={() => onToggle(tarea.id, !tarea.done)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          tarea.done ? 'bg-rose-500 border-rose-500' : 'border-ink-300 hover:border-rose-400'
        }`}
      >
        {tarea.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${tarea.done ? 'line-through text-ink-400' : 'text-ink-800'}`}>{tarea.titulo}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-ink-400">{tarea.categoria}</span>
          {tarea.dueDate && (
            <span className={`flex items-center gap-0.5 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-ink-400'}`}>
              {overdue && <AlertTriangle size={10} />}
              <Calendar size={10} />
              {new Date(tarea.dueDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {tarea.clientVisible && <Badge variant="pink" className="text-[10px]">Cliente</Badge>}
        </div>
        {tarea.notas && <p className="text-xs text-ink-400 mt-0.5 italic">{tarea.notas}</p>}
      </div>
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${prioColor[tarea.prioridad] || 'text-ink-300'} bg-current`} />
      <button
        onClick={() => onDelete(tarea.id)}
        className="text-ink-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function Checklist({ eventoId }) {
  const { user } = useAuth()
  const [tareas, setTareas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    return subscribeToTareas(user.uid, eventoId, setTareas)
  }, [user?.uid, eventoId])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.titulo.trim()) return
    setSaving(true)
    await createTarea(user.uid, eventoId, form)
    setSaving(false)
    setShowModal(false)
    setForm(emptyForm)
  }

  async function handleToggle(id, done) {
    await toggleTarea(user.uid, eventoId, id, done)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar tarea?')) return
    await deleteTarea(user.uid, eventoId, id)
  }

  const done    = tareas.filter(t => t.done).length
  const total   = tareas.length
  const pct     = total ? Math.round((done / total) * 100) : 0
  const overdue = tareas.filter(t => t.dueDate && !t.done && new Date(t.dueDate + 'T23:59:00') < new Date())

  const filtered = tareas.filter(t => {
    if (filter === 'pending')  return !t.done
    if (filter === 'done')     return t.done
    if (filter === 'overdue')  return !t.done && t.dueDate && new Date(t.dueDate + 'T23:59:00') < new Date()
    if (filter === 'client')   return t.clientVisible
    return true
  })

  // Seed default tasks for new events
  const DEFAULT_TASKS = [
    { titulo: 'Confirmar salón / lugar', categoria: 'Logística', prioridad: 'alta', clientVisible: false },
    { titulo: 'Contratar catering', categoria: 'Catering', prioridad: 'alta', clientVisible: false },
    { titulo: 'Contratar fotógrafo/a', categoria: 'Fotografía', prioridad: 'alta', clientVisible: false },
    { titulo: 'Confirmar música / DJ', categoria: 'Música', prioridad: 'alta', clientVisible: false },
    { titulo: 'Pagar seña del salón', categoria: 'Pago / seña', prioridad: 'alta', clientVisible: true },
    { titulo: 'Lista de invitados final', categoria: 'General', prioridad: 'media', clientVisible: true },
    { titulo: 'Definir menú y restricciones', categoria: 'Catering', prioridad: 'media', clientVisible: true },
    { titulo: 'Confirmar decoración', categoria: 'Decoración', prioridad: 'media', clientVisible: false },
    { titulo: 'Preparar playlist / momentos especiales', categoria: 'Música', prioridad: 'baja', clientVisible: true },
    { titulo: 'Confirmar transporte / traslados', categoria: 'Logística', prioridad: 'baja', clientVisible: true },
  ]

  async function seedTasks() {
    for (const t of DEFAULT_TASKS) {
      await createTarea(user.uid, eventoId, t)
    }
  }

  return (
    <div className="p-6 fade-in space-y-5">
      {/* Progress */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-700">Progreso del evento</p>
            <span className="text-base font-serif text-rose-600">{pct}%</span>
          </div>
          <ProgressBar value={pct} color="rose" />
          <div className="flex gap-4 mt-3 text-xs text-ink-400">
            <span><strong className="text-sage-600">{done}</strong> completadas</span>
            <span><strong className="text-ink-600">{total - done}</strong> pendientes</span>
            {overdue.length > 0 && <span><strong className="text-red-500">{overdue.length}</strong> vencidas</span>}
          </div>
        </CardBody>
      </Card>

      {overdue.length > 0 && (
        <Alert variant="danger">
          <AlertTriangle size={14} className="inline mr-1" />
          <strong>{overdue.length} tarea{overdue.length !== 1 ? 's' : ''} vencida{overdue.length !== 1 ? 's' : ''}</strong> — {overdue.map(t => t.titulo).join(', ')}
        </Alert>
      )}

      <Card>
        <CardHeader action={
          <div className="flex gap-2">
            {total === 0 && (
              <Button variant="outline" size="sm" onClick={seedTasks}>
                ✨ Cargar tareas típicas
              </Button>
            )}
            <Button size="sm" onClick={() => { setShowModal(true); setForm(emptyForm) }}>
              <Plus size={13} /> Agregar
            </Button>
          </div>
        }>
          <CheckSquare size={15} className="text-rose-400" /> Checklist
        </CardHeader>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-ink-50 flex gap-2 overflow-x-auto">
          {[
            { key: 'all',     label: `Todo (${total})` },
            { key: 'pending', label: `Pendiente (${total - done})` },
            { key: 'done',    label: `Hecho (${done})` },
            { key: 'overdue', label: `Vencido (${overdue.length})` },
            { key: 'client',  label: 'Visible al cliente' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.key ? 'bg-rose-500 text-white' : 'text-ink-500 hover:bg-rose-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={total === 0 ? 'Sin tareas todavía' : 'No hay tareas en esta vista'}
            description={total === 0 ? 'Agregá tareas manualmente o cargá las tareas típicas de un evento.' : ''}
          />
        ) : (
          <div className="px-2 py-1 divide-y divide-ink-50">
            {filtered.map(t => (
              <TareaRow key={t.id} tarea={t} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva tarea" size="md">
        <div className="space-y-4">
          <Input label="Título de la tarea *" placeholder="Ej: Confirmar catering" value={form.titulo} onChange={e => setField('titulo', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoría" value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Prioridad" value={form.prioridad} onChange={e => setField('prioridad', e.target.value)}>
              {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>
          <Input label="Fecha de vencimiento" type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} />
          <Input label="Notas" placeholder="Detalle opcional..." value={form.notas} onChange={e => setField('notas', e.target.value)} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.clientVisible}
              onChange={e => setField('clientVisible', e.target.checked)}
              className="w-4 h-4 rounded accent-rose-500"
            />
            <div>
              <p className="text-sm font-medium text-ink-700">Visible para el cliente</p>
              <p className="text-xs text-ink-400">El cliente podrá verla y marcarla como hecha en su panel</p>
            </div>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Agregar tarea</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
