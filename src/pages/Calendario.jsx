import { useEffect, useState } from 'react'
import { Plus, Trash2, Bell, Calendar, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../lib/AuthContext'
import { subscribeToCalendario, createCalEvento, deleteCalEvento,
  subscribeToEventos, subscribeToVencimientos } from '../lib/db'
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, Badge, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

const TIPOS = [
  { value:'reunion',      label:'🤝 Reunión con cliente',    color:'bg-rose-100 text-rose-700'   },
  { value:'visita',       label:'📍 Visita al salón',        color:'bg-purple-100 text-purple-700'},
  { value:'vencimiento',  label:'💰 Vencimiento de pago',    color:'bg-gold-100 text-gold-700'   },
  { value:'entrega',      label:'📦 Entrega / confirmación', color:'bg-blue-100 text-blue-700'   },
  { value:'evento',       label:'🎉 Día del evento',         color:'bg-sage-100 text-sage-700'   },
  { value:'otro',         label:'📌 Otro',                   color:'bg-ink-100 text-ink-600'     },
]

const emptyForm = { titulo:'', tipo:'reunion', date:'', hora:'', eventoId:'', descripcion:'', notificarCliente:false }

export default function Calendario() {
  const { user } = useAuth()
  const [eventos,    setEventos]    = useState([])
  const [calItems,   setCalItems]   = useState([])
  const [vencimientos, setVenc]     = useState([])
  const [currentMonth, setMonth]    = useState(new Date())
  const [selectedDay,  setSelDay]   = useState(null)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!user) return
    const u1 = subscribeToCalendario(user.uid, setCalItems)
    const u2 = subscribeToEventos(user.uid, setEventos)
    const u3 = subscribeToVencimientos(user.uid, setVenc)
    return () => { u1(); u2(); u3() }
  }, [user])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  async function handleSave() {
    if (!form.titulo.trim() || !form.date) return
    setSaving(true)
    await createCalEvento(user.uid, form)
    setSaving(false); setShowModal(false); setForm(emptyForm)
  }

  // Combinar todos los items en el calendario
  const allItems = [
    ...calItems,
    ...eventos.map(e => ({ id:'ev-'+e.id, titulo:e.nombre, date:e.date, tipo:'evento', isEvento:true })),
    ...vencimientos.map(v => ({ id:'vc-'+v.id, titulo:v.titulo, date:v.dueDate, tipo:'vencimiento', isVenc:true })),
  ]

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const firstDow = startOfMonth(currentMonth).getDay() // 0=sun
  const paddingDays = (firstDow + 6) % 7 // monday-first

  function itemsForDay(day) {
    return allItems.filter(i => i.date && isSameDay(new Date(i.date+'T12:00:00'), day))
  }

  const today = new Date()
  const upcoming = allItems
    .filter(i => i.date && new Date(i.date+'T23:59:00') >= today)
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8)

  return (
    <div className="fade-in">
      <PageHeader
        title="Calendario"
        subtitle="Reuniones, vencimientos y eventos"
        actions={<Button onClick={() => { setShowModal(true); setForm({...emptyForm, date: selectedDay ? format(selectedDay,'yyyy-MM-dd') : '' }) }}><Plus size={15}/> Agregar</Button>}
      />

      <div className="p-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario mensual */}
        <div className="lg:col-span-2">
          <Card>
            {/* Header mes */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <button onClick={() => setMonth(m => subMonths(m,1))} className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-500 hover:text-rose-600 transition-colors"><ChevronLeft size={18}/></button>
              <h2 className="font-serif text-lg text-ink-800 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <button onClick={() => setMonth(m => addMonths(m,1))} className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-500 hover:text-rose-600 transition-colors"><ChevronRight size={18}/></button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-ink-100">
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-medium text-ink-400">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {Array(paddingDays).fill(null).map((_,i) => <div key={'p'+i} className="h-24 border-b border-r border-ink-50"/>)}
              {days.map((day, i) => {
                const dayItems = itemsForDay(day)
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                return (
                  <div
                    key={i}
                    onClick={() => setSelDay(day)}
                    className={`h-24 border-b border-r border-ink-50 p-1.5 cursor-pointer transition-colors overflow-hidden
                      ${isToday(day) ? 'bg-rose-50' : ''}
                      ${isSelected ? 'ring-2 ring-inset ring-rose-400' : 'hover:bg-ink-50'}`}
                  >
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-rose-500 text-white' : 'text-ink-600'}`}>
                      {format(day,'d')}
                    </div>
                    <div className="space-y-0.5">
                      {dayItems.slice(0,3).map(item => {
                        const tipoCfg = TIPOS.find(t => t.value===item.tipo)
                        return (
                          <div key={item.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${tipoCfg?.color||'bg-ink-100 text-ink-600'}`}>
                            {item.titulo}
                          </div>
                        )
                      })}
                      {dayItems.length > 3 && <div className="text-[10px] text-ink-400">+{dayItems.length-3} más</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-5">
          {/* Día seleccionado */}
          {selectedDay && (
            <Card>
              <CardHeader action={
                <Button size="sm" onClick={() => setShowModal(true)}>
                  <Plus size={12}/> Agregar
                </Button>
              }>
                <Calendar size={14} className="text-rose-400"/>
                {format(selectedDay, "d 'de' MMMM", { locale: es })}
              </CardHeader>
              <div className="divide-y divide-ink-50">
                {itemsForDay(selectedDay).length === 0
                  ? <p className="px-4 py-4 text-sm text-ink-400 text-center">Sin eventos este día</p>
                  : itemsForDay(selectedDay).map(item => {
                    const tipoCfg = TIPOS.find(t => t.value===item.tipo)
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3 group">
                        <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${tipoCfg?.color||'bg-ink-100 text-ink-600'}`}>
                          {tipoCfg?.label?.split(' ')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-800">{item.titulo}</p>
                          {item.hora && <p className="text-xs text-ink-400">{item.hora} hs</p>}
                          {item.descripcion && <p className="text-xs text-ink-400 italic">{item.descripcion}</p>}
                        </div>
                        {!item.isEvento && !item.isVenc && (
                          <button onClick={() => deleteCalEvento(user.uid, item.id)}
                            className="text-ink-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    )
                  })
                }
              </div>
            </Card>
          )}

          {/* Próximos */}
          <Card>
            <CardHeader><Clock size={14} className="text-rose-400"/> Próximos</CardHeader>
            <div className="divide-y divide-ink-50 max-h-72 overflow-y-auto">
              {upcoming.length === 0
                ? <p className="px-4 py-4 text-sm text-ink-400">Sin eventos próximos</p>
                : upcoming.map(item => {
                  const tipoCfg = TIPOS.find(t => t.value===item.tipo)
                  const d = new Date(item.date+'T12:00:00')
                  const isHoy = isToday(d)
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors">
                      <div className="text-center flex-shrink-0 w-10">
                        <div className={`text-xs font-bold ${isHoy?'text-rose-600':'text-ink-600'}`}>{format(d,'d',{locale:es})}</div>
                        <div className="text-[10px] text-ink-400 capitalize">{format(d,'MMM',{locale:es})}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{item.titulo}</p>
                        <p className={`text-[10px] px-1.5 py-0.5 rounded inline-block mt-0.5 font-medium ${tipoCfg?.color||'bg-ink-100 text-ink-600'}`}>
                          {tipoCfg?.label?.split(' ').slice(1).join(' ')}
                        </p>
                      </div>
                      {isHoy && <Badge variant="red">Hoy</Badge>}
                    </div>
                  )
                })
              }
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo evento en el calendario" size="md">
        <div className="space-y-4">
          <Input label="Título *" value={form.titulo} onChange={e=>setField('titulo',e.target.value)} placeholder="Ej: Reunión con Valentina"/>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.tipo} onChange={e=>setField('tipo',e.target.value)}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select label="Evento relacionado" value={form.eventoId} onChange={e=>setField('eventoId',e.target.value)}>
              <option value="">— General —</option>
              {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha *" type="date" value={form.date} onChange={e=>setField('date',e.target.value)}/>
            <Input label="Hora" type="time" value={form.hora} onChange={e=>setField('hora',e.target.value)}/>
          </div>
          <Input label="Descripción" value={form.descripcion} onChange={e=>setField('descripcion',e.target.value)} placeholder="Detalles del evento..."/>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-rose-50 rounded-xl border border-rose-100">
            <input type="checkbox" checked={form.notificarCliente} onChange={e=>setField('notificarCliente',e.target.checked)} className="w-4 h-4 accent-rose-500"/>
            <div>
              <p className="text-sm font-medium text-rose-700">Visible en el panel del cliente</p>
              <p className="text-xs text-rose-500">El cliente verá este recordatorio en su panel</p>
            </div>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}><Bell size={13}/> Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
