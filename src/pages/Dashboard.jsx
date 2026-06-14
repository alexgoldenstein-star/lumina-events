import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Users, CheckCircle, DollarSign, AlertTriangle, Clock, Heart, PartyPopper, Building } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToEventos } from '../lib/db'
import { needsFollowUp } from '../lib/whatsapp'
import { Card, CardHeader, CardBody, Badge, ProgressBar, Button } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'
import { format, isPast, isFuture, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

const EVENT_ICONS = { boda: Heart, cumpleanos: PartyPopper, corporativo: Building, otro: CalendarCheck }
const EVENT_COLORS = { boda: 'text-rose-500 bg-rose-50', cumpleanos: 'text-gold-600 bg-gold-50', corporativo: 'text-sage-600 bg-sage-50', otro: 'text-ink-400 bg-ink-50' }

function StatCard({ icon: Icon, label, value, sub, color = 'rose' }) {
  const colors = {
    rose: 'bg-rose-50 text-rose-500',
    sage: 'bg-sage-50 text-sage-500',
    gold: 'bg-gold-50 text-gold-500',
    ink:  'bg-ink-50 text-ink-400',
  }
  return (
    <Card>
      <CardBody className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-400 font-medium">{label}</p>
          <p className="text-2xl font-serif text-ink-800 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
        </div>
      </CardBody>
    </Card>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToEventos(user.uid, (data) => {
      setEventos(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  const activos = eventos.filter(e => isFuture(new Date(e.date + 'T23:59:00')))
  const totalInvitados = activos.reduce((s, e) => s + (e.stats?.total || 0), 0)
  const totalConfirmados = activos.reduce((s, e) => s + (e.stats?.confirmed || 0), 0)
  const pctConfirmacion = totalInvitados ? Math.round((totalConfirmados / totalInvitados) * 100) : 0

  const pendientesAlert = activos.reduce((acc, e) => {
    const inv = Object.values(e.invitados || {})
    const sinResp = inv.filter(needsFollowUp)
    return acc + sinResp.length
  }, 0)

  const proximos = activos
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombre = profile?.nombre?.split(' ')[0] || ''

  return (
    <div className="fade-in">
      <PageHeader
        title={`${saludo}${nombre ? ', ' + nombre : ''} ✨`}
        subtitle={`Tenés ${activos.length} evento${activos.length !== 1 ? 's' : ''} activo${activos.length !== 1 ? 's' : ''}`}
        actions={<Link to="/app/eventos/nuevo"><Button>+ Nuevo evento</Button></Link>}
      />

      <div className="p-7 space-y-6">
        {/* Alert sin respuesta */}
        {pendientesAlert > 0 && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>
              <strong>{pendientesAlert} invitado{pendientesAlert !== 1 ? 's' : ''}</strong> sin respuesta hace más de 72hs — se sugiere reenvío
            </span>
            <Link to="/mensajes" className="ml-auto">
              <Button variant="outline" size="sm">Ver agenda WA</Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CalendarCheck} label="Eventos activos"   value={activos.length}         sub="próximos eventos"       color="rose" />
          <StatCard icon={Users}         label="Total invitados"   value={totalInvitados}         sub="en todos los eventos"   color="ink"  />
          <StatCard icon={CheckCircle}   label="Confirmaciones"    value={`${pctConfirmacion}%`}  sub={`${totalConfirmados} confirmados`} color="sage" />
          <StatCard icon={AlertTriangle} label="Sin respuesta +3d" value={pendientesAlert}        sub="requieren seguimiento"  color="gold" />
        </div>

        {/* Próximos eventos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader action={<Link to="/app/eventos" className="text-xs text-rose-500 hover:underline">Ver todos</Link>}>
              <CalendarCheck size={15} className="text-rose-400" />
              Próximos eventos
            </CardHeader>
            {loading ? (
              <CardBody><p className="text-sm text-ink-400">Cargando...</p></CardBody>
            ) : proximos.length === 0 ? (
              <CardBody>
                <p className="text-sm text-ink-400 text-center py-6">Aún no hay eventos creados</p>
                <Link to="/app/eventos/nuevo" className="flex justify-center">
                  <Button size="sm">Crear primer evento</Button>
                </Link>
              </CardBody>
            ) : (
              <div>
                {proximos.map(evento => {
                  const Icon = EVENT_ICONS[evento.tipo] || CalendarCheck
                  const colorClass = EVENT_COLORS[evento.tipo] || EVENT_COLORS.otro
                  const diasRestantes = differenceInDays(new Date(evento.date + 'T12:00:00'), new Date())
                  const stats = evento.stats || {}
                  const pct = stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0
                  return (
                    <Link
                      key={evento.id}
                      to={`/eventos/${evento.id}`}
                      className="flex items-center gap-3 px-5 py-4 border-b border-ink-50 last:border-0 hover:bg-rose-50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{evento.nombre}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{evento.lugar || 'Sin lugar'} · {stats.total || 0} inv.</p>
                        <ProgressBar value={pct} className="mt-1.5" />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-ink-600">
                          {diasRestantes === 0 ? '¡Hoy!' : diasRestantes === 1 ? 'Mañana' : `en ${diasRestantes}d`}
                        </p>
                        <p className="text-[10px] text-ink-400 mt-0.5">
                          {format(new Date(evento.date + 'T12:00:00'), 'd MMM', { locale: es })}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Tareas rápidas */}
          <Card>
            <CardHeader>
              <Clock size={15} className="text-rose-400" />
              Accesos rápidos
            </CardHeader>
            <CardBody className="space-y-3">
              <Link to="/app/eventos/nuevo">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-colors">
                    <CalendarCheck size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Crear nuevo evento</p>
                    <p className="text-xs text-ink-400">Cargar datos y lista de invitados</p>
                  </div>
                </div>
              </Link>
              <Link to="/mensajes">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors">
                    <span className="text-sm">💬</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Agenda de mensajes WA</p>
                    <p className="text-xs text-ink-400">Ver pendientes y reenviar</p>
                  </div>
                </div>
              </Link>
              <Link to="/proveedores/nuevo">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-gold-50 group-hover:bg-gold-100 flex items-center justify-center text-gold-600 transition-colors">
                    <Building size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Agregar proveedor</p>
                    <p className="text-xs text-ink-400">Guardar datos y comisión</p>
                  </div>
                </div>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
