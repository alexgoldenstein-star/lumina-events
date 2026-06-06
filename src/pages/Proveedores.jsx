import { useEffect, useState } from 'react'
import { Briefcase, Plus, Star, Phone, Mail, Globe, Edit, Trash2, Search } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToProveedores, createProveedor, updateProveedor, deleteProveedor } from '../lib/db'
import { Card, CardBody, Badge, Button, Input, Select, Textarea, Modal, EmptyState, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const CATEGORIAS = [
  'Catering', 'Fotografía y video', 'Música y DJ', 'Decoración y flores',
  'Iluminación', 'Salón', 'Transporte', 'Animación', 'Tortas y repostería',
  'Sonido', 'Mobiliario', 'Cotillón', 'Otro',
]

const CAT_COLORS = {
  'Catering':             'text-gold-600 bg-gold-50',
  'Fotografía y video':   'text-ink-500 bg-ink-50',
  'Música y DJ':          'text-purple-600 bg-purple-50',
  'Decoración y flores':  'text-rose-500 bg-rose-50',
  'Iluminación':          'text-amber-600 bg-amber-50',
  'Salón':                'text-sage-600 bg-sage-50',
}

function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange && onChange(s)}
          className={`text-xl transition-colors ${s <= value ? 'text-gold-400' : 'text-ink-200 hover:text-gold-300'}`}
        >★</button>
      ))}
    </div>
  )
}

const emptyForm = {
  nombre: '', categoria: 'Catering', contacto: '', telefono: '', email: '',
  web: '', rating: 0, comision: '', notas: '', trabajosAnteriores: '',
}

export default function Proveedores() {
  const { user } = useAuth()
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    return subscribeToProveedores(user.uid, data => {
      setProveedores(data)
      setLoading(false)
    })
  }, [user])

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true) }
  function openEdit(p) { setEditing(p); setForm({ ...emptyForm, ...p }); setError(''); setShowModal(true) }

  function setField(k, v) { setForm(f => ({...f, [k]: v})) }

  async function handleSave() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    try {
      if (editing) {
        await updateProveedor(user.uid, editing.id, form)
      } else {
        await createProveedor(user.uid, form)
      }
      setShowModal(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar proveedor?')) return
    await deleteProveedor(user.uid, id)
  }

  const categorias = ['all', ...CATEGORIAS.filter(c => proveedores.some(p => p.categoria === c))]

  const filtered = proveedores.filter(p => {
    const matchSearch = !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.categoria?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.categoria === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="fade-in">
      <PageHeader
        title="Proveedores"
        subtitle={`${proveedores.length} proveedor${proveedores.length !== 1 ? 'es' : ''} en tu directorio`}
        actions={<Button onClick={openNew}><Plus size={15} /> Agregar proveedor</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="Buscar proveedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400 w-52"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categorias.slice(0, 6).map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  catFilter === c
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-rose-300'
                }`}
              >
                {c === 'all' ? 'Todos' : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-xl border border-ink-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title="No hay proveedores"
              description="Agregá tus proveedores favoritos para tener todo organizado y calcular tus comisiones."
              action={<Button onClick={openNew}><Plus size={13} /> Agregar primero</Button>}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const colorClass = CAT_COLORS[p.categoria] || 'text-ink-500 bg-ink-50'
              const comisionNum = parseFloat(p.comision)
              return (
                <Card key={p.id} className="hover:shadow-sm transition-shadow">
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${colorClass}`}>
                        {p.categoria}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="text-ink-300 hover:text-ink-600 transition-colors p-1"><Edit size={13} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-ink-300 hover:text-red-400 transition-colors p-1"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-ink-800 mb-1">{p.nombre}</h3>
                    {p.contacto && <p className="text-xs text-ink-400 mb-2">{p.contacto}</p>}
                    {p.rating > 0 && (
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= p.rating ? 'text-gold-400' : 'text-ink-200'}`}>★</span>
                        ))}
                      </div>
                    )}
                    {!isNaN(comisionNum) && comisionNum > 0 && (
                      <div className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-700 text-xs px-2.5 py-1 rounded-lg font-medium mb-3">
                        Comisión {comisionNum}%
                      </div>
                    )}
                    <div className="space-y-1.5 mt-2 pt-3 border-t border-ink-50">
                      {p.telefono && (
                        <a href={`tel:${p.telefono}`} className="flex items-center gap-2 text-xs text-ink-500 hover:text-rose-600 transition-colors">
                          <Phone size={11} /> {p.telefono}
                        </a>
                      )}
                      {p.email && (
                        <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-xs text-ink-500 hover:text-rose-600 transition-colors">
                          <Mail size={11} /> {p.email}
                        </a>
                      )}
                      {p.web && (
                        <a href={p.web} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-ink-500 hover:text-rose-600 transition-colors">
                          <Globe size={11} /> {p.web.replace(/https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    {p.notas && (
                      <p className="text-xs text-ink-400 mt-2 pt-2 border-t border-ink-50 line-clamp-2">{p.notas}</p>
                    )}
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar proveedor' : 'Agregar proveedor'} size="lg">
        <div className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre del proveedor *" value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
            <Select label="Categoría" value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre de contacto" value={form.contacto} onChange={e => setField('contacto', e.target.value)} />
            <Input label="Teléfono / WhatsApp" value={form.telefono} onChange={e => setField('telefono', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
            <Input label="Web / Instagram" value={form.web} onChange={e => setField('web', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-2">Rating</label>
              <StarRating value={form.rating} onChange={v => setField('rating', v)} />
            </div>
            <Input label="Comisión %" placeholder="10" value={form.comision} onChange={e => setField('comision', e.target.value)} />
          </div>
          <Textarea label="Notas" placeholder="Especialidades, disponibilidad, condiciones..." value={form.notas} onChange={e => setField('notas', e.target.value)} />
          <Textarea label="Trabajos anteriores" placeholder="Eventos en los que trabajaron juntos..." value={form.trabajosAnteriores} onChange={e => setField('trabajosAnteriores', e.target.value)} rows={2} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Guardar proveedor</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
