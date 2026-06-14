import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Copy, Check, Users, Shield, Mail, RefreshCw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/db'
import { ROLES, PERMISOS, PERMISOS_DEFAULT } from '../lib/roles'
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, Alert, Badge } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const GRUPOS = [...new Set(Object.values(PERMISOS).map(p => p.grupo))]

function PermisoCheckbox({ id, label, checked, onChange, disabled }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked ? 'bg-rose-500 border-rose-500' : 'border-ink-300 group-hover:border-rose-400'}`}
      >
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
        </svg>}
      </div>
      <span className="text-xs text-ink-600">{label}</span>
    </label>
  )
}

const emptyForm = { nombre: '', email: '', role: 'empleada', permisos: PERMISOS_DEFAULT.empleada }

export default function Usuarios() {
  const { user, profile, ownerUid } = useAuth()
  const [members,    setMembers]    = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied,     setCopied]     = useState(false)

  const adminUid = ownerUid || user?.uid

  useEffect(() => {
    if (!adminUid) return
    return subscribeToTeam(adminUid, setMembers)
  }, [adminUid])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleRoleChange(role) {
    setForm(f => ({ ...f, role, permisos: [...(PERMISOS_DEFAULT[role] || [])] }))
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
        await updateTeamMember(adminUid, editMember.id, { nombre: form.nombre, role: form.role, permisos: form.permisos })
        setShowModal(false); setEditMember(null); setForm(emptyForm)
      } else {
        const result = await createTeamMember(adminUid, {
          nombre:   form.nombre,
          email:    form.email,
          role:     form.role,
          permisos: form.permisos,
        })
        setInviteCode(result.code)
      }
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  function openEdit(member) {
    setEditMember(member)
    setForm({ nombre: member.nombre, email: member.email, role: member.role, permisos: member.permisos || PERMISOS_DEFAULT[member.role] || [] })
    setInviteCode('')
    setShowModal(true)
  }

  function openNew() {
    setEditMember(null); setForm(emptyForm); setInviteCode(''); setError('')
    setShowModal(true)
  }

  function copyInvite() {
    const url = `${window.location.origin}/invitar/${inviteCode}`
    navigator.clipboard.writeText(`Te invito a usar Lumina Events.\n\nHacé clic acá para acceder:\n${url}\n\nCódigo: ${inviteCode}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
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
        subtitle="Administrá quién puede acceder y qué puede ver"
        actions={<Button onClick={openNew}><Plus size={15}/> Agregar usuario</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Mi perfil */}
        <Card>
          <CardHeader><Shield size={15} className="text-rose-400"/> Tu cuenta (Admin)</CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-white text-base font-medium">
                {profile?.nombre?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-medium text-ink-800">{profile?.nombre || 'Admin'}</p>
                <p className="text-sm text-ink-400">{profile?.email || user?.email}</p>
                <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full mt-1">
                  👑 Admin — acceso completo
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de miembros */}
        {members.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Users size={36} className="text-ink-200 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="text-sm text-ink-400">Sin usuarios agregados todavía</p>
              <p className="text-xs text-ink-300 mt-1 mb-4">Agregá tu socia, empleadas, proveedores y más</p>
              <Button size="sm" onClick={openNew}><Plus size={13}/> Agregar primer usuario</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {members.map(member => {
              const roleCfg = ROLES[member.role] || ROLES.empleada
              const permisos = member.permisos || PERMISOS_DEFAULT[member.role] || []
              return (
                <Card key={member.id} className={!member.active ? 'opacity-60' : ''}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-500 text-sm font-medium flex-shrink-0">
                        {member.nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-800">{member.nombre}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleCfg.color}`}>
                            {roleCfg.icon} {roleCfg.label}
                          </span>
                          {!member.active && <Badge variant="gray">Inactivo</Badge>}
                        </div>
                        <p className="text-xs text-ink-400 mt-0.5">{member.email}</p>
                        <p className="text-xs text-ink-300 mt-1">{permisos.length} permiso{permisos.length !== 1 ? 's' : ''} asignados</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="xs" onClick={() => toggleActive(member)} title={member.active ? 'Desactivar' : 'Activar'}>
                          {member.active ? '⏸' : '▶️'}
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => openEdit(member)}><Edit2 size={13}/></Button>
                        <Button variant="ghost" size="xs" className="hover:text-red-500" onClick={() => handleDelete(member)}><Trash2 size={13}/></Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditMember(null); setInviteCode('') }}
        title={editMember ? 'Editar usuario' : 'Agregar usuario'} size="lg">
        <div className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Si ya tiene código de invitación */}
          {inviteCode ? (
            <div className="space-y-4">
              <div className="p-4 bg-sage-50 border border-sage-200 rounded-xl text-center">
                <Check size={28} className="text-sage-600 mx-auto mb-2"/>
                <p className="text-base font-medium text-sage-700">Usuario creado correctamente</p>
                <p className="text-sm text-ink-500 mt-1">Compartile este código o link para que pueda acceder</p>
              </div>
              <div className="p-4 bg-ink-50 rounded-xl">
                <p className="text-xs text-ink-400 mb-2 font-medium uppercase tracking-wide">Código de invitación</p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold text-ink-800 tracking-widest flex-1 text-center">{inviteCode}</code>
                  <Button variant="outline" size="sm" onClick={copyInvite}>
                    {copied ? <Check size={13}/> : <Copy size={13}/>}
                    {copied ? 'Copiado' : 'Copiar link'}
                  </Button>
                </div>
                <p className="text-xs text-ink-400 mt-2 text-center">
                  Link: <span className="text-rose-500">{window.location.origin}/invitar/{inviteCode}</span>
                </p>
              </div>
              <p className="text-xs text-ink-400 text-center">
                El usuario deberá abrir el link y crear su contraseña para acceder.
              </p>
              <Button className="w-full" onClick={() => { setShowModal(false); setInviteCode('') }}>
                Listo
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre *" value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Valentina García"/>
                {!editMember && <Input label="Email *" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="valeria@email.com"/>}
              </div>

              {/* Selector de rol */}
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-2">Rol base</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(ROLES).map(([key, cfg]) => (
                    <button key={key} onClick={() => handleRoleChange(key)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        form.role === key
                          ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300'
                          : 'border-ink-200 hover:border-rose-200 hover:bg-rose-50'
                      }`}>
                      <div className="text-lg mb-1">{cfg.icon}</div>
                      <div className="text-[10px] font-medium text-ink-600">{cfg.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permisos granulares */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-ink-500">Permisos personalizados</label>
                  <button onClick={() => setForm(f => ({ ...f, permisos: [...PERMISOS_DEFAULT[f.role] || []] }))}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                    <RefreshCw size={10}/> Restablecer rol
                  </button>
                </div>
                <div className="border border-ink-100 rounded-xl overflow-hidden divide-y divide-ink-50">
                  {GRUPOS.map(grupo => {
                    const grupoPermisos = Object.entries(PERMISOS).filter(([,p]) => p.grupo === grupo)
                    return (
                      <div key={grupo} className="px-4 py-3">
                        <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wide mb-2">{grupo}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {grupoPermisos.map(([id, p]) => (
                            <PermisoCheckbox
                              key={id} id={id} label={p.label}
                              checked={form.permisos.includes(id)}
                              onChange={() => togglePermiso(id)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowModal(false); setEditMember(null) }}>Cancelar</Button>
                <Button onClick={handleSave} loading={saving}>
                  {editMember ? 'Guardar cambios' : 'Crear y generar código'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
