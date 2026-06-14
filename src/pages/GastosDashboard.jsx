import { useEffect, useState } from 'react'
import { Plus, Trash2, TrendingUp, DollarSign, Receipt, PieChart, ArrowRight, Edit2, Check, RefreshCw } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToGastos, createGasto, deleteGasto, updateGasto, subscribeToBudget, saveBudget, subscribeToCotizacion } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, Button, Input, Select, Modal } from '../components/ui'

const CATEGORIAS = ['Salón','Catering','Música / DJ','Fotografía','Decoración','Papelería','Transporte','Indumentaria','Torta','Otro']
const MONEDAS    = [{ value:'ARS', label:'$ ARS - Pesos' }, { value:'USD', label:'USD - Dólares' }, { value:'EUR', label:'EUR - Euros' }]
const TIPOS = [
  { value:'presupuestado', label:'En proceso / cotizado', color:'bg-gold-50 text-gold-700 border-gold-200' },
  { value:'confirmado',    label:'Confirmado ✓',          color:'bg-sage-50 text-sage-700 border-sage-200' },
]
const COLORS = ['#A0607E','#5A7A54','#D4A853','#7A6C9E','#4A9B8C','#C4774A','#6B9FC4','#B85A7A','#7AAD58','#9B8B4A']

function parseNum(v){ return parseFloat(String(v||0).replace(/[^0-9.]/g,''))||0 }
function fmtARS(v){
  const n=parseNum(v)
  return '$'+n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0})
}
function fmtOrig(v, moneda='ARS'){
  const n=parseNum(v)
  const sym = moneda==='USD'?'USD ':moneda==='EUR'?'EUR ':'$'
  return sym+n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0})
}

function toARS(valor, moneda, cotizacion){
  const n = parseNum(valor)
  if(moneda==='USD') return n * (cotizacion?.usd||1)
  if(moneda==='EUR') return n * (cotizacion?.eur||1)
  return n
}

function PieChartSVG({ data, total }) {
  if(!data.length||!total) return <div className="flex items-center justify-center h-40 text-ink-300 text-sm">Sin datos</div>
  let cum=0
  const slices=data.map((d,i)=>{
    const pct=d.value/total
    const s=cum*2*Math.PI-Math.PI/2; cum+=pct; const e=cum*2*Math.PI-Math.PI/2
    return{...d,x1:50+40*Math.cos(s),y1:50+40*Math.sin(s),x2:50+40*Math.cos(e),y2:50+40*Math.sin(e),la:pct>0.5?1:0,color:COLORS[i%COLORS.length],pct}
  })
  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40">
      {slices.map((s,i)=>(
        <path key={i} d={`M50 50 L${s.x1} ${s.y1} A40 40 0 ${s.la} 1 ${s.x2} ${s.y2} Z`} fill={s.color} stroke="white" strokeWidth="0.5"/>
      ))}
      <circle cx="50" cy="50" r="22" fill="white"/>
      <text x="50" y="48" textAnchor="middle" fontSize="5.5" fill="#6B6478">Gastado</text>
      <text x="50" y="57" textAnchor="middle" fontSize="6.5" fill="#2C2A35" fontWeight="bold">
        {total>=1000000?(total/1000000).toFixed(1)+'M':total>=1000?(total/1000).toFixed(0)+'k':Math.round(total)}
      </text>
    </svg>
  )
}

