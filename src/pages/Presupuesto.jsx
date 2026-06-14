import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, FolderOpen, Folder, ChevronRight, ChevronDown,
  FileText, Upload, Download, Edit2, ArrowRight, Check, DollarSign } from 'lucide-react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import {
  subscribeToRubros, createRubro, updateRubro, deleteRubro,
  addRubroItem, updateRubroItem, deleteRubroItem,
  subscribeToGastos, createGasto, deleteGasto, updateGasto
} from '../lib/db'
import { Card, CardHeader, CardBody, Button, Input, Select, Modal, Alert, Badge } from '../components/ui'

const RUBROS_DEFAULT = ['Salón','Catering','Música / DJ','Fotografía y video','Decoración','Papelería / Invitaciones','Transporte','Indumentaria','Torta','Iluminación / Sonido','Otro']
const MONEDAS = ['ARS $','USD $','EUR €']
const ESTADOS_ITEM = [
  { value:'presupuestado', label:'Presupuestado', color:'bg-gold-50 text-gold-700 border-gold-200' },
  { value:'confirmado',    label:'Confirmado ✓',  color:'bg-sage-50 text-sage-700 border-sage-200' },
  { value:'pagado',        label:'Pagado',         color:'bg-ink-100 text-ink-600 border-ink-200'   },
]

function parseNum(v){ return parseFloat(String(v||0).replace(/[^0-9.]/g,''))||0 }
function fmt(v, moneda='ARS $'){
  const n=parseNum(v); if(!n) return '—'
  const sym = moneda.includes('USD')?'USD ':moneda.includes('EUR')?'EUR ':'$'
  return sym+n.toLocaleString('es-AR',{minimumFractionDigits:0,maximumFractionDigits:0})
}

