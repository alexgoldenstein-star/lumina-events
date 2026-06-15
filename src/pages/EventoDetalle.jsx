import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, MessageCircle, Receipt, FileText,
  Edit, CheckSquare, LayoutGrid, BarChart2 } from 'lucide-react'
import { get, ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { Button, Spinner } from '../components/ui'
import Invitados       from './Invitados'
import MensajesWA      from './MensajesWA'
import Presupuesto     from './Presupuesto'
import Documentos      from './Documentos'
import Checklist       from './Checklist'
import LayoutMesas     from './LayoutMesas'
import GastosDashboard from './GastosDashboard'

const TABS = [
  { id:'invitados',   label:'Invitados',   icon:Users          },
  { id:'checklist',   label:'Checklist',   icon:CheckSquare    },
  { id:'mensajes',    label:'Mensajes WA', icon:MessageCircle  },
  { id:'gastos',      label:'Gastos',      icon:BarChart2      },
  { id:'presupuesto', label:'Presupuesto', icon:Receipt        },
  { id:'mesas',       label:'Mesas',       icon:LayoutGrid     },
  { id:'documentos',  label:'Documentos',  icon:FileText       },
]

export default function EventoDetalle() {
  const { id }       = useParams()
  const { user, teamOwner } = useAuth()
  const navigate     = useNavigate()
  const [evento,     setEvento]  = useState(null)
  const [loading,    setLoading] = useState(true)
  const [tab,        setTab]     = useState('invitados')
  const [notFound,   setNotFound]= useState(false)

  useEffect(() => {
    if (!user || !id) return

    // Buscar el evento primero en los propios, luego en el teamOwner
    async function loadEvento() {
      setLoading(true)

      // 1. Intentar en el UID propio del usuario
      const ownRef = ref(db, `users/${user.uid}/eventos/${id}`)
      const ownSnap = await get(ownRef)
      if (ownSnap.exists()) {
        setEvento(ownSnap.val())

        // Suscribirse a updates en tiempo real
        onValue(ownRef, snap => { if (snap.exists()) setEvento(snap.val()) })
        setLoading(false)
        return () => off(ownRef)
      }

      // 2. Intentar en el workspace owner (teamOwner)
      if (teamOwner && teamOwner !== user.uid) {
        const teamRef = ref(db, `users/${teamOwner}/eventos/${id}`)
        const teamSnap = await get(teamRef)
        if (teamSnap.exists()) {
          setEvento(teamSnap.val())
          onValue(teamRef, snap => { if (snap.exists()) setEvento(snap.val()) })
          setLoading(false)
          return () => off(teamRef)
        }
      }

      // 3. No encontrado
      setNotFound(true)
      setLoading(false)
    }

    loadEvento()
  }, [user?.uid, id, teamOwner])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg"/>
    </div>
  )

  if (notFound) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-4xl">🔍</div>
      <p className="text-ink-500 text-sm">Evento no encontrado</p>
      <Link to="/eventos">
        <Button variant="outline" size="sm">← Volver a eventos</Button>
      </Link>
    </div>
  )

  if (!evento) return null

  // Determinar el ownerUid del evento para las operaciones
  const eventoOwnerUid = evento._ownerUid || teamOwner || user.uid

  return (
    <div className="fade-in">
      <div className="bg-white border-b border-nude-200 px-4 md:px-7 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/eventos" className="text-ink-400 hover:text-ink-700 transition-colors flex-shrink-0">
            <ArrowLeft size={18}/>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-serif text-ink-800 truncate">{evento.nombre}</h1>
            <p className="text-xs md:text-sm text-ink-400 truncate">
              {evento.lugar && `${evento.lugar} · `}
              {evento.date && new Date(evento.date+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}
              {evento.hora && ` · ${evento.hora} hs`}
            </p>
          </div>
          <Link to={`/eventos/${id}/editar`} className="flex-shrink-0">
            <Button variant="outline" size="sm"><Edit size={13}/> Editar</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-3 md:gap-5 text-xs text-ink-500 mb-3 flex-wrap">
          <span><strong className="text-ink-700">{evento.stats?.total||0}</strong> inv.</span>
          <span><strong className="text-sage-600">{evento.stats?.confirmed||0}</strong> confirm.</span>
          <span><strong className="text-gold-600">{evento.stats?.pending||0}</strong> pend.</span>
          {(evento.stats?.noResponse||0)>0&&(
            <span className="text-warm-600"><strong>{evento.stats.noResponse}</strong> sin resp.</span>
          )}
        </div>

        {/* Tabs — scroll horizontal en móvil */}
        <div className="flex gap-0.5 -mb-4 overflow-x-auto pb-px">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  tab===t.id ? 'border-warm-500 text-warm-700 font-medium' : 'border-transparent text-ink-400 hover:text-ink-700'
                }`}>
                <Icon size={12}/>{t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {tab==='invitados'   && <Invitados     eventoId={id} eventoOwnerUid={eventoOwnerUid} evento={evento}/>}
        {tab==='checklist'   && <Checklist     eventoId={id} eventoOwnerUid={eventoOwnerUid}/>}
        {tab==='mensajes'    && <MensajesWA    eventoId={id} eventoOwnerUid={eventoOwnerUid} evento={evento}/>}
        {tab==='gastos'      && <GastosDashboard eventoId={id} eventoOwnerUid={eventoOwnerUid}/>}
        {tab==='presupuesto' && <Presupuesto   eventoId={id} eventoOwnerUid={eventoOwnerUid} evento={evento}/>}
        {tab==='mesas'       && <LayoutMesas   eventoId={id} eventoOwnerUid={eventoOwnerUid}/>}
        {tab==='documentos'  && <Documentos    eventoId={id} eventoOwnerUid={eventoOwnerUid} evento={evento}/>}
      </div>
    </div>
  )
}
