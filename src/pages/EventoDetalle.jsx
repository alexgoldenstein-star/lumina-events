import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, MessageCircle, Receipt, FileText, Edit } from 'lucide-react'
import { get } from 'firebase/database'
import { eventoRef } from '../lib/db'
import { useAuth } from '../lib/AuthContext'
import { Button, Spinner } from '../components/ui'
import Invitados from './Invitados'
import MensajesWA from './MensajesWA'
import Presupuesto from './Presupuesto'
import Documentos from './Documentos'

const TABS = [
  { id: 'invitados',   label: 'Invitados',   icon: Users },
  { id: 'mensajes',    label: 'Mensajes WA', icon: MessageCircle },
  { id: 'presupuesto', label: 'Presupuesto', icon: Receipt },
  { id: 'documentos',  label: 'Documentos',  icon: FileText },
]

export default function EventoDetalle() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('invitados')

  useEffect(() => {
    if (!user || !id) return
    const r = eventoRef(user.uid, id)
    get(r).then(snap => {
      if (snap.exists()) setEvento(snap.val())
      else navigate('/eventos')
      setLoading(false)
    })
  }, [user, id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
  if (!evento) return null

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-7 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/eventos" className="text-ink-400 hover:text-ink-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-serif text-ink-800 truncate">{evento.nombre}</h1>
            <p className="text-sm text-ink-400">
              {evento.lugar && `${evento.lugar} · `}
              {evento.date && new Date(evento.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {evento.hora && ` · ${evento.hora} hs`}
            </p>
          </div>
          <Link to={`/eventos/${id}/editar`}>
            <Button variant="outline" size="sm"><Edit size={13} /> Editar</Button>
          </Link>
        </div>
        {/* Stats strip */}
        <div className="flex gap-5 text-xs text-ink-500">
          <span><strong className="text-ink-700">{evento.stats?.total || 0}</strong> invitados</span>
          <span><strong className="text-sage-600">{evento.stats?.confirmed || 0}</strong> confirmados</span>
          <span><strong className="text-gold-600">{evento.stats?.pending || 0}</strong> pendientes</span>
          {(evento.stats?.noResponse || 0) > 0 && (
            <span className="text-rose-600"><strong>{evento.stats.noResponse}</strong> sin resp. +72hs</span>
          )}
          {(evento.stats?.withRestriction || 0) > 0 && (
            <span><strong className="text-ink-700">{evento.stats.withRestriction}</strong> con restricción</span>
          )}
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4 -mb-4">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-all ${
                  tab === t.id
                    ? 'border-rose-500 text-rose-700 font-medium'
                    : 'border-transparent text-ink-400 hover:text-ink-700'
                }`}
              >
                <Icon size={13} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'invitados'   && <Invitados   eventoId={id} evento={evento} />}
        {tab === 'mensajes'    && <MensajesWA   eventoId={id} evento={evento} />}
        {tab === 'presupuesto' && <Presupuesto  eventoId={id} evento={evento} />}
        {tab === 'documentos'  && <Documentos   eventoId={id} evento={evento} />}
      </div>
    </div>
  )
}
