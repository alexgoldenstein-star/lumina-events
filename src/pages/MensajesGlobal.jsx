import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, AlertTriangle, CheckCircle, CalendarCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToEventos } from '../lib/db'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES } from '../lib/whatsapp'
import { Card, CardHeader, Badge, Modal, Button, EmptyState } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

function WAModal({ open, onClose, guest, evento, msgType }) {
  const msg = guest ? buildMessage({
    type: msgType,
    guestName: guest.fullName,
    eventName: evento?.nombre,
    eventDate: evento?.date,
    eventTime: evento?.hora,
    eventPlace: evento?.lugar,
    orgName: 'JR Eventos',
  }) : ''

  return (
    <Modal open={open} onClose={onClose} title={`Mensaje para ${guest?.fullName || ''}`} size="md">
      <div className="space-y-4">
        <p className="text-xs text-ink-400">Evento: <strong className="text-ink-700">{evento?.nombre}</strong></p>
        <div className="bg-[#ECE5DD] rounded-xl p-4">
          <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">
            {msg.replace(/\*(.*?)\*/g, '$1')}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <button
            onClick={() => { openWhatsApp(guest?.whatsapp, msg); onClose() }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1fbd5a] transition-colors"
          >
            <MessageCircle size={15} /> Abrir en WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function MensajesGlobal() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState([])
  const [allGuests, setAllGuests] = useState([]) // [{guest, evento}]
  const [loading, setLoading] = useState(true)
  const [modalData, setModalData] = useState(null)
  const [msgType, setMsgType] = useState(MESSAGE_TYPES.PRIMERA_CONFIRMACION)
  const [filterEvento, setFilterEvento] = useState('all')

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToEventos(user.uid, (evs) => {
      setEventos(evs)
      // Subscribe to all guests across all events
      const listeners = []
      const guestMap = {}

      evs.forEach(evento => {
        const r = ref(db, `users/${user.uid}/eventos/${evento.id}/invitados`)
        const handler = onValue(r, snap => {
          const data = snap.val() || {}
          guestMap[evento.id] = Object.values(data).map(g => ({ guest: g, evento }))
          const flat = Object.values(guestMap).flat()
          setAllGuests(flat)
          setLoading(false)
        })
        listeners.push({ r, handler })
      })

      if (evs.length === 0) setLoading(false)

      return () => listeners.forEach(({ r }) => off(r))
    })
    return unsub
  }, [user])

  const pendientes = allGuests.filter(({ guest }) =>
    guest.status !== 'confirmed' && guest.status !== 'declined' && guest.whatsapp
  )
  const sinRespuesta = allGuests.filter(({ guest }) => needsFollowUp(guest) && guest.whatsapp)
  const confirmados  = allGuests.filter(({ guest }) => guest.status === 'confirmed')

  const filtered = pendientes.filter(({ evento }) =>
    filterEvento === 'all' || evento.id === filterEvento
  )
  const filteredAlert = sinRespuesta.filter(({ evento }) =>
    filterEvento === 'all' || evento.id === filterEvento
  )

  function openModal(guest, evento, type) {
    setModalData({ guest, evento })
    setMsgType(type)
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Agenda de Mensajes WA"
        subtitle={`${sinRespuesta.length} sin respuesta · ${pendientes.length} pendientes · ${confirmados.length} confirmados`}
      />

      <div className="p-7 space-y-6">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-serif text-ink-800">{sinRespuesta.length}</p>
                <p className="text-xs text-ink-400">Sin respuesta +72hs</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center">
                <MessageCircle size={18} className="text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-ink-800">{pendientes.length}</p>
                <p className="text-xs text-ink-400">Pendientes con WA</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center">
                <CheckCircle size={18} className="text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-ink-800">{confirmados.length}</p>
                <p className="text-xs text-ink-400">Confirmados</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtro por evento */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterEvento('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterEvento === 'all' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-ink-500 border-ink-200 hover:border-rose-300'}`}
          >
            Todos los eventos
          </button>
          {eventos.map(e => (
            <button
              key={e.id}
              onClick={() => setFilterEvento(e.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterEvento === e.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-ink-500 border-ink-200 hover:border-rose-300'}`}
            >
              {e.nombre}
            </button>
          ))}
        </div>

        {/* Sin respuesta - URGENTE */}
        {filteredAlert.length > 0 && (
          <Card>
            <CardHeader action={<Badge variant="red">{filteredAlert.length} urgentes</Badge>}>
              <AlertTriangle size={15} className="text-red-400" />
              Sin respuesta hace más de 72hs
            </CardHeader>
            <div className="divide-y divide-ink-50">
              {filteredAlert.map(({ guest, evento }) => (
                <div key={`${evento.id}-${guest.id}`} className="flex items-center gap-3 px-5 py-3 bg-red-50/30 hover:bg-red-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">{guest.fullName}</p>
                    <p className="text-xs text-ink-400">{guest.whatsapp}</p>
                  </div>
                  <Link to={`/eventos/${evento.id}`}>
                    <Badge variant="pink" className="cursor-pointer hover:opacity-80">{evento.nombre}</Badge>
                  </Link>
                  <button
                    onClick={() => openModal(guest, evento, MESSAGE_TYPES.SEGUIMIENTO)}
                    className="btn-wa btn-wa-alert text-xs"
                  >
                    <MessageCircle size={12} /> Reenviar
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Todos los pendientes */}
        <Card>
          <CardHeader action={
            <div className="flex items-center gap-2">
              <select
                value={msgType}
                onChange={e => setMsgType(e.target.value)}
                className="text-xs px-2 py-1 border border-ink-200 rounded-lg outline-none focus:border-rose-400"
              >
                <option value={MESSAGE_TYPES.PRIMERA_CONFIRMACION}>Primera confirmación</option>
                <option value={MESSAGE_TYPES.SEGUIMIENTO}>Seguimiento</option>
                <option value={MESSAGE_TYPES.RECORDATORIO}>Recordatorio</option>
                <option value={MESSAGE_TYPES.DIA_DEL_EVENTO}>Día del evento</option>
              </select>
              <Badge variant="amber">{filtered.length}</Badge>
            </div>
          }>
            <MessageCircle size={15} className="text-rose-400" />
            Pendientes de confirmar
          </CardHeader>

          {loading ? (
            <div className="py-12 text-center text-sm text-ink-400">Cargando...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Todo al día"
              description={eventos.length === 0 ? 'Primero creá un evento y cargá invitados.' : '¡Todos los invitados respondieron!'}
              action={eventos.length === 0 && <Link to="/eventos/nuevo"><Button size="sm">Crear evento</Button></Link>}
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {filtered.map(({ guest, evento }) => (
                <div key={`${evento.id}-${guest.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-rose-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">{guest.fullName}</p>
                    <p className="text-xs text-ink-400">{guest.whatsapp}</p>
                    {guest.menu && <Badge variant="pink" className="mt-1 text-[10px]">{guest.menu}</Badge>}
                  </div>
                  <Link to={`/eventos/${evento.id}`}>
                    <Badge variant="gray" className="cursor-pointer hover:opacity-80 hidden sm:inline-flex">{evento.nombre}</Badge>
                  </Link>
                  {needsFollowUp(guest) && <Badge variant="red" className="text-[10px]">+72hs</Badge>}
                  <button
                    onClick={() => openModal(guest, evento, needsFollowUp(guest) ? MESSAGE_TYPES.SEGUIMIENTO : msgType)}
                    className={`btn-wa text-xs ${needsFollowUp(guest) ? 'btn-wa-alert' : ''}`}
                  >
                    <MessageCircle size={12} />
                    {needsFollowUp(guest) ? 'Reenviar' : 'Enviar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {modalData && (
        <WAModal
          open={!!modalData}
          onClose={() => setModalData(null)}
          guest={modalData.guest}
          evento={modalData.evento}
          msgType={msgType}
        />
      )}
    </div>
  )
}
