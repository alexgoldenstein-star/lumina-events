import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Check, Users, Shield, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { ref, set, get, update, remove, onValue, off } from 'firebase/database'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
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

const emptyForm = {
  nombre: '', email: '', password: '', role: 'empleada',
  permisos: [...PERMISOS_DEFAULT.empleada]
}

export default function Usuarios() {
  const { user, profile, teamOwner } = useAuth()
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editModal,  setEditModal]  = useState(null)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [success,    setSuccess]    = useState('')

  const adminUid = teamOwner || user?.uid

  // Cargar miembros del equipo
  useEffect(() => {
    if (!adminUid) return
    const r = ref(db, `teams/${adminUid}/members`)
    const unsub = onValue(r, snap => {
      const data = snap.val() || {}
      setMembers(Object.values(data))
      setLoading(false)
    })
    return () => off(r)
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

  async function handleCreate() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    if (!form.email.trim())  { setError('El email es requerido'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setSaving(true); setError('')
    try {
      // 1. Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.nombre })

      // 2. Guardar perfil del usuario
      const profileData = {
        nombre:         form.nombre,
        email:          form.email,
        role:           form.role,
        ownerUid:       adminUid,
        permisos:       form.permisos,
        hideComisiones: false,
        createdAt:      new Date().toISOString(),
      }
      await set(ref(db, `users/${cred.user.uid}/profile`), profileData)

      // 3. Agregar al equipo del admin
      const memberData = {
        id:        cred.user.uid,
        uid:       cred.user.uid,
        nombre:    form.nombre,
        email:     form.email,
        role:      form.role,
        permisos:  form.permisos,
        active:    true,
        createdAt: new Date().toISOString(),
      }
      await set(ref(db, `teams/${adminUid}/members/${cred.user.uid}`), memberData)

      setSuccess(`✓ Usuario ${form.nombre} creado. Ya puede ingresar con ${form.email}`)
      setForm(emptyForm)
      setShowModal(false)
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        // El email ya existe — solo agregar al equipo
        setError('Ese email ya tiene cuenta. Si querés agregarlo al equipo de todas formas, contactá a soporte.')
      } else {
        setError(e.message)
      }
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!editModal) return
    setSaving(true); setError('')
    try {
      const updates = {
        nombre:   form.nombre,
        role:     form.role,
        permisos: form.permisos,
        updatedAt: new Date().toISOString(),
      }
      // Actualizar en el equipo
      await update(ref(db, `teams/${adminUid}/members/${editModal.uid}`), updates)
      // Actualizar perfil del usuario
      await update(ref(db, `users/${editModal.uid}/profile`), updates)
      setEditModal(null); setForm(emptyForm)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  async function handleDelete(member) {
    if (!confirm(`¿Desactivar el acceso de ${member.nombre}?`)) return
    await update(ref(db, `teams/${adminUid}/members/${member.uid}`), { active: false })
    await update(ref(db, `users/${member.uid}/profile`), { active: false })
  }

  async function handleActivate(member) {
    await update(ref(db, `teams/${adminUid}/members/${member.uid}`), { active: true })
    await update(ref(db, `users/${member.uid}/profile`), { active: true })
  }

  function openEdit(m) {
    setEditModal(m)
    setForm({ nombre: m.nombre, email: m.email, password: '', role: m.role,
      permisos: m.permisos || PERMISOS_DEFAULT[m.role] || [] })
    setError('')
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Usuarios del equipo"
        subtitle={`${members.filter(m=>m.active!==false).length} activo${members.filter(m=>m.active!==false).length!==1?'s':''}`}
        actions={<Button onClick={() => { setShowModal(true); setForm(emptyForm); setError('') }}>
          <Plus size={15}/> Agregar usuario
        </Button>}
      />

      <div className="p-7 space-y-5">
        {success && (
          <Alert variant="success">
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto opacity-60 hover:opacity-100">✕</button>
          </Alert>
        )}

        {/* Mi cuenta */}
        <Card>
          <CardHeader><Shield size={15} className="text-warm-500"/> Tu cuenta (Admin)</CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-300 to-warm-600 flex items-center justify-center text-white font-medium text-base">
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
        {loading ? (
          <div className="grid gap-3">
            {[1,2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-nude-200"/>)}
          </div>
        ) : members.length === 0 ? (
          <Card>
            <div className="py-14 text-center">
              <Users size={40} className="text-nude-300 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="text-sm text-ink-400 mb-5">Sin usuarios en el equipo todavía</p>
              <Button size="sm" onClick={() => setShowModal(true)}><Plus size={13}/> Agregar primero</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {members.map(m => {
              const roleCfg  = ROLES[m.role] || ROLES.empleada
              const isActive = m.active !== false
              return (
                <Card key={m.uid || m.id} className={!isActive ? 'opacity-50' : ''}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-nude-100 flex items-center justify-center text-ink-600 text-sm font-medium flex-shrink-0">
                        {m.nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-800">{m.nombre}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleCfg.color}`}>
                            {roleCfg.icon} {roleCfg.label}
                          </span>
                          {!isActive && <Badge variant="gray">Inactivo</Badge>}
                        </div>
                        <p className="text-xs text-ink-400 mt-0.5">{m.email}</p>
                        <p className="text-xs text-ink-300 mt-0.5">
                          {(m.permisos || PERMISOS_DEFAULT[m.role] || []).length} permisos
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {isActive
                          ? <Button variant="ghost" size="xs" onClick={() => handleDelete(m)} title="Desactivar">⏸</Button>
                          : <Button variant="ghost" size="xs" onClick={() => handleActivate(m)} title="Activar">▶️</Button>
                        }
                        <Button variant="ghost" size="xs" onClick={() => openEdit(m)}><Edit2 size={13}/></Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal CREAR usuario */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setError('') }}
        title="Crear usuario del equipo" size="lg">
        <div className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="p-3 bg-warm-50 border border-warm-100 rounded-xl text-xs text-warm-700">
            El usuario se crea directo con email y contraseña. Ya puede ingresar sin pasos extras.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre *" value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Valentina"/>
            <Input label="Email *" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="val@email.com"/>
          </div>

          <div className="relative">
            <Input
              label="Contraseña *"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
            <button onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-7 text-ink-400 hover:text-ink-600">
              {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
            <p className="text-xs text-ink-400 mt-1">
              Pasale la contraseña por WhatsApp. Puede cambiarla después desde su perfil.
            </p>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Rol</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ROLES).map(([key, cfg]) => (
                <button key={key} onClick={() => handleRoleChange(key)}
                  className={`p-2.5 rounded-xl border text-center transition-all
                    ${form.role === key ? 'border-warm-400 bg-warm-50 ring-1 ring-warm-300' : 'border-nude-200 hover:border-warm-200'}`}>
                  <div className="text-lg mb-1">{cfg.icon}</div>
                  <div className="text-[10px] font-medium text-ink-600">{cfg.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-2">
              {form.role === 'mensajera' && '💬 Solo ve invitados y puede enviar mensajes WA'}
              {form.role === 'empleada'  && '👩‍💼 Eventos e invitados, sin ver finanzas'}
              {form.role === 'socia'     && '🤝 Acceso casi completo'}
              {form.role === 'proveedor' && '🏢 Solo ve presupuestos'}
              {form.role === 'admin'     && '👑 Acceso total'}
            </p>
          </div>

          {/* Permisos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink-500">Permisos</label>
              <button onClick={() => setForm(f => ({ ...f, permisos: [...(PERMISOS_DEFAULT[f.role] || [])] }))}
                className="text-xs text-warm-600 hover:underline flex items-center gap-1">
                <RefreshCw size={10}/> Restablecer
              </button>
            </div>
            <div className="border border-nude-200 rounded-xl divide-y divide-nude-100 max-h-52 overflow-y-auto">
              {GRUPOS.map(grupo => {
                const gP = Object.entries(PERMISOS).filter(([,p]) => p.grupo === grupo)
                return (
                  <div key={grupo} className="px-4 py-3 bg-white">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-2">{grupo}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {gP.map(([id, p]) => (
                        <PermisoCheck key={id} id={id} label={p.label}
                          checked={form.permisos.includes(id)}
                          onChange={() => togglePermiso(id)}/>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={saving}>
              <Plus size={13}/> Crear usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal EDITAR usuario */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); setError('') }}
        title="Editar usuario" size="lg">
        <div className="space-y-5">
          {error && <Alert variant="danger">{error}</Alert>}

          <Input label="Nombre" value={form.nombre} onChange={e => setField('nombre', e.target.value)}/>

          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Rol</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ROLES).map(([key, cfg]) => (
                <button key={key} onClick={() => handleRoleChange(key)}
                  className={`p-2.5 rounded-xl border text-center transition-all
                    ${form.role === key ? 'border-warm-400 bg-warm-50 ring-1 ring-warm-300' : 'border-nude-200 hover:border-warm-200'}`}>
                  <div className="text-lg mb-1">{cfg.icon}</div>
                  <div className="text-[10px] font-medium text-ink-600">{cfg.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-ink-500">Permisos</label>
              <button onClick={() => setForm(f => ({ ...f, permisos: [...(PERMISOS_DEFAULT[f.role] || [])] }))}
                className="text-xs text-warm-600 hover:underline flex items-center gap-1">
                <RefreshCw size={10}/> Restablecer
              </button>
            </div>
            <div className="border border-nude-200 rounded-xl divide-y divide-nude-100 max-h-52 overflow-y-auto">
              {GRUPOS.map(grupo => {
                const gP = Object.entries(PERMISOS).filter(([,p]) => p.grupo === grupo)
                return (
                  <div key={grupo} className="px-4 py-3 bg-white">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-2">{grupo}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {gP.map(([id, p]) => (
                        <PermisoCheck key={id} id={id} label={p.label}
                          checked={form.permisos.includes(id)}
                          onChange={() => togglePermiso(id)}/>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancelar</Button>
            <Button onClick={handleEdit} loading={saving}>Guardar cambios</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
