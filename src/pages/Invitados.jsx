import { useEffect, useState, useRef } from 'react'
import { Users, Plus, Search, X, AlertTriangle, Upload, Download,
  FileSpreadsheet, Check, Edit2, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../lib/AuthContext'
import { subscribeToInvitados, addInvitado, updateInvitado, deleteInvitado, addManyInvitados } from '../lib/db'
import { buildMessage, openWhatsApp, needsFollowUp, MESSAGE_TYPES } from '../lib/whatsapp'
import { parseGuestsFromFile, downloadExcelTemplate } from '../lib/excel'
import { Button, Badge, Input, Select, Modal, EmptyState, Alert, Card } from '../components/ui'

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Sin confirmar', color: 'bg-gold-50 text-gold-700 border-gold-200' },
  { value: 'confirmed', label: 'Confirmado ✓',  color: 'bg-sage-50 text-sage-700 border-sage-200' },
  { value: 'declined',  label: 'No asiste',      color: 'bg-ink-50 text-ink-500 border-ink-200'   },
]

const MENU_OPTIONS = ['Sin TACC','Vegano','Vegetariano','Kosher','Sin lactosa','Diabético','Otro']

// ─── Helpers para Google Drive / Sheets ───────────────────────────────────────
function extractGoogleId(url) {
  // Sheets: /spreadsheets/d/ID/  or  /spreadsheets/d/ID?
  const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (sheetsMatch) return { type: 'sheets', id: sheetsMatch[1] }
  // Drive file: /file/d/ID/  or  id=ID
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (driveMatch) return { type: 'drive', id: driveMatch[1] }
  return null
}

