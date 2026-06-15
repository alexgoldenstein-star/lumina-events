import { useEffect, useState } from 'react'
import { Users, Share2, X, Check, UserPlus, Eye, Edit } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToTeam } from '../lib/db'
import { shareEventoWith, unshareEventoWith, subscribeToEventAccess } from '../lib/db'
import { Modal, Button, Badge } from '../components/ui'

const ACCESS_ROLES = [
  { value: 'viewer', label: 'Solo ver',    desc: 'Puede ver el evento pero no editar', icon: Eye  },
  { value: 'editor', label: 'Puede editar',desc: 'Puede editar invitados y checklist', icon: Edit },
  { value: 'full',   label: 'Acceso total',desc: 'Mismo acceso que la dueña del evento', icon: Users },
]

export default function CompartirEvento({ eventoId, eventoNombre, open, onClose }) {
  const { user, ownerUid } = useAuth()
  const [members,   setMembers]   = useState([])
  const [access,    setAccess]    = useState({})
  const [saving,    setSaving]    = useState({})

  const adminUid = ownerUid || user?.uid

  useEffect(() => {
    if (!adminUid || !open) return
    const u1 = subscribeToTeam(adminUid, setMembers)
    const u2 = subscribeToEventAccess(adminUid, eventoId, setAccess)
    return () => { u1(); u2() }
  }, [adminUid, eventoId, open])

  async function toggleShare(member, role) {
    setSaving(s => ({ ...s, [member.uid || member.id]: true }))
    const uid = member.uid || member.id
    if (access[uid]) {
      // Already shared — unshare
      await unshareEventoWith(adminUid, eventoId, uid)
    } else {
      // Share with selected role
      await shareEventoWith(adminUid, eventoId, uid, role)
    }
    setSaving(s => ({ ...s, [uid]: false }))
  }

  async function changeRole(memberUid, role) {
    setSaving(s => ({ ...s, [memberUid]: true }))
    await shareEventoWith(adminUid, eventoId, memberUid, role)
    setSaving(s => ({ ...s, [memberUid]: false }))
  }

  return (
    <Modal open={open} onClose={onClose} title={`Compartir — ${eventoNombre}`} size="md">
      <div className="space-y-4">
        <p className="text-sm text-ink-500">
          Elegí con quién compartir este evento y qué nivel de acceso tienen.
        </p>

        {members.length === 0 ? (
          <div className="py-8 text-center">
            <Users size={32} className="text-nude-300 mx-auto mb-3" strokeWidth={1.5}/>
            <p className="text-sm text-ink-400">No tenés usuarios en tu equipo todavía</p>
            <a href="/usuarios" className="text-sm text-warm-600 hover:underline mt-1 block">
              Agregar usuarios →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-nude-100 border border-nude-200 rounded-xl overflow-hidden">
            {members.map(member => {
              const uid        = member.uid || member.id
              const isShared   = !!access[uid]
              const sharedRole = access[uid]?.role || 'viewer'
              const isSaving   = saving[uid]

              return (
                <div key={member.id} className={`p-4 transition-colors ${isShared ? 'bg-warm-50' : 'bg-white hover:bg-nude-50'}`}>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-nude-200 flex items-center justify-center text-ink-600 text-sm font-medium flex-shrink-0">
                      {member.nombre?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800">{member.nombre}</p>
                      <p className="text-xs text-ink-400">{member.email}</p>
                      {!member.uid && (
                        <p className="text-[10px] text-gold-600 mt-0.5">⚠ Aún no aceptó la invitación</p>
                      )}
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isShared && (
                        <select
                          value={sharedRole}
                          onChange={e => changeRole(uid, e.target.value)}
                          className="text-xs border border-warm-200 bg-warm-50 text-warm-700 rounded-lg px-2 py-1 outline-none"
                        >
                          {ACCESS_ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => toggleShare(member, 'viewer')}
                        disabled={isSaving || !member.uid}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          isShared
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-warm-500 text-white border-warm-500 hover:bg-warm-600'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {isSaving ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                        ) : isShared ? (
                          <><X size={12}/> Quitar acceso</>
                        ) : (
                          <><UserPlus size={12}/> Dar acceso</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Role description when shared */}
                  {isShared && (
                    <div className="mt-2 ml-12">
                      <p className="text-[11px] text-warm-600">
                        {ACCESS_ROLES.find(r => r.value === sharedRole)?.desc}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {Object.keys(access).length > 0 && (
          <div className="flex items-center gap-2 text-xs text-ink-500 bg-nude-50 rounded-lg px-3 py-2">
            <Check size={13} className="text-sage-600"/>
            Compartido con <strong>{Object.keys(access).length}</strong> persona{Object.keys(access).length !== 1 ? 's' : ''}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Listo</Button>
        </div>
      </div>
    </Modal>
  )
}
