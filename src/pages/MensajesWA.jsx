import { useEffect, useState } from 'react'
import { MessageCircle, Clock, AlertTriangle, CheckCircle, Send, Save, Edit2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToInvitados, updateInvitado, subscribeToPlantillas, savePlantillas } from '../lib/db'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES, normalizePhone } from '../lib/whatsapp'
import { Card, CardHeader, CardBody, Badge, Button, Textarea, Modal, Alert } from '../components/ui'

const DEFAULT_TEMPLATES = {
  [MESSAGE_TYPES.PRIMERA_CONFIRMACION]: `Hola {nombre} 👋, ¿cómo estás?

Te escribo de *{organizadora}* en relación al festejo de *{evento}*.

El evento será el *{fecha}*{hora}{lugar}.

¿Podés confirmarnos tu asistencia? Y si es así, ¿tenés alguna restricción alimentaria?

¡Muchas gracias! 🌸`,

  [MESSAGE_TYPES.SEGUIMIENTO]: `Hola {nombre}! 🌷

Te escribo nuevamente de *{organizadora}*. Quedó pendiente tu confirmación para el festejo de *{evento}*.

¿Pudiste verlo? Cualquier consulta, acá estamos 😊`,

  [MESSAGE_TYPES.RECORDATORIO]: `¡Hola {nombre}! ✨

Ya falta poco para el festejo de *{evento}* — el *{fecha}*{hora}{lugar}.

¡Te esperamos! 💫`,

  [MESSAGE_TYPES.DIA_DEL_EVENTO]: `¡Hola {nombre}! 🎉

Hoy es el gran día de *{evento}*. Te esperamos{hora}{lugar}.

¡Va a estar increíble! 🌸`,
}

const MSG_LABELS = {
  [MESSAGE_TYPES.PRIMERA_CONFIRMACION]: 'Primera confirmación',
  [MESSAGE_TYPES.SEGUIMIENTO]:           'Seguimiento (+72hs)',
  [MESSAGE_TYPES.RECORDATORIO]:          'Recordatorio previo',
  [MESSAGE_TYPES.DIA_DEL_EVENTO]:        'Día del evento',
}

const VARIABLES = ['{nombre}','*{evento}*','*{fecha}*','{hora}','{lugar}','*{organizadora}*']

function interpolate(template, { nombre='[Nombre]', evento='', fecha='', hora='', lugar='', org='' }={}) {
  return template
    .replace(/{nombre}/g, nombre)
    .replace(/\*?\{evento\}\*?/g, evento||'[Evento]')
    .replace(/\*?\{fecha\}\*?/g, fecha||'[Fecha]')
    .replace(/{hora}/g, hora ? ` a las *${hora} hs*` : '')
    .replace(/{lugar}/g, lugar ? ` en *${lugar}*` : '')
    .replace(/\*?\{organizadora\}\*?/g, org||'[Organizadora]')
}