function buildExportUrl(id, type) {
  if (type === 'sheets') {
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`
  }
  return `https://drive.google.com/uc?export=download&id=${id}`
}

// ─── Importar Excel ────────────────────────────────────────────────────────────
function ImportPanel({ eventoId, onDone }) {
  const { user } = useAuth()
  const inputRef = useRef()
  const [preview,   setPreview]   = useState(null)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [importing, setImporting] = useState(false)
  const [done,      setDone]      = useState(false)
  const [drag,      setDrag]      = useState(false)
  const [tab,       setTab]       = useState('archivo') // 'archivo' | 'link'
  const [driveUrl,  setDriveUrl]  = useState('')
  const [loadingUrl,setLoadingUrl]= useState(false)

  async function handleFile(file) {
    if (!file) return
    setLoading(true); setError(''); setPreview(null); setDone(false)
    try { setPreview(await parseGuestsFromFile(file)) }
    catch (e) { setError(e.message) }
    setLoading(false)
  }

  async function handleUrlImport() {
    if (!driveUrl.trim()) return
    setLoadingUrl(true); setError(''); setPreview(null)
    try {
      const parsed = extractGoogleId(driveUrl.trim())
      if (!parsed) throw new Error('Link no reconocido. Debe ser un link de Google Sheets o Google Drive.')

      const exportUrl = buildExportUrl(parsed.id, parsed.type)

      // Fetch via CORS proxy since Drive requires auth
      // We use allorigins as a fallback proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(exportUrl)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error('No se pudo acceder al archivo. Asegurate de que el archivo sea público (cualquiera con el link puede ver).')

      const blob = await res.blob()
      const file = new File([blob], 'invitados.xlsx', { type: blob.type })
      setPreview(await parseGuestsFromFile(file))
    } catch(e) {
      setError(e.message)
    }
    setLoadingUrl(false)
  }

  async function handleImport() {
    if (!preview?.guests?.length) return
    setImporting(true)
    await addManyInvitados(user.uid, eventoId, preview.guests)
    setImporting(false); setDone(true)
    setTimeout(() => { setPreview(null); setDone(false); onDone?.() }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Modelo descargable */}
      <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-xl">
        <div>
          <p className="text-sm font-medium text-rose-700">Descargá el modelo</p>
          <p className="text-xs text-rose-500 mt-0.5">Excel con columnas correctas e instrucciones incluidas</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadExcelTemplate}><Download size={13}/> Descargar</Button>
      </div>

      {/* Tabs archivo / link */}
      <div className="flex gap-1 bg-ink-50 p-1 rounded-xl">
        <button onClick={()=>setTab('archivo')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab==='archivo'?'bg-white text-rose-700 shadow-sm':'text-ink-500 hover:text-ink-700'}`}>
          📎 Subir archivo
        </button>
        <button onClick={()=>setTab('link')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab==='link'?'bg-white text-rose-700 shadow-sm':'text-ink-500 hover:text-ink-700'}`}>
          🔗 Link de Drive / Sheets
        </button>
      </div>

      {/* Tab: archivo */}
      {tab === 'archivo' && (
        <div>
          <div
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)}
            onClick={()=>!preview&&inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${drag?'border-rose-400 bg-rose-50':preview?'border-sage-300 bg-sage-50 cursor-default':'border-ink-200 hover:border-rose-300 hover:bg-rose-50'}`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"/>
                <p className="text-sm text-ink-500">Leyendo archivo...</p>
              </div>
            ) : done ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center"><Check size={24} className="text-sage-600"/></div>
                <p className="text-sm font-medium text-sage-700">¡Importados correctamente!</p>
              </div>
            ) : preview ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={32} className="text-sage-500"/>
                <p className="text-sm font-medium text-sage-700">{preview.total} invitados detectados</p>
                <p className="text-xs text-ink-400">{preview.withPhone} con WhatsApp</p>
                <button onClick={e=>{e.stopPropagation();setPreview(null)}} className="text-xs text-ink-400 hover:text-red-500 underline">Cambiar</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-rose-300"/>
                <p className="text-sm font-medium text-ink-600">Arrastrá el archivo o hacé clic</p>
                <p className="text-xs text-ink-400">.xlsx · .xls · .csv</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
        </div>
      )}

      {/* Tab: link */}
      {tab === 'link' && (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
            <p className="font-medium">⚠️ El archivo debe ser público</p>
            <p>En Google Sheets: Compartir → Cualquier persona con el link puede <strong>ver</strong></p>
            <p>En Google Drive: clic derecho → Compartir → Cualquier persona con el link</p>
          </div>
          <div className="flex gap-2">
            <input
              value={driveUrl}
              onChange={e=>{ setDriveUrl(e.target.value); setError('') }}
              onKeyDown={e=>e.key==='Enter'&&handleUrlImport()}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 px-3 py-2 text-sm border border-ink-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <Button onClick={handleUrlImport} loading={loadingUrl} size="sm">
              Cargar
            </Button>
          </div>
          {loadingUrl && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"/>
              Descargando archivo de Google...
            </div>
          )}
          {preview && !loadingUrl && (
            <div className="flex items-center gap-2 p-3 bg-sage-50 border border-sage-200 rounded-xl text-sm text-sage-700">
              <Check size={14}/>
              <strong>{preview.total} invitados</strong> detectados · {preview.withPhone} con WhatsApp
              <button onClick={()=>setPreview(null)} className="ml-auto text-ink-400 hover:text-red-400 text-xs">Limpiar</button>
            </div>
          )}
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {preview?.guests?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-500 mb-2">Vista previa</p>
          <div className="bg-ink-50 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-ink-200">
                <th className="px-3 py-2 text-left text-ink-400">Nombre</th>
                <th className="px-3 py-2 text-left text-ink-400">WhatsApp</th>
                <th className="px-3 py-2 text-left text-ink-400">Cant.</th>
                <th className="px-3 py-2 text-left text-ink-400">Menú</th>
              </tr></thead>
              <tbody className="divide-y divide-ink-100">
                {preview.guests.slice(0,6).map((g,i)=>(
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium text-ink-800">{g.fullName}</td>
                    <td className="px-3 py-2 text-ink-500">{g.whatsapp||'—'}</td>
                    <td className="px-3 py-2 text-ink-600">{g.cantidad||g.lugares||1}</td>
                    <td className="px-3 py-2">{g.menu?<span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">{g.menu}</span>:'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.total>6&&<p className="px-3 py-2 text-xs text-ink-400 border-t border-ink-200">...y {preview.total-6} más</p>}
          </div>
        </div>
      )}
      {preview&&<div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={()=>setPreview(null)}>Cancelar</Button>
        <Button onClick={handleImport} loading={importing}><Upload size={13}/> Importar {preview.total} invitados</Button>
      </div>}
    </div>
  )
}

// ─── Modal editar invitado ─────────────────────────────────────────────────────
function EditModal({ guest, eventoId, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ ...guest })
  const [saving, setSaving] = useState(false)

  function set(k,v){ setForm(f=>({...f,[k]:v})) }

  async function handleSave() {
    setSaving(true)
    await updateInvitado(user.uid, eventoId, guest.id, {
      ...form,
      fullName: [form.nombre, form.apellido].filter(Boolean).join(' ') || form.fullName,
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Editar invitado" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" value={form.nombre||''} onChange={e=>set('nombre',e.target.value)}/>
          <Input label="Apellido" value={form.apellido||''} onChange={e=>set('apellido',e.target.value)}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="WhatsApp" placeholder="1112345678" value={form.whatsapp||''} onChange={e=>set('whatsapp',e.target.value)}/>
          <Input label="Email" type="email" value={form.email||''} onChange={e=>set('email',e.target.value)}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Cantidad de invitados" type="number" min="1" value={form.cantidad||form.lugares||1} onChange={e=>set('cantidad',parseInt(e.target.value)||1)}/>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-ink-500">Menú / Restricción</label>
            <input
              list="menu-options"
              value={form.menu||''}
              onChange={e=>set('menu',e.target.value)}
              placeholder="Sin TACC, Vegano..."
              className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"
            />
            <datalist id="menu-options">{MENU_OPTIONS.map(m=><option key={m} value={m}/>)}</datalist>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1">Estado</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s=>(
              <button key={s.value} onClick={()=>set('status',s.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.status===s.value?'ring-2 ring-rose-400 '+s.color:s.color+' opacity-60 hover:opacity-100'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <Input label="Notas" value={form.notas||''} onChange={e=>set('notas',e.target.value)}/>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>Guardar cambios</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Exportar funciones ────────────────────────────────────────────────────────
function exportToExcel(guests, eventoNombre) {
  const rows = guests.map(g=>({
    'Nombre completo': g.fullName,
    'WhatsApp':        g.whatsapp||'',
    'Email':           g.email||'',
    'Cant. invitados': g.cantidad||g.lugares||1,
    'Menú/Restricción':g.menu||'',
    'Estado':          STATUS_OPTIONS.find(s=>s.value===g.status)?.label||g.status,
    'Notas':           g.notas||'',
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{wch:25},{wch:15},{wch:25},{wch:8},{wch:20},{wch:15},{wch:30}]
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados')
  XLSX.writeFile(wb, `invitados_${eventoNombre||'evento'}.xlsx`)
}

function exportToPDF(guests, eventoNombre) {
  const html = `
    <html><head><style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:20px}
      h1{font-size:16px;color:#A0607E;margin-bottom:4px}
      p{color:#888;margin:0 0 16px}
      table{width:100%;border-collapse:collapse}
      th{background:#F5E6EF;color:#593047;padding:8px;text-align:left;font-size:10px;text-transform:uppercase}
      td{padding:7px 8px;border-bottom:1px solid #F0EBF5;font-size:11px}
      tr:nth-child(even)td{background:#FDFAFD}
      .confirmed{color:#3A5236;background:#DBE8D7;padding:2px 8px;border-radius:12px;font-size:10px}
      .pending{color:#6D520F;background:#FAEFD4;padding:2px 8px;border-radius:12px;font-size:10px}
      .declined{color:#444;background:#F0EBF5;padding:2px 8px;border-radius:12px;font-size:10px}
    </style></head><body>
      <h1>Lista de Invitados — ${eventoNombre||'Evento'}</h1>
      <p>Total: ${guests.length} invitados · Confirmados: ${guests.filter(g=>g.status==='confirmed').length} · Sin confirmar: ${guests.filter(g=>g.status==='pending').length}</p>
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>WhatsApp</th><th>Cant.</th><th>Menú</th><th>Estado</th><th>Notas</th></tr></thead>
        <tbody>${guests.map((g,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><strong>${g.fullName}</strong></td>
            <td>${g.whatsapp||'—'}</td>
            <td style="text-align:center">${g.cantidad||g.lugares||1}</td>
            <td>${g.menu||'—'}</td>
            <td><span class="${g.status}">${STATUS_OPTIONS.find(s=>s.value===g.status)?.label||g.status}</span></td>
            <td>${g.notas||'—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`
  const w = window.open('','_blank')
  w.document.write(html)
  w.document.close()
  setTimeout(()=>w.print(), 500)
}

// ─── Tabla sorteable ───────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronUp size={12} className="text-ink-300 opacity-0 group-hover:opacity-100"/>
  return sortDir==='asc' ? <ChevronUp size={12} className="text-rose-500"/> : <ChevronDown size={12} className="text-rose-500"/>
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Invitados({ eventoId, evento }) {
  const { user } = useAuth()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMenu, setFilterMenu]     = useState('all')
  const [sortCol, setSortCol]   = useState('fullName')
  const [sortDir, setSortDir]   = useState('asc')
  const [showImport, setShowImport] = useState(false)
  const [showAdd, setShowAdd]       = useState(false)
  const [editGuest, setEditGuest]   = useState(null)
  const [newGuest, setNewGuest] = useState({ nombre:'', apellido:'', whatsapp:'', email:'', cantidad:1, menu:'', notas:'' })
  const [addError, setAddError] = useState('')
  const [adding, setAdding]     = useState(false)

  useEffect(()=>{
    if(!user?.uid||!eventoId) return
    return subscribeToInvitados(user.uid, eventoId, data=>{ setGuests(data); setLoading(false) })
  },[user?.uid, eventoId])

  async function handleAdd() {
    if(!newGuest.nombre.trim()){ setAddError('El nombre es requerido'); return }
    setAdding(true)
    await addInvitado(user.uid, eventoId, {
      ...newGuest,
      fullName:[newGuest.nombre,newGuest.apellido].filter(Boolean).join(' '),
      status:'pending', lastContact:null,
    })
    setAdding(false); setShowAdd(false)
    setNewGuest({nombre:'',apellido:'',whatsapp:'',email:'',cantidad:1,menu:'',notas:''})
    setAddError('')
  }

  async function handleStatusChange(gid, status) {
    await updateInvitado(user.uid, eventoId, gid, { status,
      lastContact: status==='confirmed' ? ts() : undefined })
  }

  async function handleDelete(gid) {
    if(!confirm('¿Eliminar invitado?')) return
    await deleteInvitado(user.uid, eventoId, gid)
  }

  function toggleSort(col) {
    if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const menus = [...new Set(guests.filter(g=>g.menu).map(g=>g.menu))]

  const filtered = guests
    .filter(g=>{
      if(filterStatus!=='all' && g.status!==filterStatus) return false
      if(filterMenu!=='all' && g.menu!==filterMenu) return false
      if(search){
        const q=search.toLowerCase()
        return g.fullName?.toLowerCase().includes(q)||g.whatsapp?.includes(q)||g.email?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a,b)=>{
      let va=a[sortCol]||'', vb=b[sortCol]||''
      if(sortCol==='cantidad'||sortCol==='lugares'){ va=parseInt(a.cantidad||a.lugares||1); vb=parseInt(b.cantidad||b.lugares||1) }
      const r = typeof va==='number' ? va-vb : String(va).localeCompare(String(vb),'es')
      return sortDir==='asc'?r:-r
    })

  const stats = {
    total:      guests.length,
    confirmed:  guests.filter(g=>g.status==='confirmed').length,
    pending:    guests.filter(g=>g.status==='pending').length,
    declined:   guests.filter(g=>g.status==='declined').length,
    alert:      guests.filter(needsFollowUp).length,
  }

  const COLS = [
    { key:'fullName', label:'Nombre' },
    { key:'whatsapp', label:'WhatsApp' },
    { key:'cantidad', label:'Cant. invitados' },
    { key:'menu',     label:'Menú' },
    { key:'status',   label:'Estado' },
  ]

  return (
    <div className="p-6 fade-in">
      {/* Stats chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { key:'all',       label:`Todos (${stats.total})` },
          { key:'confirmed', label:`✓ Confirmados (${stats.confirmed})` },
          { key:'pending',   label:`Sin confirmar (${stats.pending})` },
          { key:'declined',  label:`No asiste (${stats.declined})` },
          { key:'alert',     label:`⚠ Sin resp. +72hs (${stats.alert})` },
        ].map(f=>(
          <button key={f.key} onClick={()=>setFilterStatus(f.key==='alert'?'pending__alert':f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${(filterStatus===f.key||(f.key==='alert'&&filterStatus==='pending__alert'))
                ?'bg-rose-500 text-white border-rose-500'
                :'bg-white text-ink-500 border-ink-200 hover:border-rose-300'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {stats.alert>0&&<Alert variant="danger" className="mb-4">
        <AlertTriangle size={14} className="inline mr-1"/>
        <strong>{stats.alert} invitado{stats.alert!==1?'s':''}</strong> sin respuesta +72hs
      </Alert>}

      <Card>
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
            <input placeholder="Buscar nombre, teléfono, email..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"/>
          </div>
          {menus.length>0&&(
            <select value={filterMenu} onChange={e=>setFilterMenu(e.target.value)}
              className="text-xs px-3 py-2 border border-ink-200 rounded-lg outline-none focus:border-rose-400 text-ink-600">
              <option value="all">Todos los menús</option>
              {menus.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={()=>exportToPDF(filtered,evento?.nombre)}>PDF</Button>
            <Button variant="outline" size="sm" onClick={()=>exportToExcel(filtered,evento?.nombre)}>Excel</Button>
            <Button variant="outline" size="sm" onClick={()=>setShowImport(true)} className="border-rose-200 text-rose-600 hover:bg-rose-50">
              <FileSpreadsheet size={13}/> Importar
            </Button>
            <Button size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Agregar</Button>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center h-32"><span className="text-sm text-ink-400">Cargando...</span></div>
        ) : filtered.length===0 ? (
          <EmptyState icon={Users}
            title={guests.length===0?'Sin invitados todavía':'Sin resultados'}
            description={guests.length===0?'Importá desde Excel o agregá uno por uno.':''}
            action={guests.length===0&&<div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={()=>setShowImport(true)}><FileSpreadsheet size={13}/> Importar Excel</Button>
              <Button size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Agregar</Button>
            </div>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50">
                  {COLS.map(c=>(
                    <th key={c.key} onClick={()=>toggleSort(c.key)}
                      className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase tracking-wide cursor-pointer hover:text-rose-500 group select-none">
                      <span className="flex items-center gap-1">{c.label}<SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir}/></span>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(g=>{
                  const followUp=needsFollowUp(g)
                  const statusCfg=STATUS_OPTIONS.find(s=>s.value===g.status)||STATUS_OPTIONS[0]
                  return (
                    <tr key={g.id} className={`hover:bg-rose-50 transition-colors ${followUp?'bg-red-50/40':''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink-800">{g.fullName}</div>
                        {g.email&&<div className="text-xs text-ink-400">{g.email}</div>}
                        {g.notas&&<div className="text-xs text-ink-400 italic">{g.notas}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">{g.whatsapp||<span className="text-ink-300">—</span>}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-ink-700">{g.cantidad||g.lugares||1}</td>
                      <td className="px-4 py-3">
                        {g.menu?<Badge variant="pink">{g.menu}</Badge>:<span className="text-xs text-ink-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select value={g.status||'pending'} onChange={e=>handleStatusChange(g.id,e.target.value)}
                          className={`text-xs rounded-full px-3 py-1.5 border font-medium outline-none cursor-pointer ${statusCfg.color}`}>
                          {STATUS_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        {followUp&&<div className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertTriangle size={10}/> +72hs sin resp.</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {g.whatsapp&&(
                            <button className={`btn-wa text-xs ${followUp?'btn-wa-alert':''}`}
                              onClick={()=>openWhatsApp(g.whatsapp, buildMessage({
                                type: followUp?MESSAGE_TYPES.SEGUIMIENTO:MESSAGE_TYPES.PRIMERA_CONFIRMACION,
                                guestName:g.fullName, eventName:evento?.nombre, eventDate:evento?.date,
                                eventTime:evento?.hora, eventPlace:evento?.lugar,
                              }))}>
                              💬 {followUp?'Reenviar':'WA'}
                            </button>
                          )}
                          <button onClick={()=>setEditGuest(g)} className="text-ink-400 hover:text-rose-500 transition-colors p-1"><Edit2 size={14}/></button>
                          <button onClick={()=>handleDelete(g.id)} className="text-ink-300 hover:text-red-400 transition-colors p-1"><X size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-ink-50 text-xs text-ink-400">
              {filtered.length} de {guests.length} invitados
              {filtered.length!==guests.length&&' (filtrado)'}
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <Modal open={showImport} onClose={()=>setShowImport(false)} title="Importar invitados desde Excel" size="lg">
        <ImportPanel eventoId={eventoId} onDone={()=>setShowImport(false)}/>
      </Modal>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Agregar invitado" size="md">
        <div className="space-y-4">
          {addError&&<Alert variant="danger">{addError}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre *" value={newGuest.nombre} onChange={e=>setNewGuest(g=>({...g,nombre:e.target.value}))}/>
            <Input label="Apellido" value={newGuest.apellido} onChange={e=>setNewGuest(g=>({...g,apellido:e.target.value}))}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="WhatsApp" placeholder="1112345678" value={newGuest.whatsapp} onChange={e=>setNewGuest(g=>({...g,whatsapp:e.target.value}))}/>
            <Input label="Email" type="email" value={newGuest.email} onChange={e=>setNewGuest(g=>({...g,email:e.target.value}))}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cantidad de invitados" type="number" min="1" value={newGuest.cantidad} onChange={e=>setNewGuest(g=>({...g,cantidad:parseInt(e.target.value)||1}))}/>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-ink-500">Menú / Restricción</label>
              <input list="menu-opts-add" value={newGuest.menu} onChange={e=>setNewGuest(g=>({...g,menu:e.target.value}))} placeholder="Sin TACC, Vegano..."
                className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"/>
              <datalist id="menu-opts-add">{MENU_OPTIONS.map(m=><option key={m} value={m}/>)}</datalist>
            </div>
          </div>
          <Input label="Notas" value={newGuest.notas} onChange={e=>setNewGuest(g=>({...g,notas:e.target.value}))}/>
          <p className="text-xs text-ink-400">📱 WhatsApp: <code className="bg-ink-100 px-1 rounded">1112345678</code> · <code className="bg-ink-100 px-1 rounded">11 1234-5678</code> · <code className="bg-ink-100 px-1 rounded">+54 9 11...</code></p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={()=>setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAdd} loading={adding}>Agregar invitado</Button>
          </div>
        </div>
      </Modal>

      {editGuest&&<EditModal guest={editGuest} eventoId={eventoId} onClose={()=>setEditGuest(null)}/>}
    </div>
  )
}

function ts(){ return new Date().toISOString() }
