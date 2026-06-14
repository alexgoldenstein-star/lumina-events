import { useState, useEffect } from 'react'
import { Settings, User, Building, MessageCircle, Save, Eye, EyeOff,
  DollarSign, Check, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Card, CardHeader, CardBody, Input, Button, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'
import { saveCotizacion, subscribeToCotizacion } from '../lib/db'

const CLAVE_MODO_CLIENTE = 'Jr123'

export default function Configuracion() {
  const { profile, updateProfileData, toggleHideComisiones, hideComisiones, user } = useAuth()

  const [form, setForm] = useState({
    nombre:    profile?.nombre    || '',
    orgName:   profile?.orgName   || '',
    telefono:  profile?.telefono  || '',
    instagram: profile?.instagram || '',
    msgFirma:  profile?.msgFirma  || '',
    msgSaludo: profile?.msgSaludo || 'Hola {nombre} 👋, ¿cómo estás?',
    msgCierre: profile?.msgCierre || '¡Muchas gracias! 🌸',
  })
  const [cotizacion,    setCotizacion]    = useState({ usd: 1000, eur: 1100 })
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [savingCot,     setSavingCot]     = useState(false)
  const [savedCot,      setSavedCot]      = useState(false)

  // Clave para modo cliente
  const [showClaveModal, setShowClaveModal] = useState(false)
  const [claveInput,     setClaveInput]     = useState('')
  const [claveError,     setClaveError]     = useState('')
  const [togglingCom,    setTogglingCom]    = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeToCotizacion(user.uid, setCotizacion)
  }, [user])

  useEffect(() => {
    if (!profile) return
    setForm(f => ({
      ...f,
      nombre:    profile.nombre    || f.nombre,
      orgName:   profile.orgName   || f.orgName,
      telefono:  profile.telefono  || f.telefono,
      instagram: profile.instagram || f.instagram,
      msgFirma:  profile.msgFirma  || f.msgFirma,
      msgSaludo: profile.msgSaludo || f.msgSaludo,
      msgCierre: profile.msgCierre || f.msgCierre,
    }))
  }, [profile?.nombre])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  async function handleSave() {
    setSaving(true)
    await updateProfileData(form)
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false), 2500)
  }

  async function handleSaveCotizacion() {
    setSavingCot(true)
    await saveCotizacion(user.uid, cotizacion)
    setSavingCot(false); setSavedCot(true)
    setTimeout(()=>setSavedCot(false), 2000)
  }

  function handleToggleClick() {
    // Si ya está activo, pedir clave para desactivar también
    setClaveInput('')
    setClaveError('')
    setShowClaveModal(true)
  }

  async function handleClaveConfirm() {
    if (claveInput !== CLAVE_MODO_CLIENTE) {
      setClaveError('Clave incorrecta')
      setClaveInput('')
      return
    }
    setShowClaveModal(false)
    setClaveInput('')
    setClaveError('')
    setTogglingCom(true)
    await toggleHideComisiones()
    setTogglingCom(false)
  }

  const orgName = form.orgName || form.nombre || 'Mi Empresa'
  const previewMsg = (form.msgSaludo || 'Hola {nombre} 👋')
    .replace('{nombre}', 'María')
    + `\n\nTe escribo de *${form.msgFirma || orgName}* para el festejo de *Valentina — 15 años*.\n\n`
    + (form.msgCierre || '¡Muchas gracias! 🌸')

  return (
    <div className="fade-in">
      <PageHeader title="Configuración" subtitle="Perfil, mensajes y preferencias"/>

      <div className="p-7 max-w-3xl space-y-6">

        {/* ── Modo vista cliente ─────────────────────────────────── */}
        <Card className={hideComisiones ? 'border-rose-300 ring-1 ring-rose-200' : ''}>
          <CardHeader>
            <Lock size={15} className={hideComisiones ? 'text-rose-500' : 'text-ink-400'}/>
            Modo vista cliente — Ocultar comisiones
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-ink-700">
                  {hideComisiones
                    ? <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                        <EyeOff size={14}/> Activo — comisiones ocultas
                      </span>
                    : <span className="text-ink-600">Las comisiones son visibles en toda la app</span>
                  }
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  Requiere clave para activar o desactivar. Ideal para mostrarle pantalla al cliente sin que vea tus comisiones.
                </p>
              </div>
              <button
                onClick={handleToggleClick}
                disabled={togglingCom}
                className={`flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none
                  ${hideComisiones ? 'bg-rose-500' : 'bg-ink-200'} ${togglingCom ? 'opacity-50' : ''}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
                  ${hideComisiones ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
            </div>
            {hideComisiones && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle size={13}/>
                Modo activo — las comisiones están ocultas. Desactivá con la clave cuando termines.
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Cotización ─────────────────────────────────────────── */}
        <Card>
          <CardHeader><DollarSign size={15} className="text-rose-400"/> Cotización de divisas</CardHeader>
          <CardBody className="space-y-4">
            <p className="text-xs text-ink-400">Usada para convertir USD/EUR a pesos en presupuestos y gastos.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">1 USD = $ ARS</label>
                <input type="number" value={cotizacion.usd}
                  onChange={e=>setCotizacion(c=>({...c,usd:parseFloat(e.target.value)||0}))}
                  className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400" placeholder="1000"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">1 EUR = $ ARS</label>
                <input type="number" value={cotizacion.eur}
                  onChange={e=>setCotizacion(c=>({...c,eur:parseFloat(e.target.value)||0}))}
                  className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400" placeholder="1100"/>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              {savedCot && <span className="text-xs text-sage-600 flex items-center gap-1"><Check size={12}/> Guardado</span>}
              <Button size="sm" onClick={handleSaveCotizacion} loading={savingCot}><Save size={12}/> Guardar</Button>
            </div>
          </CardBody>
        </Card>

        {/* ── Perfil ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader><User size={15} className="text-rose-400"/> Perfil personal</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tu nombre" value={form.nombre} onChange={e=>setField('nombre',e.target.value)}/>
              <Input label="Teléfono / WhatsApp" placeholder="+54 9 11..." value={form.telefono} onChange={e=>setField('telefono',e.target.value)}/>
            </div>
          </CardBody>
        </Card>

        {/* ── Empresa ────────────────────────────────────────────── */}
        <Card>
          <CardHeader><Building size={15} className="text-rose-400"/> Datos de la empresa</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre empresa / marca" placeholder="JR Eventos" value={form.orgName} onChange={e=>setField('orgName',e.target.value)}/>
              <Input label="Instagram" placeholder="@jreventos" value={form.instagram} onChange={e=>setField('instagram',e.target.value)}/>
            </div>
          </CardBody>
        </Card>

        {/* ── Mensajes WA ────────────────────────────────────────── */}
        <Card>
          <CardHeader><MessageCircle size={15} className="text-rose-400"/> Plantilla base de mensajes WA</CardHeader>
          <CardBody className="space-y-4">
            <Input label="Firma en los mensajes" placeholder={orgName} value={form.msgFirma} onChange={e=>setField('msgFirma',e.target.value)}/>
            <Input label="Saludo inicial" value={form.msgSaludo} onChange={e=>setField('msgSaludo',e.target.value)}/>
            <p className="text-xs text-ink-400">Usá <code className="bg-ink-100 px-1 rounded">{'{nombre}'}</code> para el nombre del invitado.</p>
            <Input label="Cierre" value={form.msgCierre} onChange={e=>setField('msgCierre',e.target.value)}/>
            <div>
              <p className="text-xs font-medium text-ink-500 mb-2">Vista previa</p>
              <div className="bg-[#ECE5DD] rounded-xl p-4">
                <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap max-w-xs">
                  {previewMsg.replace(/\*(.*?)\*/g,'$1')}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          {saved && <span className="text-sm text-sage-600 flex items-center gap-1"><Check size={14}/> Guardado</span>}
          <Button onClick={handleSave} loading={saving}><Save size={14}/> Guardar cambios</Button>
        </div>
      </div>

      {/* ── Modal clave ────────────────────────────────────────────── */}
      {showClaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Lock size={18} className="text-rose-600"/>
                </div>
                <div>
                  <h2 className="text-base font-medium text-ink-800">
                    {hideComisiones ? 'Desactivar' : 'Activar'} modo cliente
                  </h2>
                  <p className="text-xs text-ink-400">Ingresá la clave para continuar</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <input
                  type="password"
                  value={claveInput}
                  onChange={e=>{ setClaveInput(e.target.value); setClaveError('') }}
                  onKeyDown={e=>e.key==='Enter'&&handleClaveConfirm()}
                  placeholder="Clave de acceso"
                  className={`w-full px-4 py-3 text-sm border rounded-xl outline-none transition-colors text-center tracking-widest text-lg
                    ${claveError?'border-red-300 focus:border-red-400':'border-ink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'}`}
                  autoFocus
                />
                {claveError && (
                  <p className="text-xs text-red-500 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle size={11}/> {claveError}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={()=>{ setShowClaveModal(false); setClaveInput(''); setClaveError('') }}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleClaveConfirm} loading={togglingCom}>
                  <Lock size={13}/>
                  {hideComisiones ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
