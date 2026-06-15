import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Copy, Check, Users, Shield, Mail, RefreshCw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/db'
import { ROLES, PERMISOS, PERMISOS_DEFAULT } from '../lib/roles'
import { Card, CardHeader, CardBody, Button, Input, Modal, Alert, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const GRUPOS = [...new Set(Object.values(PERMISOS).map(p => p.grupo))]

function PermisoCheck({ id, checked, label, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked ? 'bg-warm-500 border-warm-500' : 'border-nude-300 group-hover:border-warm-400'}`}>
        {checked && <Check size={10} className="text-white" strokeWidth={3}/>}
      </div>
      <span className="text-xs text-ink-600">{label}</span>
    </label>
  )
}

const emptyForm = { nombre:'', email:'', role:'empleada', permisos:[...PERMISOS_DEFAULT.empleada] }

export default function Usuarios() {
  const { user, profile, teamOwner } = useAuth()
  const [members,    setMembers]    = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteEmail,setInviteEmail]= useState('')
  const [copied,     setCopied]     = useState(false)
  const [mailSent,   setMailSent]   = useState(false)

  // Siempre suscribirse al equipo del workspace owner
  useEffect(() => {
    if (!teamOwner) return
    return subscribeToTeam(teamOwner, setMembers)
  }, [teamOwner])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }
  function handleRoleChange(role){ setForm(f=>({...f,role,permisos:[...(PERMISOS_DEFAULT[role]||[])]})) }
  function togglePermiso(id){ setForm(f=>({...f,permisos:f.permisos.includes(id)?f.permisos.filter(p=>p!==id):[...f.permisos,id]})) }

  async function handleSave() {
    if (!form.nombre.trim()||!form.email.trim()){ setError('Nombre y email requeridos'); return }
    setSaving(true); setError('')
    try {
      if (editMember) {
        await updateTeamMember(teamOwner, editMember.id, { nombre:form.nombre, role:form.role, permisos:form.permisos })
        setShowModal(false); setEditMember(null); setForm(emptyForm)
      } else {
        const result = await createTeamMember(teamOwner, { nombre:form.nombre, email:form.email, role:form.role, permisos:form.permisos })
        setInviteCode(result.code); setInviteEmail(form.email)
      }
    } catch(e){ setError(e.message) }
    setSaving(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/invitar/${inviteCode}`
    navigator.clipboard.writeText(`Te invito a Lumina Events:\n${url}\nCódigo: ${inviteCode}`)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  function sendEmail() {
    const url  = `${window.location.origin}/invitar/${inviteCode}`
    const subj = encodeURIComponent('Te invitaron a Lumina Events')
    const body = encodeURIComponent(`Hola ${form.nombre}!\n\nAccedé acá: ${url}\n\nCódigo: ${inviteCode}`)
    window.open(`mailto:${inviteEmail}?subject=${subj}&body=${body}`)
    setMailSent(true)
  }

  function openEdit(m){
    setEditMember(m); setInviteCode(''); setError('')
    setForm({ nombre:m.nombre, email:m.email, role:m.role, permisos:m.permisos||PERMISOS_DEFAULT[m.role]||[] })
    setShowModal(true)
  }

  function openNew(){ setEditMember(null); setForm(emptyForm); setInviteCode(''); setInviteEmail(''); setMailSent(false); setError(''); setShowModal(true) }

  return (
    <div className="fade-in">
      <PageHeader
        title="Usuarios del equipo"
        subtitle={`${members.length} usuario${members.length!==1?'s':''} · workspace: ${profile?.orgName||'Mi equipo'}`}
        actions={<Button onClick={openNew}><Plus size={15}/> Agregar usuario</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Mi cuenta */}
        <Card>
          <CardHeader><Shield size={15} className="text-warm-500"/> Tu cuenta (Admin)</CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-300 to-warm-600 flex items-center justify-center text-white font-medium text-base">
                {profile?.nombre?.[0]?.toUpperCase()||'A'}
              </div>
              <div>
                <p className="font-medium text-ink-800">{profile?.nombre||'Admin'}</p>
                <p className="text-sm text-ink-400">{profile?.email||user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs bg-warm-100 text-warm-700 px-2.5 py-0.5 rounded-full">👑 Admin</span>
                  <span className="text-xs text-ink-400">UID: {teamOwner?.slice(0,8)}...</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Miembros */}
        {members.length === 0 ? (
          <Card>
            <div className="py-14 text-center">
              <Users size={40} className="text-nude-300 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="text-sm text-ink-400 mb-1">Sin usuarios en el equipo todavía</p>
              <p className="text-xs text-ink-300 mb-5">Agregá socias, empleadas o proveedores</p>
              <Button size="sm" onClick={openNew}><Plus size={13}/> Agregar primer usuario</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {members.map(m=>{
              const roleCfg = ROLES[m.role]||ROLES.empleada
              const permisos = m.permisos||PERMISOS_DEFAULT[m.role]||[]
              return (
                <Card key={m.id} className={!m.active?'opacity-60':''}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nude-100 flex items-center justify-center text-ink-500 text-sm font-medium flex-shrink-0">
                        {m.nombre?.[0]?.toUpperCase()||'?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-800">{m.nombre}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleCfg.color}`}>{roleCfg.icon} {roleCfg.label}</span>
                          {!m.active&&<Badge variant="gray">Inactivo</Badge>}
                          {!m.uid&&<Badge variant="amber">Invitación pendiente</Badge>}
                        </div>
                        <p className="text-xs text-ink-400 mt-0.5">{m.email}</p>
                        <p className="text-xs text-ink-300 mt-0.5">{permisos.length} permisos asignados</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button variant="ghost" size="xs" onClick={()=>updateTeamMember(teamOwner,m.id,{active:!m.active})}>{m.active?'⏸':'▶️'}</Button>
                        <Button variant="ghost" size="xs" onClick={()=>openEdit(m)}><Edit2 size={13}/></Button>
                        <Button variant="ghost" size="xs" className="hover:text-red-500"
                          onClick={()=>{ if(confirm(`¿Eliminar a ${m.nombre}?`)) deleteTeamMember(teamOwner,m.id) }}>
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

      <Modal open={showModal} onClose={()=>{setShowModal(false);setEditMember(null);setInviteCode('')}}
        title={editMember?'Editar usuario':'Agregar usuario'} size="lg">
        <div className="space-y-5">
          {error&&<Alert variant="danger">{error}</Alert>}
          {inviteCode ? (
            <div className="space-y-4">
              <div className="p-5 bg-sage-50 border border-sage-200 rounded-xl text-center">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-sage-600"/>
                </div>
                <p className="font-medium text-sage-700">¡Usuario creado!</p>
                <p className="text-sm text-ink-500 mt-1">Enviá el acceso a <strong>{inviteEmail}</strong></p>
              </div>
              <div className="p-4 bg-nude-50 border border-nude-200 rounded-xl text-center">
                <p className="text-xs text-ink-400 mb-2 uppercase tracking-wide font-medium">Código de invitación</p>
                <code className="text-2xl font-mono font-bold text-ink-800 tracking-[0.3em] block bg-white py-3 rounded-lg border border-nude-200">{inviteCode}</code>
                <p className="text-xs text-ink-400 mt-2 break-all">{window.location.origin}/invitar/{inviteCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={sendEmail}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all
                    ${mailSent?'bg-sage-50 border-sage-200 text-sage-700':'bg-warm-50 border-warm-200 text-warm-700 hover:bg-warm-100'}`}>
                  {mailSent?<><Check size={14}/>Mail abierto</>:<><Mail size={14}/>Enviar por email</>}
                </button>
                <button onClick={copyLink}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-nude-300 text-sm font-medium text-ink-600 hover:bg-nude-100 transition-all">
                  {copied?<><Check size={14} className="text-sage-600"/>Copiado</>:<><Copy size={14}/>Copiar link</>}
                </button>
              </div>
              <Button className="w-full justify-center" onClick={()=>{setShowModal(false);setInviteCode('')}}>Listo</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre *" value={form.nombre} onChange={e=>setField('nombre',e.target.value)} placeholder="Ej: Valentina"/>
                {!editMember&&<Input label="Email *" type="email" value={form.email} onChange={e=>setField('email',e.target.value)} placeholder="val@email.com"/>}
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-2">Rol base</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(ROLES).map(([key,cfg])=>(
                    <button key={key} onClick={()=>handleRoleChange(key)}
                      className={`p-2.5 rounded-xl border text-center transition-all
                        ${form.role===key?'border-warm-400 bg-warm-50 ring-1 ring-warm-300':'border-nude-200 hover:border-warm-200'}`}>
                      <div className="text-xl mb-1">{cfg.icon}</div>
                      <div className="text-[10px] font-medium text-ink-600">{cfg.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-ink-500">Permisos personalizados</label>
                  <button onClick={()=>setForm(f=>({...f,permisos:[...(PERMISOS_DEFAULT[f.role]||[])]}))}
                    className="text-xs text-warm-600 hover:underline flex items-center gap-1"><RefreshCw size={10}/> Restablecer</button>
                </div>
                <div className="border border-nude-200 rounded-xl overflow-hidden divide-y divide-nude-100 max-h-56 overflow-y-auto">
                  {GRUPOS.map(grupo=>{
                    const gP=Object.entries(PERMISOS).filter(([,p])=>p.grupo===grupo)
                    return (
                      <div key={grupo} className="px-4 py-3 bg-white">
                        <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-2">{grupo}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {gP.map(([id,p])=>(
                            <PermisoCheck key={id} id={id} label={p.label}
                              checked={form.permisos.includes(id)} onChange={()=>togglePermiso(id)}/>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={()=>{setShowModal(false);setEditMember(null)}}>Cancelar</Button>
                <Button onClick={handleSave} loading={saving}>
                  {editMember?'Guardar cambios':<><Mail size={13}/>Crear y generar invitación</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