function WAModal({ open, onClose, guest, template, evento, orgName }) {
  if(!open||!guest) return null
  const msg = interpolate(template, {
    nombre: guest.fullName?.split(' ')[0],
    evento: evento?.nombre,
    fecha:  evento?.date ? new Date(evento.date+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'}) : '',
    hora:   evento?.hora,
    lugar:  evento?.lugar,
    org:    orgName,
  })
  return (
    <Modal open={open} onClose={onClose} title={`Mensaje para ${guest.fullName}`} size="md">
      <div className="space-y-4">
        <p className="text-xs text-ink-400">Para: <strong className="text-ink-700">{guest.whatsapp}</strong></p>
        <div className="bg-[#ECE5DD] rounded-xl p-4">
          <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap max-w-xs">
            {msg.replace(/\*(.*?)\*/g,'$1')}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <button onClick={()=>{openWhatsApp(guest.whatsapp,msg);onClose()}}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1fbd5a] transition-colors">
            <MessageCircle size={15}/> Abrir en WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function MensajesWA({ eventoId, evento }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [plantillas, setPlantillas] = useState(null)
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [activeType, setActiveType] = useState(MESSAGE_TYPES.PRIMERA_CONFIRMACION)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)
  const [savedTpl, setSavedTpl] = useState(false)
  const [modalData, setModalData] = useState(null)

  useEffect(()=>{
    if(!user?.uid||!eventoId) return
    const u1=subscribeToInvitados(user.uid, eventoId, setGuests)
    const u2=subscribeToPlantillas(user.uid, eventoId, data=>{
      if(data){ setPlantillas(data); setTemplates({...DEFAULT_TEMPLATES,...data}) }
    })
    return ()=>{ u1(); u2() }
  },[user?.uid, eventoId])

  async function saveTemplate() {
    setSavingTpl(true)
    const updated = { ...templates, [activeType]: editText }
    await savePlantillas(user.uid, eventoId, updated)
    setTemplates(updated)
    setSavingTpl(false); setEditMode(false); setSavedTpl(true)
    setTimeout(()=>setSavedTpl(false),2000)
  }

  function startEdit() { setEditText(templates[activeType]||DEFAULT_TEMPLATES[activeType]); setEditMode(true) }
  function resetToDefault() { setEditText(DEFAULT_TEMPLATES[activeType]) }

  const pendientes = guests.filter(g=>g.status!=='confirmed'&&g.status!=='declined'&&g.whatsapp)
  const sinResp    = guests.filter(g=>needsFollowUp(g)&&g.whatsapp)

  const previewMsg = interpolate(templates[activeType]||DEFAULT_TEMPLATES[activeType], {
    nombre: 'María',
    evento: evento?.nombre||'[Evento]',
    fecha:  evento?.date ? new Date(evento.date+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'}) : '[Fecha]',
    hora:   evento?.hora,
    lugar:  evento?.lugar,
    org:    'JR Eventos',
  })

  return (
    <div className="p-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plantilla editor */}
        <div className="space-y-5">
          <Card>
            <CardHeader action={
              editMode ? (
                <div className="flex gap-2">
                  <button onClick={resetToDefault} className="text-xs text-ink-400 hover:text-ink-600">Restablecer</button>
                  <Button size="sm" onClick={saveTemplate} loading={savingTpl}><Save size={12}/> Guardar</Button>
                  <Button size="sm" variant="outline" onClick={()=>setEditMode(false)}>✕</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {savedTpl&&<span className="text-xs text-sage-600 flex items-center gap-1"><CheckCircle size={12}/> Guardado</span>}
                  <Button size="sm" variant="outline" onClick={startEdit}><Edit2 size={12}/> Editar</Button>
                </div>
              )
            }>
              <MessageCircle size={15} className="text-rose-400"/> Plantilla del mensaje
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Selector de tipo */}
              <div className="flex gap-1 flex-wrap">
                {Object.entries(MSG_LABELS).map(([key,label])=>(
                  <button key={key} onClick={()=>{ setActiveType(key); setEditMode(false) }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeType===key?'bg-rose-500 text-white border-rose-500':'bg-white text-ink-500 border-ink-200 hover:border-rose-300'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Editor o preview */}
              {editMode ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={e=>setEditText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2.5 text-sm border border-rose-300 rounded-xl outline-none focus:border-rose-500 resize-none font-mono leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-1">
                    <p className="text-xs text-ink-400 w-full">Variables disponibles:</p>
                    {VARIABLES.map(v=>(
                      <button key={v} onClick={()=>setEditText(t=>t+v)}
                        className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded border border-rose-100 hover:bg-rose-100 font-mono">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-ink-500 mb-2">Vista previa</p>
                  <div className="bg-[#ECE5DD] rounded-xl p-4">
                    <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm px-4 py-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap max-w-xs">
                      {previewMsg.replace(/\*(.*?)\*/g,'$1')}
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cronograma */}
          <Card>
            <CardHeader><Clock size={15} className="text-rose-400"/> Cronograma</CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  { label:'Envío inicial', sub:'Primera confirmación a todos', done:true },
                  { label:'Seguimiento +72hs', sub:`${sinResp.length} sin respuesta`, alert:sinResp.length>0, done:sinResp.length===0 },
                  { label:'Recordatorio previo', sub:'7 días antes del evento', pending:true },
                  { label:'Día del evento', sub:'El mismo día', pending:true },
                ].map((item,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                      ${item.alert?'bg-red-50 text-red-500':item.done?'bg-sage-50 text-sage-600':'bg-gold-50 text-gold-600'}`}>
                      {item.alert?<AlertTriangle size={12}/>:item.done?<CheckCircle size={12}/>:<Clock size={12}/>}
                    </div>
                    <div><p className="text-sm font-medium text-ink-700">{item.label}</p><p className="text-xs text-ink-400">{item.sub}</p></div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Cola de pendientes */}
        <div className="space-y-5">
          {sinResp.length>0&&(
            <Card>
              <CardHeader action={<Badge variant="red">{sinResp.length}</Badge>}>
                <AlertTriangle size={15} className="text-red-400"/> Sin respuesta +72hs
              </CardHeader>
              <div className="divide-y divide-ink-50 max-h-56 overflow-y-auto">
                {sinResp.map(g=>(
                  <div key={g.id} className="flex items-center gap-3 px-4 py-3 bg-red-50/30 hover:bg-red-50 transition-colors">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink-800">{g.fullName}</p><p className="text-xs text-ink-400">{g.whatsapp}</p></div>
                    <button onClick={()=>setModalData({guest:g,type:MESSAGE_TYPES.SEGUIMIENTO})} className="btn-wa btn-wa-alert text-xs">
                      <MessageCircle size={12}/> Reenviar
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader action={<Badge variant="amber">{pendientes.length}</Badge>}>
              <Send size={15} className="text-rose-400"/> Pendientes de confirmar
            </CardHeader>
            <div className="divide-y divide-ink-50 max-h-96 overflow-y-auto">
              {pendientes.length===0?(
                <div className="py-8 text-center text-sm text-ink-400">
                  <CheckCircle size={24} className="text-sage-400 mx-auto mb-2"/>
                  ¡Todos respondieron!
                </div>
              ):pendientes.map(g=>(
                <div key={g.id} className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800">{g.fullName}</p>
                    <p className="text-xs text-ink-400">{g.whatsapp}</p>
                  </div>
                  {needsFollowUp(g)&&<Badge variant="red" className="text-[10px]">+72hs</Badge>}
                  <button
                    onClick={()=>setModalData({ guest:g, type:needsFollowUp(g)?MESSAGE_TYPES.SEGUIMIENTO:activeType })}
                    className={`btn-wa text-xs ${needsFollowUp(g)?'btn-wa-alert':''}`}>
                    <MessageCircle size={12}/> {needsFollowUp(g)?'Reenviar':'Enviar'}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {modalData&&(
        <WAModal
          open={!!modalData} onClose={()=>setModalData(null)}
          guest={modalData.guest}
          template={templates[modalData.type]||DEFAULT_TEMPLATES[modalData.type]}
          evento={evento} orgName="JR Eventos"
        />
      )}
    </div>
  )
}
