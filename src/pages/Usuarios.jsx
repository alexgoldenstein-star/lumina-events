import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Copy, Check, Users, Shield,
  Mail, RefreshCw, X } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/db'
import { ROLES, PERMISOS, PERMISOS_DEFAULT } from '../lib/roles'
import { Card, CardHeader, CardBody, Button, Input, Modal, Alert, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const GRUPOS = [...new Set(Object.values(PERMISOS).map(p => p.grupo))]

function PermisoCheckbox({ id, checked, label, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked ? 'bg-warm-500 border-warm-500' : 'border-nude-300 group-hover:border-warm-400'}`}
      >
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
        </svg>}
      </div>
      <span className="text-xs text-ink-600">{label}</span>
    </label>
  )
}

const emptyForm = { nombre:'', email:'', role:'empleada', permisos:[...PERMISOS_DEFAULT.empleada] }

export default function Usuarios() {
  const { user, profile } = useAuth()
  const [members,     setMembers]    = useState([])
  const [showModal,   setShowModal]  = useState(false)
  const [editMember,  setEditMember] = useState(null)
  const [form,        setForm]       = useState(emptyForm)
  const [saving,      setSaving]     = useState(false)
  const [error,       setError]      = useState('')
  const [inviteCode,  setInviteCode] = useState('')
  const [inviteEmail, setInviteEmail]= useState('')
  const [copied,      setCopied]     = useState(false)
  const [mailSent,    setMailSent]   = useState(false)

  // El admin siempre usa su propio UID como "dueño" del equipo
  // Si es un usuario secundario, usa el ownerUid del profile
  const adminUid = profile?.role === 'admin' ? user?.uid : (profile?.ownerUid || user?.uid)

  useEffect(() => {
    if (!adminUid) return
    return subscribeToTeam(adminUid, setMembers)
  }, [adminUid])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  function handleRoleChange(role) {
    setForm(f => ({ ...f, role, permisos:[...(PERMISOS_DEFAULT[role]||[])] }))
  }

  function togglePermiso(id) {
    setForm(f => ({
      ...f,
      permisos: f.permisos.includes(id)
        ? f.permisos.filter(p => p !== id)
        : [...f.permisos, id]
    }))
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.email.trim()) { setError('Nombre y email son requeridos'); return }
    setSaving(true); setError('')
    try {
      if (editMember) {
        await updateTeamMember(adminUid, editMember.id, {
          nombre: form.nombre, role: form.role, permisos: form.permisos
        })
        setShowModal(false); setEditMember(null); setForm(emptyForm)
      } else {
        const result = await createTeamMember(adminUid, {
          nombre: form.nombre, email: form.email,
          role: form.role, permisos: form.permisos,
        })
        setInviteCode(result.code)
        setInviteEmail(form.email)
      }
    } catch(e) { setError(e.message) }
    setSaving(false)
  }

  function copyInviteLink() {
    const url  = `${window.location.origin}/invitar/${inviteCode}`
    const text = `Hola! Te invito a usar Lumina Events.\n\nAccedé desde acá: ${url}\n\nCódigo: ${inviteCode}`
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  function sendByEmail() {
    const url  = `${window.location.origin}/invitar/${inviteCode}`
    const subj = encodeURIComponent('Te invitaron a Lumina Events')
    const body = encodeURIComponent(`Hola ${form.nombre}!\n\nTe invito a acceder a Lumina Events.\n\nHacé clic acá: ${url}\n\nCódigo: ${inviteCode}`)
    window.open(`mailto:${inviteEmail}?subject=${subj}&body=${body}`)
    setMailSent(true)
  }

  function openEdit(member) {
    setEditMember(member)
    setForm({ nombre:member.nombre, email:member.email, role:member.role,
      permisos: member.permisos || PERMISOS_DEFAULT[member.role] || [] })
    setInviteCode(''); setError(''); setShowModal(true)
  }

  function openNew() {
    setEditMember(null); setForm(emptyForm)
    setInviteCode(''); setInviteEmail(''); setMailSent(false); setError('')
    setShowModal(true)
  }

  async function handleDelete(member) {
    if (!confirm(`¿Eliminar el acceso de ${member.nombre}?`)) return
    await deleteTeamMember(adminUid, member.id)
  }

  async function toggleActive(member) {
    await updateTeamMember(adminUid, member.id, { active: !member.active })
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Usuarios del equipo"
        subtitle={`${members.length} usuario${members.length !== 1 ? 's' : ''} en el equipo`}
        actions={<Button onClick={openNew}><Plus size={15}/> Agregar usuario</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Mi perfil */}
        <Card>
          <CardHeader><Shield size={15} className="text-warm-500"/> Tu cuenta</CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-300 to-warm-600 flex items-center justify-center text-white text-base font-medium">
                {profile?.nombre?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-medium text-ink-800">{profile?.nombre || 'Admin'}</p>
                <p className="text-sm text-ink-400">{profile?.email || user?.email}</p>
                <span className="inline-flex items-center gap-1 text-xs bg-warm-100 text-warm-700 px-2.5 py-0.5 rounded-full mt-1.5">
                  👑 Admin — acceso completo
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista */}
        {members.length === 0 ? (
          <Card>
            <div className="py-14 text-center">
              <Users size={40} className="text-nude-300 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="text-sm text-ink-400 mb-1">Sin usuarios agregados todavía</p>
              <p className="text-xs text-ink-300 mb-5">Agregá tu socia, empleadas o proveedores</p>
              <Button size="sm" onClick={openNew}><Plus size={13}/> Agregar primer usuario</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {members.map(member => {
              const roleCfg  = ROLES[member.role] || ROLES.empleada
              const permisos = member.permisos || PERMISOS_DEFAULT[member.role] || []
              return (
                <Card key={member.id} className={!member.active ? 'opacity-60' : ''}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nude-100 flex items-center justify-center text-ink-500 text-sm font-medium flex-shrink-0">
                        {member.nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-800">{member.nombre}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleCfg.color}`}>
                            {roleCfg.icon} {roleCfg.label}
                          </span>
                          {!member.active && <Badge variant="gray">Inactivo</Badge>}
                          {!member.uid && <Badge variant="amber">Invitación pendiente</Badge>}
                        </div>
                        <p className="text-xs text-ink-400 mt-0.5">{member.email}</p>
                        <p className="text-xs text-ink-300 mt-0.5">{permisos.length} permiso{permisos.length !== 1 ? 's' : ''} asignados</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button variant="ghost" size="xs" onClick={()=>toggleActive(member)} title={member.active?'Desactivar':'Activar'}>
                          {member.active ? '⏸' : '▶️'}
                        </Button>
                        <Button variant="ghost" size="xs" onClick={()=>openEdit(member)}><Edit2 size={13}/></Button>
                        <Button variant="ghost" size="xs" className="hover:text-red-500" onClick={()=>handleDelete(member)}>
                          <Trash2 size={13}/>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={()=>{ setShowModal(false); setEditMember(null); setInviteCode('') }}
        title={editMember ? 'Editar usuario' : 'Agregar usuario'} size="lg">
        <div className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          {inviteCode ? (
            // Paso 2: código generado
            <div className="space-y-4">
              <div className="p-5 bg-sage-50 border border-sage-200 rounded-xl text-center">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-sage-600"/>
                </div>
                <p className="text-base font-medium text-sage-700">¡Usuario creado!</p>
                <p className="text-sm text-ink-500 mt-1">Enviá el acceso a <strong>{inviteEmail}</strong></p>
              </div>
              <div className="p-4 bg-nude-50 border border-nude-200 rounded-xl">
                <p className="text-xs text-ink-400 mb-2 font-medium uppercase tracking-wide">Código de invitación</p>
                <code className="block text-center text-2xl font-mono font-bold text-ink-800 tracking-[0.3em] bg-white py-3 rounded-lg border border-nude-200">
                  {inviteCode}
                </code>
                <p className="text-xs text-ink-400 mt-2 text-center break-all">
                  {window.location.origin}/invitar/{inviteCode}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={sendByEmail}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all
                    ${mailSent?'bg-sage-50 border-sage-200 text-sage-700':'bg-warm-50 border-warm-200 text-warm-700 hover:bg-warm-100'}`}>
                  {mailSent ? <><Check size={14}/> Mail abierto</> : <><Mail size={14}/> Enviar por email</>}
                </button>
                <button onClick={copyInviteLink}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-nude-300 text-sm font-medium text-ink-600 hover:bg-nude-100 transition-all">
                  {copied ? <><Check size={14} className="text-sage-600"/> Copiado</> : <><Copy size={14}/> Copiar link</>}
                </button>
              </div>
              <Button className="w-full justify-center" onClick={()=>{ setShowModal(false); setInviteCode('') }}>
                Listo
              </Button>
            </div>
          ) : (
            // Paso 1: formulario
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre *" value={form.nombre} onChange={e=>setField('nombre',e.target.value)} placeholder="Ej: Valentina"/>
                {!editMember && <Input label="Email *" type="email" value={form.email} onChange={e=>setField('email',e.target.value)} placeholder="val@email.com"/>}
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-500 mb-2">Rol base</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(ROLES).map(([key,cfg])=>(
                    <button key={key} onClick={()=>handleRoleChange(key)}
                      className={`p-2.5 rounded-xl border text-center transition-all
                        ${form.role===key?'border-warm-400 bg-warm-50 ring-1 ring-warm-300':'border-nude-200 hover:border-warm-200 hover:bg-warm-50'}`}>
                      <div className="text-xl mb-1">{cfg.icon}</div>
                      <div className="text-[10px] font-medium text-ink-600 leading-tight">{cfg.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-400 mt-2">
                  {form.role==='mensajera' && '💬 Solo puede ver invitados y enviar mensajes WA'}
                  {form.role==='empleada'  && '👩‍💼 Acceso a eventos e invitados, sin finanzas'}
                  {form.role==='socia'     && '🤝 Acceso casi completo, sin gestión de usuarios'}
                  {form.role==='proveedor' && '🏢 Solo ve presupuestos de sus eventos asignados'}
                  {form.role==='admin'     && '👑 Acceso completo a toda la plataforma'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-ink-500">Permisos personalizados</label>
                  <button onClick={()=>setForm(f=>({...f,permisos:[...(PERMISOS_DEFAULT[f.role]||[])]}))}
                    className="text-xs text-warm-600 hover:underline flex items-center gap-1">
                    <RefreshCw size={10}/> Restablecer
                  </button>
                </div>
                <div className="border border-nude-200 rounded-xl overflow-hidden divide-y divide-nude-100 max-h-56 overflow-y-auto">
                  {GRUPOS.map(grupo=>{
                    const gPermisos=Object.entries(PERMISOS).filter(([,p])=>p.grupo===grupo)
                    return (
                      <div key={grupo} className="px-4 py-3 bg-white">
                        <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-2">{grupo}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {gPermisos.map(([id,p])=>(
                            <PermisoCheckbox key={id} id={id} label={p.label}
                              checked={form.permisos.includes(id)}
                              onChange={()=>togglePermiso(id)}/>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={()=>{ setShowModal(false); setEditMember(null) }}>Cancelar</Button>
                <Button onClick={handleSave} loading={saving}>
                  {editMember ? 'Guardar cambios' : <><Mail size={13}/> Crear y generar invitación</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
