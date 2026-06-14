import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, PartyPopper, Building, CalendarCheck, Upload, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { createEvento, updateEvento } from '../lib/db'
import { parseGuestsFromFile, downloadExcelTemplate, addManyInvitados } from '../lib/excel'
import { Button, Input, Select, Textarea, Card, CardHeader, CardBody, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const TIPOS = [
  { value:'boda',        label:'💒 Boda / Casamiento' },
  { value:'cumpleanos',  label:'🎂 Cumpleaños'         },
  { value:'corporativo', label:'🏢 Evento Corporativo'  },
  { value:'otro',        label:'🎊 Otro'                },
]

export default function EventoForm({ evento }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isEdit = !!evento

  const [form, setForm] = useState({
    nombre:          evento?.nombre          || '',
    tipo:            evento?.tipo            || 'boda',
    date:            evento?.date            || '',
    hora:            evento?.hora            || '',
    lugar:           evento?.lugar           || '',
    direccion:       evento?.direccion       || '',
    notas:           evento?.notas           || '',
    honorarios:      evento?.honorarios      || '',
    // Cliente
    clienteNombre:   evento?.clienteNombre   || '',
    clienteTelefono: evento?.clienteTelefono || '',
    clienteEmail:    evento?.clienteEmail    || '',
    clienteNotas:    evento?.clienteNotas    || '',
  })
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [excelFile, setExcelFile] = useState(null)
  const [excelPreview, setExcelPreview] = useState(null)
  const [excelError,   setExcelError]   = useState('')
  const [importing, setImporting] = useState(false)

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre del evento es requerido'
    if (!form.date)           e.date   = 'La fecha es requerida'
    return e
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setExcelFile(file); setExcelError(''); setExcelPreview(null)
    try { setExcelPreview(await parseGuestsFromFile(file)) }
    catch (err) { setExcelError(err.message) }
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      let eventoId
      if (isEdit) { await updateEvento(user.uid, evento.id, form); eventoId = evento.id }
      else { const created = await createEvento(user.uid, form); eventoId = created.id }
      if (excelPreview && eventoId) { setImporting(true); await addManyInvitados(user.uid, eventoId, excelPreview.guests) }
      navigate(`/app/eventos/${eventoId}`)
    } catch (err) {
      setErrors({ general: err.message })
    } finally { setSaving(false); setImporting(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title={isEdit?'Editar Evento':'Nuevo Evento'} subtitle={isEdit?evento.nombre:'Completá los datos del evento'}/>
      <div className="p-7 max-w-3xl space-y-6">
        {errors.general && <Alert variant="danger">{errors.general}</Alert>}

        {/* Datos del evento */}
        <Card>
          <CardHeader><CalendarCheck size={15} className="text-rose-400"/> Datos del evento</CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-2">Tipo de evento</label>
              <div className="grid grid-cols-4 gap-2">
                {TIPOS.map(t=>(
                  <button key={t.value} onClick={()=>set('tipo',t.value)}
                    className={`p-3 rounded-xl border text-xs font-medium transition-all text-center
                      ${form.tipo===t.value?'border-rose-300 bg-rose-50 text-rose-700':'border-ink-100 bg-white text-ink-500 hover:border-rose-200 hover:bg-rose-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Nombre del evento / Homenajeado/s *" placeholder="Ej: Valentina — 15 años"
              value={form.nombre} onChange={e=>set('nombre',e.target.value)} error={errors.nombre}/>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Fecha *" type="date" value={form.date} onChange={e=>set('date',e.target.value)} error={errors.date}/>
              <Input label="Hora" type="time" value={form.hora} onChange={e=>set('hora',e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Salón / Lugar" value={form.lugar} onChange={e=>set('lugar',e.target.value)}/>
              <Input label="Dirección" value={form.direccion} onChange={e=>set('direccion',e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Honorarios de la organizadora" placeholder="$ 0" value={form.honorarios} onChange={e=>set('honorarios',e.target.value)}/>
            </div>
            <Textarea label="Notas internas" value={form.notas} onChange={e=>set('notas',e.target.value)}/>
          </CardBody>
        </Card>

        {/* Datos del cliente */}
        <Card>
          <CardHeader><User size={15} className="text-rose-400"/> Datos del cliente</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre del cliente / pareja" placeholder="Ej: Valentina García" value={form.clienteNombre} onChange={e=>set('clienteNombre',e.target.value)}/>
              <Input label="Teléfono / WhatsApp" placeholder="+54 9 11..." value={form.clienteTelefono} onChange={e=>set('clienteTelefono',e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email del cliente" type="email" value={form.clienteEmail} onChange={e=>set('clienteEmail',e.target.value)}/>
            </div>
            <Textarea label="Notas sobre el cliente" rows={2} placeholder="Preferencias, requerimientos especiales, acuerdos..." value={form.clienteNotas} onChange={e=>set('clienteNotas',e.target.value)}/>
          </CardBody>
        </Card>

        {/* Importar invitados */}
        <Card>
          <CardHeader action={<button onClick={downloadExcelTemplate} className="text-xs text-rose-500 hover:underline">Descargar template</button>}>
            <Upload size={15} className="text-rose-400"/> Importar invitados (opcional)
          </CardHeader>
          <CardBody>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink-200 rounded-xl p-8 cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all">
              <Upload size={28} className="text-rose-300"/>
              <div className="text-center">
                <p className="text-sm font-medium text-ink-600">{excelFile?excelFile.name:'Arrastrá o hacé clic para subir el Excel'}</p>
                <p className="text-xs text-ink-400 mt-1">Columnas: Nombre · Apellido · WhatsApp · Email · Cantidad · Menú</p>
              </div>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden"/>
            </label>
            {excelError && <Alert variant="danger" className="mt-3">{excelError}</Alert>}
            {excelPreview && (
              <div className="mt-4 p-4 bg-sage-50 border border-sage-200 rounded-xl">
                <p className="text-sm font-medium text-sage-700">✓ {excelPreview.total} invitados · {excelPreview.withPhone} con WhatsApp</p>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={()=>navigate('/app/eventos')}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={saving||importing}>
            {importing?'Importando...':saving?'Guardando...':isEdit?'Guardar cambios':'Crear Evento'}
          </Button>
        </div>
      </div>
    </div>
  )
}
