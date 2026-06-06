import { useEffect, useState } from 'react'
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToPresupuesto, savePresupuesto, subscribeToProveedores } from '../lib/db'
import { Card, CardHeader, CardBody, Button, Input, Select, Textarea, Alert } from '../components/ui'

const emptyItem = { proveedor: '', categoria: '', monto: '', comisionPct: '', notas: '' }

function formatCurrency(val) {
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''))
  if (isNaN(n)) return '—'
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Presupuesto({ eventoId, evento }) {
  const { user } = useAuth()
  const [items, setItems] = useState([emptyItem])
  const [honorarios, setHonorarios] = useState('')
  const [notas, setNotas] = useState('')
  const [estadoPago, setEstadoPago] = useState('pendiente')
  const [proveedores, setProveedores] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    const unsub1 = subscribeToPresupuesto(user.uid, eventoId, data => {
      if (data) {
        setItems(data.items?.length ? data.items : [emptyItem])
        setHonorarios(data.honorarios || '')
        setNotas(data.notas || '')
        setEstadoPago(data.estadoPago || 'pendiente')
      }
    })
    const unsub2 = subscribeToProveedores(user.uid, setProveedores)
    return () => { unsub1(); unsub2() }
  }, [user?.uid, eventoId])

  function setItemField(i, k, v) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
    // Auto-fill comisión if proveedor selected
    if (k === 'proveedor') {
      const prov = proveedores.find(p => p.nombre === v)
      if (prov?.comision) {
        setItems(items.map((item, idx) => idx === i ? { ...item, proveedor: v, comisionPct: prov.comision } : item))
      }
    }
  }

  function addItem() { setItems([...items, { ...emptyItem }]) }
  function removeItem(i) { setItems(items.filter((_, idx) => idx !== i)) }

  const totalBruto = items.reduce((s, item) => {
    const n = parseFloat(String(item.monto).replace(/[^0-9.]/g, ''))
    return s + (isNaN(n) ? 0 : n)
  }, 0)

  const totalComisiones = items.reduce((s, item) => {
    const monto = parseFloat(String(item.monto).replace(/[^0-9.]/g, ''))
    const pct   = parseFloat(String(item.comisionPct).replace(/[^0-9.]/g, ''))
    if (isNaN(monto) || isNaN(pct)) return s
    return s + (monto * pct / 100)
  }, 0)

  const honorariosNum = parseFloat(String(honorarios).replace(/[^0-9.]/g, '')) || 0
  const gananciaTotal = totalComisiones + honorariosNum

  async function handleSave() {
    setSaving(true)
    await savePresupuesto(user.uid, eventoId, { items, honorarios, notas, estadoPago })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Resumen financiero */}
        <Card className="lg:col-span-1">
          <CardHeader><DollarSign size={15} className="text-rose-400" /> Resumen</CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Total evento</span>
              <span className="font-medium text-ink-800">{formatCurrency(totalBruto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Comisiones estimadas</span>
              <span className="font-medium text-sage-700">{formatCurrency(totalComisiones)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">Honorarios</span>
              <span className="font-medium text-sage-700">{formatCurrency(honorariosNum)}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-ink-100">
              <span className="font-medium text-ink-700">Ganancia total</span>
              <span className="text-lg font-serif text-sage-700">{formatCurrency(gananciaTotal)}</span>
            </div>

            <div className="pt-3 space-y-3">
              <Input
                label="Honorarios de la organizadora"
                placeholder="$ 0"
                value={honorarios}
                onChange={e => setHonorarios(e.target.value)}
              />
              <Select
                label="Estado de pago del cliente"
                value={estadoPago}
                onChange={e => setEstadoPago(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="seña">Seña pagada (50%)</option>
                <option value="parcial">Pago parcial</option>
                <option value="completo">Pago completo ✓</option>
              </Select>
              <Textarea
                label="Notas del cliente"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={3}
                placeholder="Requerimientos especiales, acuerdos verbales..."
              />
            </div>
          </CardBody>
        </Card>

        {/* Items del presupuesto */}
        <Card className="lg:col-span-2">
          <CardHeader action={
            <Button size="sm" variant="outline" onClick={addItem}><Plus size={13} /> Agregar ítem</Button>
          }>
            <Receipt size={15} className="text-rose-400" /> Ítems del presupuesto
          </CardHeader>
          <CardBody className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-ink-50/50 rounded-xl">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-xs font-medium text-ink-400 mb-1.5">Proveedor / Concepto</label>}
                  <input
                    list={`proveedores-list-${i}`}
                    value={item.proveedor}
                    onChange={e => setItemField(i, 'proveedor', e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"
                  />
                  <datalist id={`proveedores-list-${i}`}>
                    {proveedores.map(p => <option key={p.id} value={p.nombre} />)}
                  </datalist>
                </div>
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs font-medium text-ink-400 mb-1.5">Monto</label>}
                  <input
                    value={item.monto}
                    onChange={e => setItemField(i, 'monto', e.target.value)}
                    placeholder="$ 0"
                    className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs font-medium text-ink-400 mb-1.5">Comis. %</label>}
                  <input
                    value={item.comisionPct}
                    onChange={e => setItemField(i, 'comisionPct', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg outline-none focus:border-rose-400"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs font-medium text-ink-400 mb-1.5">Comisión $</label>}
                  <div className="px-3 py-2 text-sm text-sage-700 font-medium bg-sage-50 rounded-lg">
                    {(() => {
                      const m = parseFloat(String(item.monto).replace(/[^0-9.]/g, ''))
                      const p = parseFloat(String(item.comisionPct).replace(/[^0-9.]/g, ''))
                      if (isNaN(m) || isNaN(p)) return '—'
                      return '$' + Math.round(m * p / 100).toLocaleString('es-AR')
                    })()}
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-ink-300 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2 gap-3">
              {saved && <span className="text-sm text-sage-600 flex items-center gap-1">✓ Guardado</span>}
              <Button onClick={handleSave} loading={saving}>Guardar presupuesto</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
