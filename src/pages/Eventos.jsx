import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck, Plus, Heart, PartyPopper, Building,
  Edit, Trash2, Users, CheckCircle, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../lib/AuthContext'
import { subscribeToEventos, deleteEvento, subscribeToSharedEventos } from '../lib/db'
import { Card, Badge, Button, ProgressBar, EmptyState } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'
import CompartirEvento from './CompartirEvento'

const TIPO_CONFIG = {
  boda:        { label:'Boda',       icon:Heart,        color:'text-warm-500  bg-warm-50',   badge:'pink'  },
  cumpleanos:  { label:'Cumpleaños', icon:PartyPopper,  color:'text-gold-600  bg-gold-50',   badge:'amber' },
  corporativo: { label:'Corp.',      icon:Building,     color:'text-sage-600  bg-sage-50',   badge:'green' },
  otro:        { label:'Evento',     icon:CalendarCheck,color:'text-ink-400   bg-nude-100',  badge:'gray'  },
}

export default function Eventos() {
  const { user, teamOwner } = useAuth()
  const [eventos,        setEventos]        = useState([])
  const [sharedEventos,  setSharedEventos]  = useState([])
  const [loading,        setLoading]        = useState(true)
  const [deleting,       setDeleting]       = useState(null)
  const [compartirModal, setCompartirModal] = useState(null) // { id, nombre }
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const u1 = subscribeToEventos(user.uid, data => {
      setEventos(data)
      setLoading(false)
    })
    const u2 = subscribeToSharedEventos(user.uid, data => {
      setSharedEventos(data)
    })
    return () => { u1(); u2() }
  }, [user])

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!confirm('¿Eliminar este evento y todos sus datos?')) return
    setDeleting(id)
    await deleteEvento(user.uid, id)
    setDeleting(null)
  }

  function EventoCard({ evento, isShared }) {
    const cfg    = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.otro
    const Icon   = cfg.icon
    const stats  = evento.stats || {}
    const pct    = stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0
    const dateObj= evento.date ? new Date(evento.date + 'T12:00:00') : null

    return (
      <Card
        className="hover:shadow-sm transition-shadow cursor-pointer"
        onClick={() => navigate(`/eventos/${evento.id}`)}
      >
        <div className="flex items-center gap-4 p-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
            <Icon size={22}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-medium text-ink-800">{evento.nombre}</h3>
              <Badge variant={cfg.badge}>{cfg.label}</Badge>
              {isShared && (
                <Badge variant="gray">
                  <Share2 size={10}/> Compartido
                </Badge>
              )}
              {stats.noResponse > 0 && (
                <Badge variant="red">⚠ {stats.noResponse} sin resp.</Badge>
              )}
            </div>
            <p className="text-sm text-ink-400 mt-0.5">
              {evento.lugar || 'Sin lugar'}
              {dateObj && ` · ${format(dateObj, "EEEE d 'de' MMMM", { locale: es })}`}
              {evento.hora && ` · ${evento.hora} hs`}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-ink-400">
                <Users size={12}/> {stats.total || 0} invitados
              </div>
              <div className="flex items-center gap-1 text-xs text-sage-600">
                <CheckCircle size={12}/> {stats.confirmed || 0} confirmados
              </div>
              <div className="flex-1 max-w-32">
                <ProgressBar value={pct} color="warm"/>
              </div>
              <span className="text-xs text-ink-400">{pct}%</span>
            </div>
          </div>

          {/* Acciones — solo para eventos propios */}
          {!isShared && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="ghost" size="xs"
                title="Compartir con el equipo"
                onClick={e => {
                  e.stopPropagation()
                  setCompartirModal({ id: evento.id, nombre: evento.nombre })
                }}
              >
                <Share2 size={14}/>
              </Button>
              <Button
                variant="ghost" size="xs"
                onClick={e => { e.stopPropagation(); navigate(`/eventos/${evento.id}/editar`) }}
              >
                <Edit size={14}/>
              </Button>
              <Button
                variant="ghost" size="xs"
                className="hover:text-red-500 hover:bg-red-50"
                onClick={e => handleDelete(e, evento.id)}
                loading={deleting === evento.id}
              >
                <Trash2 size={14}/>
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  const allEmpty = eventos.length === 0 && sharedEventos.length === 0

  return (
    <div className="fade-in">
      <PageHeader
        title="Mis Eventos"
        subtitle={`${eventos.length} propios${sharedEventos.length > 0 ? ` · ${sharedEventos.length} compartidos` : ''}`}
        actions={
          <Link to="/eventos/nuevo">
            <Button><Plus size={15}/> Nuevo Evento</Button>
          </Link>
        }
      />

      <div className="p-7 space-y-6">
        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-28 bg-white rounded-xl border border-nude-200 animate-pulse"/>
            ))}
          </div>
        ) : allEmpty ? (
          <Card>
            <EmptyState
              icon={CalendarCheck}
              title="Todavía no hay eventos"
              description="Creá tu primer evento y empezá a gestionar invitados, proveedores y presupuestos."
              action={
                <Link to="/eventos/nuevo">
                  <Button><Plus size={15}/> Crear primer evento</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            {/* Eventos propios */}
            {eventos.length > 0 && (
              <div>
                {sharedEventos.length > 0 && (
                  <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Mis eventos</h2>
                )}
                <div className="grid gap-4">
                  {eventos.map(evento => (
                    <EventoCard key={evento.id} evento={evento} isShared={false}/>
                  ))}
                </div>
              </div>
            )}

            {/* Eventos compartidos conmigo */}
            {sharedEventos.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Share2 size={12}/> Compartidos conmigo
                </h2>
                <div className="grid gap-4">
                  {sharedEventos.map(evento => (
                    <EventoCard key={`shared-${evento.id}`} evento={evento} isShared={true}/>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal compartir */}
      {compartirModal && (
        <CompartirEvento
          open={!!compartirModal}
          onClose={() => setCompartirModal(null)}
          eventoId={compartirModal.id}
          eventoNombre={compartirModal.nombre}
        />
      )}
    </div>
  )
}
