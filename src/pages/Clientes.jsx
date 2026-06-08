import { useEffect, useState } from 'react'
import { Users, Plus, Copy, Check, Trash2, Eye, Link as LinkIcon } from 'lucide-react'
import { set, ref } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { subscribeToClientes, createCliente, deleteCliente, subscribeToEventos } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, Button, Input, Select, Modal, EmptyState, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const TIPO_CLIENTE = [
  { value: 'novios',    label: '💑 Novios / pareja' },
  { value: 'familia',   label: '👨‍👩‍👧 Familia / festejado' },
  { value: 'empresa',   label: '🏢 Empresa / corporativo' },
  { value: 'agencia',   label: '🤝 Agencia' },
  { value: 'otro',      label: '👤 Otro' },
]

const emptyForm = { nombre: '', tipo: 'novios', email: '', telefono: '', eventoId: '', notas: '' }

export default function Clientes() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!user) return
    const u1 = subscribeToClientes(user.uid, data => { setClientes(data); setLoading(false) })
    const u2 = subscribeToEventos(user.uid, setEventos)
    return () => { u1(); u2() }
  }, [user])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    try {
      const cliente = await createCliente(user.uid, form)
      // Register access code in public lookup table
      if (form.eventoId) {
        await set(ref(db, `accessCodes/${cliente.accessCode}`), {
          userId: user.uid,
          eventoId: form.eventoId,
          clienteId: cliente.id,
          nombre: form.nombre,
        })
      }
      setShowModal(false)
      setForm(emptyForm)
      setError('')
    } catch (e) {
      setError(e.message)
    }
    setSaving(false)
  }

  async function handleDelete(cliente) {
    if (!confirm(`¿Eliminar el acceso de "${cliente.nombre}"?`)) return
    await deleteCliente(user.uid, cliente.id)
  }

  function copyCode(code, id) {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  function copyLink(code, id) {
    const url = `${window.location.origin}/cliente`
    navigator.clipboard.writeText(`${url}\nCódigo de acceso: ${code}`)
    setCopied('link-' + id)
    setTimeout(() => setCopied(''), 2000)
  }

  const eventoNombre = (id) => eventos.find(e => e.id === id)?.nombre || '—'

  return (
    <div className="fade-in">
      <PageHeader
        title="Clientes"
        subtitle="Accesos personalizados para novios, familias y empresas"
        actions={<Button onClick={() => { setShowModal(true); setForm(emptyForm); setError('') }}><Plus size={15} /> Nuevo cliente</Button>}
      />

      <div className="p-7 space-y-5">
        {/* Instrucciones */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm text-rose-700">
          <strong>¿Cómo funciona?</strong> Creá un acceso para tu cliente, compartile el código y podrá ver la cuenta regresiva, el checklist y los detalles del evento desde su celular.
        </div>

        {loading ? (
          <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>
        ) : clientes.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              title="Sin clientes todavía"
              description="Creá el primer acceso para que tus clientes puedan ver su evento."
              action={<Button onClick={() => setShowModal(true)}><Plus size={13} /> Crear acceso</Button>}
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {clientes.map(cliente => {
              const tipoLabel = TIPO_CLIENTE.find(t => t.value === cliente.tipo)?.label || cliente.tipo
              return (
                <Card key={cliente.id}>
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-lg flex-shrink-0">
                        {tipoLabel.split(' ')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-medium text-ink-800">{cliente.nombre}</h3>
                          <Badge variant="pink">{tipoLabel.split(' ').slice(1).join(' ')}</Badge>
                        </div>
                        {cliente.eventoId && (
                          <p className="text-xs text-ink-400 mt-0.5">Evento: {eventoNombre(cliente.eventoId)}</p>
                        )}
                        {cliente.email && <p className="text-xs text-ink-400">{cliente.email}</p>}
                      </div>

                      {/* Código de acceso */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-ink-50 rounded-xl px-4 py-2">
                          <span className="font-mono text-lg font-bold text-ink-800 tracking-widest">{cliente.accessCode}</span>
                          <button
                            onClick={() => copyCode(cliente.accessCode, cliente.id)}
                            className="text-ink-400 hover:text-rose-500 transition-colors"
                          >
                            {copied === cliente.id ? <Check size={15} className="text-sage-500" /> : <Copy size={15} />}
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline" size="xs"
                            onClick={() => copyLink(cliente.accessCode, cliente.id)}
                          >
                            {copied === 'link-' + cliente.id ? <Check size={11} /> : <LinkIcon size={11} />}
                            {copied === 'link-' + cliente.id ? 'Copiado' : 'Copiar link'}
                          </Button>
                          <a href="/cliente" target="_blank">
                            <Button variant="ghost" size="xs"><Eye size={11} /></Button>
                          </a>
                          <Button variant="ghost" size="xs" className="hover:text-red-500" onClick={() => handleDelete(cliente)}>
                            <Trash2 size={11} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo acceso de cliente" size="md">
        <div className="space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre del cliente *" placeholder="Valentina y Rodrigo" value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
            <Select label="Tipo de cliente" value={form.tipo} onChange={e => setField('tipo', e.target.value)}>
              {TIPO_CLIENTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
            <Input label="Teléfono" value={form.telefono} onChange={e => setField('telefono', e.target.value)} />
          </div>
          <Select label="Evento asociado" value={form.eventoId} onChange={e => setField('eventoId', e.target.value)}>
            <option value="">— Sin evento —</option>
            {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </Select>
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700">
            Se generará un código de acceso único que podés compartirle al cliente por WhatsApp.
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Crear acceso</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