function BudgetBar({ gastado, presupuesto }) {
  if(!presupuesto) return null
  const pct = Math.min(100, Math.round((gastado/presupuesto)*100))
  const over = gastado > presupuesto
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-ink-500">Ejecutado: <strong>{fmtARS(gastado)}</strong></span>
        <span className={over?'text-red-600 font-medium':'text-ink-500'}>
          {over?`Excedido ${fmtARS(gastado-presupuesto)}`:`Disponible: ${fmtARS(presupuesto-gastado)}`}
        </span>
      </div>
      <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${over?'bg-red-400':'bg-rose-400'}`} style={{width:`${pct}%`}}/>
      </div>
      <div className="flex justify-between text-[10px] text-ink-400 mt-1">
        <span>$0</span><span className="font-medium">{pct}%</span><span>Presup: {fmtARS(presupuesto)}</span>
      </div>
    </div>
  )
}

const emptyForm = { titulo:'', valor:'', moneda:'ARS', categoria:'Otro', tipo:'presupuestado', fecha:new Date().toISOString().slice(0,10), notas:'' }

export default function GastosDashboard({ eventoId }) {
  const { user, hideComisiones } = useAuth()
  const [gastos,      setGastos]     = useState([])
  const [budget,      setBudget]     = useState({})
  const [cotizacion,  setCotizacion] = useState({ usd:1000, eur:1100 })
  const [showModal,   setShowModal]  = useState(false)
  const [form,        setForm]       = useState(emptyForm)
  const [saving,      setSaving]     = useState(false)
  const [activeTab,   setActiveTab]  = useState('todos')
  const [editGasto,   setEditGasto]  = useState(null)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput]     = useState('')
  const [showCotiz,   setShowCotiz]       = useState(false)

  useEffect(()=>{
    if(!user?.uid||!eventoId) return
    const u1=subscribeToGastos(user.uid, eventoId, setGastos)
    const u2=subscribeToBudget(user.uid, eventoId, d=>{ setBudget(d); setBudgetInput(d.total||'') })
    const u3=subscribeToCotizacion(user.uid, setCotizacion)
    return()=>{ u1(); u2(); u3() }
  },[user?.uid, eventoId])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  async function handleSave(){
    if(!form.titulo.trim()||!form.valor) return
    setSaving(true)
    if(editGasto) await updateGasto(user.uid, eventoId, editGasto.id, form)
    else          await createGasto(user.uid, eventoId, form)
    setSaving(false); setShowModal(false); setEditGasto(null); setForm(emptyForm)
  }

  async function moveTo(g, tipo){ await updateGasto(user.uid, eventoId, g.id, { tipo }) }

  async function saveBudgetTotal(){
    await saveBudget(user.uid, eventoId, { total: budgetInput })
    setEditingBudget(false)
  }

  // Convert all to ARS for totals
  const confirmados  = gastos.filter(g=>g.tipo==='confirmado')
  const enProceso    = gastos.filter(g=>g.tipo==='presupuestado')
  const totalConf    = confirmados.reduce((s,g)=>s+toARS(g.valor,g.moneda,cotizacion),0)
  const totalProceso = enProceso.reduce((s,g)=>s+toARS(g.valor,g.moneda,cotizacion),0)
  const presupCliente= parseNum(budget.total)

  const byCat={}
  confirmados.forEach(g=>{ byCat[g.categoria]=(byCat[g.categoria]||0)+toARS(g.valor,g.moneda,cotizacion) })
  const pieData=Object.entries(byCat).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,8)

  const displayList = activeTab==='confirmados'?confirmados:activeTab==='proceso'?enProceso:gastos

  return (
    <div className="p-6 fade-in space-y-6">
      {/* Cotización */}
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <RefreshCw size={11}/>
        <span>USD={fmtARS(cotizacion.usd)} · EUR={fmtARS(cotizacion.eur)}</span>
        <button onClick={()=>setShowCotiz(true)} className="text-rose-500 hover:underline">Actualizar</button>
      </div>

      {/* Presupuesto del cliente */}
      <Card>
        <CardHeader action={
          editingBudget?(
            <div className="flex gap-2 items-center">
              <input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} className="w-32 px-2 py-1 text-sm border border-rose-300 rounded-lg outline-none" placeholder="0"/>
              <Button size="xs" onClick={saveBudgetTotal}><Check size={11}/> OK</Button>
              <Button size="xs" variant="outline" onClick={()=>setEditingBudget(false)}>✕</Button>
            </div>
          ):(
            <Button variant="ghost" size="sm" onClick={()=>setEditingBudget(true)}>
              <Edit2 size={12}/> {presupCliente?`Presup: ${fmtARS(presupCliente)}`:'Cargar presupuesto del cliente'}
            </Button>
          )
        }>
          <DollarSign size={15} className="text-rose-400"/> Presupuesto del cliente
        </CardHeader>
        {presupCliente>0&&<CardBody><BudgetBar gastado={totalConf} presupuesto={presupCliente}/></CardBody>}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center"><Check size={18} className="text-sage-600"/></div>
          <div><p className="text-xs text-ink-400">Gastos confirmados (ARS)</p><p className="text-lg font-serif text-sage-700">{fmtARS(totalConf)}</p><p className="text-[10px] text-ink-400">{confirmados.length} ítems</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center"><Receipt size={18} className="text-gold-600"/></div>
          <div><p className="text-xs text-ink-400">En proceso / cotizado</p><p className="text-lg font-serif text-gold-700">{fmtARS(totalProceso)}</p><p className="text-[10px] text-ink-400">{enProceso.length} ítems</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center"><TrendingUp size={18} className="text-ink-400"/></div>
          <div><p className="text-xs text-ink-400">Total general (ARS)</p><p className="text-lg font-serif text-ink-800">{fmtARS(totalConf+totalProceso)}</p></div>
        </CardBody></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Torta */}
        <Card>
          <CardHeader><PieChart size={15} className="text-rose-400"/> Por categoría</CardHeader>
          <CardBody>
            <div className="flex flex-col items-center gap-3">
              <PieChartSVG data={pieData} total={totalConf}/>
              <div className="w-full space-y-1">
                {pieData.map((d,i)=>(
                  <div key={d.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                    <span className="text-xs text-ink-600 flex-1 truncate">{d.label}</span>
                    <span className="text-xs text-ink-400">{totalConf?Math.round(d.value/totalConf*100):0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista */}
        <Card className="lg:col-span-2">
          <CardHeader action={<Button size="sm" onClick={()=>{ setEditGasto(null); setForm(emptyForm); setShowModal(true) }}><Plus size={13}/> Agregar</Button>}>
            <div className="flex gap-1 flex-wrap">
              {[{key:'todos',label:`Todos (${gastos.length})`},{key:'confirmados',label:`Confirmados (${confirmados.length})`},{key:'proceso',label:`En proceso (${enProceso.length})`}]
                .map(t=>(
                  <button key={t.key} onClick={()=>setActiveTab(t.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeTab===t.key?'bg-rose-500 text-white':'text-ink-500 hover:bg-rose-50'}`}>
                    {t.label}
                  </button>
                ))}
            </div>
          </CardHeader>
          {displayList.length===0?(
            <div className="py-10 text-center text-sm text-ink-400">Sin ítems</div>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-ink-100 bg-ink-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Concepto</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Cat.</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Estado</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-400 uppercase">Monto orig.</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-400 uppercase">ARS</th>
                  <th className="px-4 py-2.5 w-20"></th>
                </tr></thead>
                <tbody className="divide-y divide-ink-50">
                  {displayList.map(g=>{
                    const tc=TIPOS.find(t=>t.value===g.tipo)||TIPOS[0]
                    const arsVal = toARS(g.valor, g.moneda, cotizacion)
                    const isConverted = g.moneda && g.moneda!=='ARS'
                    return (
                      <tr key={g.id} className="hover:bg-rose-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink-800">{g.titulo}</div>
                          {g.notas&&<div className="text-xs text-ink-400">{g.notas}</div>}
                        </td>
                        <td className="px-4 py-3"><Badge variant="gray" className="text-[10px]">{g.categoria}</Badge></td>
                        <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tc.color}`}>{tc.label}</span></td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-ink-800">{fmtOrig(g.valor, g.moneda)}</span>
                          {isConverted&&<span className="block text-[10px] text-ink-400">{g.moneda}</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isConverted
                            ? <span className="text-xs font-medium text-ink-600">{fmtARS(arsVal)}</span>
                            : <span className="text-xs text-ink-400">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {g.tipo==='presupuestado'&&<button onClick={()=>moveTo(g,'confirmado')} title="Confirmar" className="text-sage-500 hover:text-sage-700 p-1"><ArrowRight size={13}/></button>}
                            {g.tipo==='confirmado'&&<button onClick={()=>moveTo(g,'presupuestado')} title="Volver" className="text-gold-500 p-1 text-xs">↩</button>}
                            <button onClick={()=>{ setEditGasto(g); setForm({...g}); setShowModal(true) }} className="text-ink-400 hover:text-rose-500 p-1"><Edit2 size={13}/></button>
                            <button onClick={()=>{ if(confirm('¿Eliminar?')) deleteGasto(user.uid,eventoId,g.id) }} className="text-ink-300 hover:text-red-400 p-1"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot><tr className="border-t-2 border-ink-200">
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-ink-600">Total en ARS</td>
                  <td/>
                  <td className="px-4 py-3 text-right text-base font-serif font-medium text-ink-800">
                    {fmtARS(displayList.reduce((s,g)=>s+toARS(g.valor,g.moneda,cotizacion),0))}
                  </td>
                  <td/>
                </tr></tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal gasto */}
      <Modal open={showModal} onClose={()=>{ setShowModal(false); setEditGasto(null); setForm(emptyForm) }}
        title={editGasto?'Editar':'Cargar gasto / cotización'} size="md">
        <div className="space-y-4">
          <div className="flex gap-2">
            {TIPOS.map(t=>(
              <button key={t.value} onClick={()=>setField('tipo',t.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.tipo===t.value?'ring-2 ring-rose-400 '+t.color:t.color+' opacity-60 hover:opacity-100'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <Input label="Título / concepto *" value={form.titulo} onChange={e=>setField('titulo',e.target.value)} placeholder="Ej: Seña DJ Maxime"/>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Input label="Valor *" type="number" value={form.valor} onChange={e=>setField('valor',e.target.value)}/></div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Moneda</label>
              <select value={form.moneda||'ARS'} onChange={e=>setField('moneda',e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400">
                {MONEDAS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          {form.moneda&&form.moneda!=='ARS'&&form.valor&&(
            <div className="text-xs bg-gold-50 border border-gold-100 rounded-xl px-3 py-2 text-gold-700">
              ≈ {fmtARS(toARS(form.valor, form.moneda, cotizacion))} ARS (cotización actual)
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Categoría</label>
              <select value={form.categoria} onChange={e=>setField('categoria',e.target.value)}
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400">
                {CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e=>setField('fecha',e.target.value)}/>
          </div>
          <Input label="Notas" value={form.notas} onChange={e=>setField('notas',e.target.value)}/>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={()=>{ setShowModal(false); setEditGasto(null); setForm(emptyForm) }}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Guardar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal cotización rápida */}
      <Modal open={showCotiz} onClose={()=>setShowCotiz(false)} title="Actualizar cotización" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="1 USD = $ ARS" type="number" value={cotizacion.usd} onChange={e=>setCotizacion(c=>({...c,usd:parseFloat(e.target.value)||0}))}/>
            <Input label="1 EUR = $ ARS" type="number" value={cotizacion.eur} onChange={e=>setCotizacion(c=>({...c,eur:parseFloat(e.target.value)||0}))}/>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={()=>setShowCotiz(false)}>Cancelar</Button>
            <Button onClick={async()=>{ await saveBudget(user.uid, 'cotizacion__'+user.uid, {}); await import('../lib/db').then(({saveCotizacion})=>saveCotizacion(user.uid, cotizacion)); setShowCotiz(false) }}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