// ─── Item row dentro de un rubro ───────────────────────────────────────────────
function ItemRow({ item, rubroId, eventoId, onMoveToGastos }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({...item})

  async function save() {
    await updateRubroItem(user.uid, eventoId, rubroId, item.id, form)
    setEditing(false)
  }

  async function del() {
    if(!confirm('¿Eliminar ítem?')) return
    await deleteRubroItem(user.uid, eventoId, rubroId, item.id)
  }

  const estadoCfg = ESTADOS_ITEM.find(e=>e.value===item.estado)||ESTADOS_ITEM[0]

  if(editing) return (
    <tr className="bg-rose-50/30">
      <td className="px-3 py-2" colSpan={2}>
        <Input value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <input value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))}
            className="w-24 px-2 py-1.5 text-xs border border-ink-200 rounded-lg outline-none focus:border-rose-400"/>
          <select value={form.moneda||'ARS $'} onChange={e=>setForm(f=>({...f,moneda:e.target.value}))}
            className="text-xs border border-ink-200 rounded-lg px-1 outline-none">
            {MONEDAS.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </td>
      <td className="px-3 py-2">
        <select value={form.estado||'presupuestado'} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}
          className="text-xs border border-ink-200 rounded-lg px-2 py-1.5 outline-none">
          {ESTADOS_ITEM.map(e=><option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <Button size="xs" onClick={save}><Check size={11}/></Button>
          <Button size="xs" variant="outline" onClick={()=>setEditing(false)}>✕</Button>
        </div>
      </td>
    </tr>
  )

  return (
    <tr className="hover:bg-rose-50/30 transition-colors group">
      <td className="px-3 py-2.5 text-sm text-ink-800">{item.titulo}</td>
      <td className="px-3 py-2.5 text-xs text-ink-400">{item.notas||''}</td>
      <td className="px-3 py-2.5 text-sm font-medium text-ink-800">{fmt(item.valor, item.moneda)}</td>
      <td className="px-3 py-2.5">
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${estadoCfg.color}`}>{estadoCfg.label}</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.estado!=='confirmado'&&item.estado!=='pagado'&&(
            <button onClick={()=>onMoveToGastos(item)} title="Confirmar gasto"
              className="text-sage-500 hover:text-sage-700 p-1 text-xs flex items-center gap-0.5">
              <ArrowRight size={12}/> Confirmar
            </button>
          )}
          <button onClick={()=>setEditing(true)} className="text-ink-400 hover:text-rose-500 p-1"><Edit2 size={13}/></button>
          <button onClick={del} className="text-ink-300 hover:text-red-400 p-1"><Trash2 size={13}/></button>
        </div>
      </td>
    </tr>
  )
}

// ─── Rubro (carpeta) ───────────────────────────────────────────────────────────
function RubroCard({ rubro, eventoId, onMoveToGastos }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ titulo:'', valor:'', moneda:'ARS $', estado:'presupuestado', notas:'' })
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const items = Object.values(rubro.items||{}).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))

  async function addItem() {
    if(!newItem.titulo.trim()) return
    await addRubroItem(user.uid, eventoId, rubro.id, newItem)
    setNewItem({ titulo:'', valor:'', moneda:'ARS $', estado:'presupuestado', notas:'' })
    setShowAdd(false)
  }

  async function uploadDoc(file) {
    if(!file) return
    setUploading(true)
    const path = `users/${user.uid}/eventos/${eventoId}/rubros/${rubro.id}/${Date.now()}_${file.name}`
    const sRef = storageRef(storage, path)
    const task = uploadBytesResumable(sRef, file)
    task.on('state_changed', null, ()=>setUploading(false), async()=>{
      const url = await getDownloadURL(task.snapshot.ref)
      await addRubroItem(user.uid, eventoId, rubro.id, {
        titulo: file.name, tipo:'documento', url, path, size: file.size
      })
      setUploading(false)
    })
  }

  async function delRubro() {
    if(!confirm(`¿Eliminar la carpeta "${rubro.nombre}" y todos sus ítems?`)) return
    await deleteRubro(user.uid, eventoId, rubro.id)
  }

  const total = items.filter(i=>i.tipo!=='documento').reduce((s,i)=>s+parseNum(i.valor),0)
  const confirmados = items.filter(i=>(i.estado==='confirmado'||i.estado==='pagado')&&i.tipo!=='documento').reduce((s,i)=>s+parseNum(i.valor),0)

  return (
    <Card className="overflow-visible">
      {/* Header del rubro */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-rose-50 transition-colors rounded-t-xl"
        onClick={()=>setOpen(o=>!o)}>
        <div className="text-rose-400">{open?<FolderOpen size={18}/>:<Folder size={18}/>}</div>
        <div className="flex-1">
          <span className="text-sm font-medium text-ink-800">{rubro.nombre}</span>
          {total>0&&<span className="text-xs text-ink-400 ml-2">{fmt(total)} total · {fmt(confirmados)} confirmado</span>}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-ink-400">{items.length} ítem{items.length!==1?'s':''}</span>
          {open?<ChevronDown size={14} className="text-ink-400"/>:<ChevronRight size={14} className="text-ink-400"/>}
          <button onClick={e=>{e.stopPropagation();delRubro()}} className="text-ink-300 hover:text-red-400 transition-colors p-1"><Trash2 size={13}/></button>
        </div>
      </div>

      {open&&(
        <div className="border-t border-ink-100">
          {/* Tabla de ítems */}
          {items.filter(i=>i.tipo!=='documento').length>0&&(
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-ink-50 border-b border-ink-100">
                  <th className="px-3 py-2 text-left text-xs text-ink-400 font-medium uppercase">Concepto</th>
                  <th className="px-3 py-2 text-left text-xs text-ink-400 font-medium uppercase">Notas</th>
                  <th className="px-3 py-2 text-left text-xs text-ink-400 font-medium uppercase">Monto</th>
                  <th className="px-3 py-2 text-left text-xs text-ink-400 font-medium uppercase">Estado</th>
                  <th className="px-3 py-2 w-32"></th>
                </tr></thead>
                <tbody className="divide-y divide-ink-50">
                  {items.filter(i=>i.tipo!=='documento').map(item=>(
                    <ItemRow key={item.id} item={item} rubroId={rubro.id} eventoId={eventoId} onMoveToGastos={onMoveToGastos}/>
                  ))}
                </tbody>
                <tfoot><tr className="border-t border-ink-200">
                  <td colSpan={2} className="px-3 py-2 text-xs font-medium text-ink-500">Subtotal rubro</td>
                  <td className="px-3 py-2 text-sm font-serif font-medium text-ink-800">{fmt(total)}</td>
                  <td colSpan={2}/>
                </tr></tfoot>
              </table>
            </div>
          )}

          {/* Documentos adjuntos */}
          {items.filter(i=>i.tipo==='documento').length>0&&(
            <div className="px-4 py-2 border-t border-ink-50 space-y-1">
              <p className="text-xs text-ink-400 font-medium uppercase mb-1">Documentos adjuntos</p>
              {items.filter(i=>i.tipo==='documento').map(doc=>(
                <div key={doc.id} className="flex items-center gap-2 text-xs hover:bg-ink-50 px-2 py-1.5 rounded-lg group">
                  <FileText size={13} className="text-rose-400 flex-shrink-0"/>
                  <span className="flex-1 text-ink-700 truncate">{doc.titulo}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    {doc.url&&<a href={doc.url} target="_blank" rel="noreferrer"><Button variant="ghost" size="xs"><Download size={11}/></Button></a>}
                    <button onClick={async()=>{
                      if(doc.path){const s=storageRef(storage,doc.path);await deleteObject(s).catch(()=>{})}
                      await deleteRubroItem(user.uid,eventoId,rubro.id,doc.id)
                    }} className="text-ink-300 hover:text-red-400 p-1"><Trash2 size={11}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agregar ítem */}
          {showAdd&&(
            <div className="px-4 py-3 border-t border-ink-100 bg-rose-50/30 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Concepto" value={newItem.titulo} onChange={e=>setNewItem(f=>({...f,titulo:e.target.value}))} placeholder="Ej: Seña salón"/>
                <Input label="Notas" value={newItem.notas} onChange={e=>setNewItem(f=>({...f,notas:e.target.value}))} placeholder="Opcional"/>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><Input label="Monto" value={newItem.valor} onChange={e=>setNewItem(f=>({...f,valor:e.target.value}))} placeholder="0"/></div>
                <Select value={newItem.moneda} onChange={e=>setNewItem(f=>({...f,moneda:e.target.value}))} className="w-24">
                  {MONEDAS.map(m=><option key={m} value={m}>{m}</option>)}
                </Select>
                <Select value={newItem.estado} onChange={e=>setNewItem(f=>({...f,estado:e.target.value}))} className="w-36">
                  {ESTADOS_ITEM.map(e=><option key={e.value} value={e.value}>{e.label}</option>)}
                </Select>
                <Button onClick={addItem}>Agregar</Button>
                <Button variant="outline" onClick={()=>setShowAdd(false)}>✕</Button>
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          <div className="px-4 py-2.5 border-t border-ink-100 flex gap-2">
            <Button variant="ghost" size="sm" onClick={()=>setShowAdd(true)}><Plus size={12}/> Agregar ítem</Button>
            <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer transition-all ${uploading?'opacity-50':''}`}>
              <Upload size={12}/> {uploading?'Subiendo...':'Adjuntar PDF'}
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={e=>uploadDoc(e.target.files[0])} disabled={uploading}/>
            </label>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Presupuesto({ eventoId, evento }) {
  const { user } = useAuth()
  const [rubros, setRubros] = useState([])
  const [gastos, setGastos] = useState([])
  const [showNewRubro, setShowNewRubro] = useState(false)
  const [nuevoRubro, setNuevoRubro] = useState('')
  const [rubroCustom, setRubroCustom] = useState('')

  useEffect(()=>{
    if(!user?.uid||!eventoId) return
    const u1 = subscribeToRubros(user.uid, eventoId, setRubros)
    const u2 = subscribeToGastos(user.uid, eventoId, setGastos)
    return ()=>{ u1(); u2() }
  },[user?.uid, eventoId])

  async function handleNewRubro() {
    const nombre = nuevoRubro==='__custom__' ? rubroCustom : nuevoRubro
    if(!nombre.trim()) return
    await createRubro(user.uid, eventoId, { nombre: nombre.trim() })
    setShowNewRubro(false); setNuevoRubro(''); setRubroCustom('')
  }

  // Mover ítem de presupuesto → gastos confirmados
  async function moveToGastos(item, rubroNombre) {
    await createGasto(user.uid, eventoId, {
      titulo:    item.titulo,
      valor:     item.valor,
      moneda:    item.moneda||'ARS $',
      categoria: rubroNombre,
      tipo:      'confirmado',
      fecha:     new Date().toISOString().slice(0,10),
      notas:     item.notas||'',
    })
  }

  const allItems = rubros.flatMap(r=>Object.values(r.items||{}).filter(i=>i.tipo!=='documento'))
  const totalPresup = allItems.reduce((s,i)=>s+parseNum(i.valor),0)
  const totalConfirm = allItems.filter(i=>i.estado==='confirmado'||i.estado==='pagado').reduce((s,i)=>s+parseNum(i.valor),0)
  const totalGastos = gastos.filter(g=>g.tipo==='confirmado').reduce((s,g)=>s+parseNum(g.valor),0)

  return (
    <div className="p-6 fade-in space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center"><DollarSign size={18} className="text-gold-600"/></div>
          <div><p className="text-xs text-ink-400">Total presupuestado</p><p className="text-lg font-serif text-ink-800">{fmt(totalPresup)}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center"><Check size={18} className="text-sage-600"/></div>
          <div><p className="text-xs text-ink-400">Confirmado / acordado</p><p className="text-lg font-serif text-sage-700">{fmt(totalConfirm)}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center"><DollarSign size={18} className="text-rose-500"/></div>
          <div><p className="text-xs text-ink-400">Gastos confirmados</p><p className="text-lg font-serif text-rose-600">{fmt(totalGastos)}</p></div>
        </CardBody></Card>
      </div>

      {/* Rubros */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink-600">Carpetas por rubro</h2>
        <Button size="sm" onClick={()=>setShowNewRubro(true)}><Plus size={13}/> Nueva carpeta</Button>
      </div>

      {rubros.length===0?(
        <Card><div className="py-12 text-center">
          <FolderOpen size={36} className="text-ink-200 mx-auto mb-3" strokeWidth={1.5}/>
          <p className="text-sm text-ink-400">Sin carpetas todavía</p>
          <p className="text-xs text-ink-300 mt-1 mb-4">Creá una carpeta por rubro (Salón, Catering, etc.)</p>
          <Button size="sm" onClick={()=>setShowNewRubro(true)}><Plus size={13}/> Crear primera carpeta</Button>
        </div></Card>
      ):(
        <div className="space-y-3">
          {rubros.map(r=>(
            <RubroCard key={r.id} rubro={r} eventoId={eventoId}
              onMoveToGastos={(item)=>moveToGastos(item, r.nombre)}/>
          ))}
        </div>
      )}

      {/* Modal nuevo rubro */}
      <Modal open={showNewRubro} onClose={()=>setShowNewRubro(false)} title="Nueva carpeta de presupuesto" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">Rubro</label>
            <select value={nuevoRubro} onChange={e=>setNuevoRubro(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400">
              <option value="">— Elegir rubro —</option>
              {RUBROS_DEFAULT.filter(r=>!rubros.some(x=>x.nombre===r)).map(r=><option key={r} value={r}>{r}</option>)}
              <option value="__custom__">✏️ Nombre personalizado...</option>
            </select>
          </div>
          {nuevoRubro==='__custom__'&&(
            <Input label="Nombre del rubro" value={rubroCustom} onChange={e=>setRubroCustom(e.target.value)} placeholder="Ej: Ambientación temática"/>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={()=>setShowNewRubro(false)}>Cancelar</Button>
            <Button onClick={handleNewRubro} disabled={!nuevoRubro||(nuevoRubro==='__custom__'&&!rubroCustom.trim())}>
              <FolderOpen size={13}/> Crear carpeta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
