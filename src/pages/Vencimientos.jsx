import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, AlertTriangle, Clock, CheckCircle, CalendarCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToVencimientos, createVencimiento, deleteVencimiento, subscribeToEventos } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, Button, Input, Select, Modal, EmptyState, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPOS = [
  { value: 'seña',        label: '💰 Pago / seña',       color: 'amber' },
  { value: 'contrato',    label: '📝 Contrato',           color: 'purple' },
  { value: 'confirmacion',label: '✅ Confirmación',       color: 'green' },
  { value: 'reunion',     label: '🤝 Reunión',            color: 'pink' },
  { value: 'entrega',     label: '📦 Entrega',            color: 'gray' },
  { value: 'otro',        label: '📌 Otro',               color: 'gray' },
]

function getStatusInfo(dueDate) {
  const d = new Date(dueDate + 'T23:59:00')
  if (isPast(d))     return { label: 'Vencido',    color: 'red',   icon: AlertTriangle }
  if (isToday(d))    return { label: 'Hoy!',       color: 'red',   icon: Bell }
  if (isTomorrow(d)) return { label: 'Mañana',     color: 'amber', icon: Clock }
  const days = differenceInDays(d, new Date())
  if (days <= 7)     return { label: `en ${days}d`, color: 'amber', icon: Clock }
  return { label: `en ${days}d`, color: 'green', icon: CalendarCheck }
}

const emptyForm = { titulo: '', tipo: 'seña', dueDate: '', eventoId: '', descripcion: '', notifyDaysBefore: '1' }

export default function Vencimientos() {
  const { user } = useAuth()
  const [vencimientos, setVencimientos] = useState([])
  const [eventos, setEventos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')

  useEffect(() => {
    if (!user) return
    const u1 = subscribeToVencimientos(user.uid, setVencimientos)
    const u2 = subscribeToEventos(user.uid, setEventos)
    return () => { u1(); u2() }
  }, [user])

  // Check for due notifications every minute
  useEffect(() => {
    if (!notifGranted || !vencimientos.length) return
    const check = () => {
      vencimientos.forEach(v => {
        if (v.notified) return
        const d = new Date(v.dueDate + 'T00:00:00')
        const daysUntil = differenceInDays(d, new Date())
        const notify = parseInt(v.notifyDaysBefore || 1)
        if (daysUntil <= notify && daysUntil >= 0) {
          new Notification(`⏰ Lumina Events — ${v.titulo}`, {
            body: daysUntil === 0 ? '¡Vence hoy!' : `Vence en ${daysUntil} día${daysUntil !== 1 ? 's' : ''}`,
            icon: '/favicon.svg',
          })
        }
      })
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [vencimientos, notifGranted])

  async function requestNotifications() {
    const permission = await Notification.requestPermission()
    setNotifGranted(permission === 'granted')
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.titulo.trim() || !form.dueDate) return
    setSaving(true)
    await createVencimiento(user.uid, form)
    setSaving(false)
    setShowModal(false)
    setForm(emptyForm)
  }

  const overdue  = vencimientos.filter(v => isPast(new Date(v.dueDate + 'T23:59:00')))
  const upcoming = vencimientos.filter(v => !isPast(new Date(v.dueDate + 'T23:59:00')))
  const eventoNombre = id => eventos.find(e => e.id === id)?.nombre

  return (
    <div className="fade-in">
      <PageHeader
        title="Vencimientos"
        subtitle="Alertas de pagos, contratos y confirmaciones"
        actions={<Button onClick={() => { setShowModal(true); setForm(emptyForm) }}><Plus size={15} /> Nuevo vencimiento</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Notification permission */}
        {!notifGranted && (
          <div className="flex items-center gap-3 bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 text-sm text-gold-800">
            <Bell size={16} className="flex-shrink-0" />
            <span>Activá las notificaciones para recibir alertas en tu dispositivo.</span>
            <Button variant="outline" size="sm" className="ml-auto border-gold-300 text-gold-700 hover:bg-gold-100" onClick={requestNotifications}>
              Activar
            </Button>
          </div>
        )}

        {overdue.length > 0 && (
          <Alert variant="danger">
            <AlertTriangle size={14} className="inline mr-1" />
            <strong>{overdue.length} vencimiento{overdue.length !== 1 ? 's' : ''} vencido{overdue.length !== 1 ? 's' : ''}</strong> — revisalos a la brevedad
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardBody className="text-center"><p className="text-2xl font-serif text-red-600">{overdue.length}</p><p className="text-xs text-ink-400 mt-1">Vencidos</p></CardBody></Card>
          <Card><CardBody className="text-center"><p className="text-2xl font-serif text-gold-600">{upcoming.filter(v => differenceInDays(new Date(v.dueDate), new Date()) <= 7).length}</p><p className="text-xs text-ink-400 mt-1">Esta semana</p></CardBody></Card>
          <Card><CardBody className="text-center"><p className="text-2xl font-serif text-ink-800">{upcoming.length}</p><p className="text-xs text-ink-400 mt-1">Próximos</p></CardBody></Card>
        </div>

        {vencimientos.length === 0 ? (
          <Card>
            <EmptyState
              icon={Bell}
              title="Sin vencimientos"
              description="Agregá recordatorios para pagos, contratos y confirmaciones importantes."
              action={<Button onClick={() => setShowModal(true)}><Plus size={13} /> Agregar</Button>}
            />
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-ink-50">
              {[...overdue, ...upcoming].map(v => {
                const status = getStatusInfo(v.dueDate)
                const Icon = status.icon
                const tipoLabel = TIPOS.find(t => t.value === v.tipo)?.label || v.tipo
                return (
                  <div key={v.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-rose-50 transition-colors group ${isPast(new Date(v.dueDate + 'T23:59:00')) ? 'bg-red-50/30' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      status.color === 'red' ? 'bg-red-50 text-red-500' :
                      status.color === 'amber' ? 'bg-gold-50 text-gold-600' :
                      'bg-sage-50 text-sage-600'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">{v.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-ink-400">{tipoLabel.split(' ').slice(1).join(' ')}</span>
                        {v.eventoId && eventoNombre(v.eventoId) && (
                          <span className="text-xs text-ink-400">· {eventoNombre(v.eventoId)}</span>
                        )}
                      </div>
                      {v.descripcion && <p className="text-xs text-ink-400 italic mt-0.5">{v.descripcion}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={status.color === 'red' ? 'red' : status.color === 'amber' ? 'amber' : 'green'}>
                        {status.label}
                      </Badge>
                      <p className="text-xs text-ink-400 mt-1">
                        {format(new Date(v.dueDate + 'T12:00:00'), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteVencimiento(user.uid, v.id)}
                      className="text-ink-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo vencimiento" size="md">
        <div className="space-y-4">
          <Input label="Título *" placeholder="Ej: Seña DJ Maxime" value={form.titulo} onChange={e => setField('titulo', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.tipo} onChange={e => setField('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input label="Fecha de vencimiento *" type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Evento relacionado" value={form.eventoId} onChange={e => setField('eventoId', e.target.value)}>
              <option value="">— General —</option>
              {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
            <Select label="Notificar con anticipación" value={form.notifyDaysBefore} onChange={e => setField('notifyDaysBefore', e.target.value)}>
              <option value="0">El mismo día</option>
              <option value="1">1 día antes</option>
              <option value="3">3 días antes</option>
              <option value="7">1 semana antes</option>
            </Select>
          </div>
          <Input label="Descripción / notas" value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}><Bell size={13} /> Guardar alerta</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
