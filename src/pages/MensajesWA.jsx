import { useEffect, useState } from 'react'
import { MessageCircle, Clock, AlertTriangle, CheckCircle, Send } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToInvitados, updateInvitado } from '../lib/db'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES } from '../lib/whatsapp'
import { Card, CardHeader, CardBody, Badge, Button, Modal } from '../components/ui'

const MSG_TYPES = [
  { value: MESSAGE_TYPES.PRIMERA_CONFIRMACION, label: 'Primera confirmación' },
  { value: MESSAGE_TYPES.SEGUIMIENTO,           label: 'Seguimiento (+72hs)'  },
  { value: MESSAGE_TYPES.RECORDATORIO,          label: 'Recordatorio previo'  },
  { value: MESSAGE_TYPES.DIA_DEL_EVENTO,        label: 'Día del evento'       },
]

function MessagePreview({ type, evento, guestName = '[Nombre]' }) {
  const msg = buildMessage({
    type,
    guestName,
    eventName:  evento?.nombre  || '[Evento]',
    eventDate:  evento?.date,
    eventTime:  evento?.hora,
    eventPlace: evento?.lugar,
    orgName:    'JR Eventos',
  })
  return (
    <div className="bg-[#ECE5DD] rounded-xl p-4 min-h-28">
      <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 max-w-xs text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">
        {msg.replace(/\*(.*?)\*/g, '$1')}
      </div>
    </div>
  )
}

function WAModal({ open, onClose, guest, evento, msgType }) {
  const msg = guest ? buildMessage({
    type: msgType,
    guestName: guest.fullName,
    eventName:  evento?.nombre,
    eventDate:  evento?.date,
    eventTime:  evento?.hora,
    eventPlace: evento?.lugar,
    orgName: 'JR Eventos',
  }) : ''

  function handleOpen() {
    openWhatsApp(guest?.whatsapp, msg)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Mensaje para ${guest?.fullName || ''}`} size="md">
      <div className="space-y-4">
        <div className="bg-[#ECE5DD] rounded-xl p-4">
          <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">
            {msg.replace(/\*(.*?)\*/g, '$1')}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1fbd5a] transition-colors"
          >
            <MessageCircle size={15} />
            Abrir en WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function MensajesWA({ eventoId, evento }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [msgType, setMsgType] = useState(MESSAGE_TYPES.PRIMERA_CONFIRMACION)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    return subscribeToInvitados(user.uid, eventoId, setGuests)
  }, [user?.uid, eventoId])

  const pendientes = guests.filter(g => g.status !== 'confirmed' && g.status !== 'declined' && g.whatsapp)
  const sinRespuesta = guests.filter(g => needsFollowUp(g) && g.whatsapp)

  function openModal(guest, type) {
    setSelectedGuest(guest)
    setMsgType(type)
    setModalOpen(true)
  }

  const today = new Date()
  const eventDate = evento?.date ? new Date(evento.date + 'T12:00:00') : null
  const diffDays = eventDate ? Math.ceil((eventDate - today) / (1000*60*60*24)) : null

  const cronograma = [
    { label: 'Envío inicial',         sub: 'Primera confirmación a todos',     status: 'done',   icon: CheckCircle },
    { label: 'Seguimiento +72hs',      sub: `${sinRespuesta.length} sin respuesta — pendiente`, status: sinRespuesta.length > 0 ? 'alert' : 'done', icon: sinRespuesta.length > 0 ? AlertTriangle : CheckCircle },
    { label: 'Recordatorio -7 días',   sub: eventDate ? `${diffDays > 7 ? 'en ' + (diffDays - 7) + 'd' : 'próximamente'}` : '—', status: 'pending', icon: Clock },
    { label: 'Recordatorio día previo',sub: 'Un día antes del evento',          status: 'pending', icon: Clock },
    { label: 'Día del evento',         sub: 'Recordatorio el mismo día',        status: 'pending', icon: Clock },
  ]

  return (
    <div className="p-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: template + preview */}
        <div className="space-y-5">
          <Card>
            <CardHeader><MessageCircle size={15} className="text-rose-400" /> Plantilla de mensaje</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-2">Tipo de mensaje</label>
                <select
                  value={msgType}
                  onChange={e => setMsgType(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-ink-200 rounded-lg outline-none focus:border-rose-400"
                >
                  {MSG_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-2">Vista previa</label>
                <MessagePreview type={msgType} evento={evento} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><Clock size={15} className="text-rose-400" /> Cronograma automático</CardHeader>
            <CardBody>
              <div className="space-y-4">
                {cronograma.map((item, i) => {
                  const Icon = item.icon
                  const colorClass =
                    item.status === 'done'    ? 'bg-sage-50 text-sage-600' :
                    item.status === 'alert'   ? 'bg-red-50 text-red-500' :
                                                'bg-gold-50 text-gold-600'
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-ink-700">{item.label}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{item.sub}</p>
                      </div>
                      {i < cronograma.length - 1 && (
                        <div className="absolute ml-3.5 mt-7 w-px h-4 bg-ink-100" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: queue */}
        <div className="space-y-5">
          {sinRespuesta.length > 0 && (
            <Card>
              <CardHeader action={<Badge variant="red">{sinRespuesta.length} pendientes</Badge>}>
                <AlertTriangle size={15} className="text-red-400" />
                Sin respuesta +72hs — reenviar
              </CardHeader>
              <div className="divide-y divide-ink-50">
                {sinRespuesta.map(g => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 bg-red-50/30 hover:bg-red-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">{g.fullName}</p>
                      <p className="text-xs text-ink-400">{g.whatsapp}</p>
                    </div>
                    <button
                      onClick={() => openModal(g, MESSAGE_TYPES.SEGUIMIENTO)}
                      className="btn-wa btn-wa-alert text-xs"
                    >
                      <MessageCircle size={12} /> Reenviar
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader action={<Badge variant="amber">{pendientes.length} con WA</Badge>}>
              <Send size={15} className="text-rose-400" />
              Todos los pendientes
            </CardHeader>
            <div className="divide-y divide-ink-50 max-h-80 overflow-y-auto">
              {pendientes.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-ink-400">
                  <CheckCircle size={24} className="text-sage-400 mx-auto mb-2" />
                  ¡Todos los invitados respondieron!
                </div>
              ) : (
                pendientes.map(g => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">{g.fullName}</p>
                      <p className="text-xs text-ink-400">{g.whatsapp}</p>
                    </div>
                    {needsFollowUp(g) && (
                      <Badge variant="red" className="text-[10px]">+72hs</Badge>
                    )}
                    <button
                      onClick={() => openModal(g, needsFollowUp(g) ? MESSAGE_TYPES.SEGUIMIENTO : msgType)}
                      className={`btn-wa text-xs ${needsFollowUp(g) ? 'btn-wa-alert' : ''}`}
                    >
                      <MessageCircle size={12} />
                      {needsFollowUp(g) ? 'Reenviar' : 'Enviar'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <WAModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        guest={selectedGuest}
        evento={evento}
        msgType={msgType}
      />
    </div>
  )
}
