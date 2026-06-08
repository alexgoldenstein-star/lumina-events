import { useState } from 'react'
import { Settings, User, Building, MessageCircle, Save } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Card, CardHeader, CardBody, Input, Textarea, Button, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

export default function Configuracion() {
  const { profile, updateProfileData } = useAuth()
  const [form, setForm] = useState({
    nombre:      profile?.nombre      || '',
    orgName:     profile?.orgName     || '',
    telefono:    profile?.telefono    || '',
    instagram:   profile?.instagram   || '',
    msgFirma:    profile?.msgFirma    || 'JR Eventos',
    msgSaludo:   profile?.msgSaludo   || 'Hola {nombre} 👋, ¿cómo estás?',
    msgCierre:   profile?.msgCierre   || '¡Muchas gracias! 🌸',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    await updateProfileData(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const previewMsg = `${form.msgSaludo.replace('{nombre}', 'María')}

Te escribo de *${form.msgFirma}* en relación al festejo de *Valentina — 15 años*.

¿Podés confirmarnos tu asistencia? Y si es así, ¿tenés alguna restricción alimentaria?

${form.msgCierre}`

  return (
    <div className="fade-in">
      <PageHeader
        title="Configuración"
        subtitle="Perfil, datos de la empresa y plantillas de mensajes"
      />
      <div className="p-7 max-w-3xl space-y-6">

        {/* Perfil */}
        <Card>
          <CardHeader><User size={15} className="text-rose-400" /> Perfil personal</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tu nombre" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              <Input label="Teléfono / WhatsApp" placeholder="+54 9 11 ..." value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
          </CardBody>
        </Card>

        {/* Empresa */}
        <Card>
          <CardHeader><Building size={15} className="text-rose-400" /> Datos de la empresa</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre de la empresa / marca" placeholder="JR Eventos" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
              <Input label="Instagram" placeholder="@jreventos" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
            </div>
          </CardBody>
        </Card>

        {/* Mensajes WA */}
        <Card>
          <CardHeader><MessageCircle size={15} className="text-rose-400" /> Plantilla de mensajes WhatsApp</CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Firma en los mensajes (nombre que aparece)"
              placeholder="JR Eventos"
              value={form.msgFirma}
              onChange={e => set('msgFirma', e.target.value)}
            />
            <Input
              label="Saludo inicial"
              placeholder="Hola {nombre} 👋, ¿cómo estás?"
              value={form.msgSaludo}
              onChange={e => set('msgSaludo', e.target.value)}
            />
            <p className="text-xs text-ink-400">Usá <code className="bg-ink-100 px-1 rounded">{'{nombre}'}</code> para insertar el nombre del invitado automáticamente.</p>
            <Input
              label="Cierre del mensaje"
              placeholder="¡Muchas gracias! 🌸"
              value={form.msgCierre}
              onChange={e => set('msgCierre', e.target.value)}
            />

            {/* Preview */}
            <div>
              <p className="text-xs font-medium text-ink-500 mb-2">Vista previa</p>
              <div className="bg-[#ECE5DD] rounded-xl p-4">
                <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap max-w-xs">
                  {previewMsg.replace(/\*(.*?)\*/g, '$1')}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          {saved && <span className="text-sm text-sage-600">✓ Guardado correctamente</span>}
          <Button onClick={handleSave} loading={saving}>
            <Save size={14} /> Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
