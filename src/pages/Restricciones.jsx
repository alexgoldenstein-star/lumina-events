import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { subscribeToEventos } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, EmptyState } from '../components/ui'
import { UtensilsCrossed, Copy, Check } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'

export default function Restricciones() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState([])
  const [guestsByEvento, setGuestsByEvento] = useState({})
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToEventos(user.uid, evs => {
      setEventos(evs)
      evs.forEach(evento => {
        const r = ref(db, `users/${user.uid}/eventos/${evento.id}/invitados`)
        onValue(r, snap => {
          const data = snap.val() || {}
          setGuestsByEvento(prev => ({ ...prev, [evento.id]: Object.values(data) }))
        })
      })
    })
    return unsub
  }, [user])

  function copyForCatering(eventoId, eventoNombre) {
    const guests = guestsByEvento[eventoId] || []
    const withRestriction = guests.filter(g => g.menu && g.status === 'confirmed')
    if (!withRestriction.length) return

    const text = `Restricciones alimentarias — ${eventoNombre}\n\n` +
      withRestriction.map(g => `• ${g.fullName} (${g.lugares || 1} lugar/es): ${g.menu}`).join('\n') +
      `\n\nTotal confirmados con restricción: ${withRestriction.length}`

    navigator.clipboard.writeText(text)
    setCopied(eventoId)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Restricciones alimentarias"
        subtitle="Resumen por evento para pasarle al catering"
      />
      <div className="p-7 space-y-5">
        {eventos.length === 0 ? (
          <Card><EmptyState icon={UtensilsCrossed} title="No hay eventos" description="Creá un evento y cargá invitados para ver sus restricciones." /></Card>
        ) : (
          eventos.map(evento => {
            const guests = guestsByEvento[evento.id] || []
            const confirmed = guests.filter(g => g.status === 'confirmed')
            const withRestriction = guests.filter(g => g.menu && g.status === 'confirmed')

            // Agrupar por tipo de restricción
            const byType = {}
            withRestriction.forEach(g => {
              const key = g.menu.toLowerCase().trim()
              if (!byType[key]) byType[key] = []
              byType[key].push(g)
            })

            return (
              <Card key={evento.id}>
                <CardHeader action={
                  withRestriction.length > 0 && (
                    <button
                      onClick={() => copyForCatering(evento.id, evento.nombre)}
                      className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      {copied === evento.id ? <Check size={13} /> : <Copy size={13} />}
                      {copied === evento.id ? 'Copiado' : 'Copiar para catering'}
                    </button>
                  )
                }>
                  <UtensilsCrossed size={15} className="text-rose-400" />
                  {evento.nombre}
                </CardHeader>
                <CardBody>
                  {withRestriction.length === 0 ? (
                    <p className="text-sm text-ink-400 text-center py-4">
                      {confirmed.length === 0
                        ? 'Sin confirmados todavía'
                        : '✓ Ningún confirmado tiene restricciones alimentarias'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {/* Resumen por tipo */}
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(byType).map(([tipo, list]) => (
                          <div key={tipo} className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                            <span className="text-sm font-medium text-rose-700 capitalize">{tipo}</span>
                            <Badge variant="pink">{list.length}</Badge>
                          </div>
                        ))}
                      </div>

                      {/* Lista detallada */}
                      <div className="divide-y divide-ink-50">
                        {withRestriction.map(g => (
                          <div key={g.id} className="flex items-center gap-3 py-2.5">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-ink-800">{g.fullName}</span>
                              <span className="text-xs text-ink-400 ml-2">{g.lugares || 1} lugar{g.lugares > 1 ? 'es' : ''}</span>
                            </div>
                            <Badge variant="pink">{g.menu}</Badge>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-ink-400 pt-1 border-t border-ink-50">
                        {withRestriction.length} de {confirmed.length} confirmados tienen restricciones
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
