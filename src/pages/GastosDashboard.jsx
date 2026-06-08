import { useEffect, useState } from 'react'
import { Plus, Trash2, TrendingUp, DollarSign, Receipt, PieChart } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { subscribeToGastos, createGasto, deleteGasto, subscribeToPresupuesto } from '../lib/db'
import { Card, CardHeader, CardBody, Badge, Button, Input, Select, Modal, Alert } from '../components/ui'

const CATEGORIAS_GASTO = ['Salón', 'Catering', 'Música / DJ', 'Fotografía', 'Decoración', 'Papelería', 'Transporte', 'Indumentaria', 'Imprevistos', 'Otro']
const MONEDAS = ['ARS $', 'USD $', 'EUR €']

const COLORS = ['#A0607E','#5A7A54','#D4A853','#7A6C9E','#4A9B8C','#C4774A','#6B9FC4','#B85A7A','#7AAD58','#9B8B4A']

function PieChartSVG({ data, total }) {
  if (!data.length || !total) return (
    <div className="flex items-center justify-center h-40 text-ink-300 text-sm">Sin datos</div>
  )

  let cumulative = 0
  const slices = data.map((d, i) => {
    const pct = d.value / total
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += pct
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const x1 = 50 + 40 * Math.cos(startAngle)
    const y1 = 50 + 40 * Math.sin(startAngle)
    const x2 = 50 + 40 * Math.cos(endAngle)
    const y2 = 50 + 40 * Math.sin(endAngle)
    const largeArc = pct > 0.5 ? 1 : 0
    return { ...d, x1, y1, x2, y2, largeArc, color: COLORS[i % COLORS.length], pct }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40">
      {slices.map((s, i) => (
        <path
          key={i}
          d={`M50 50 L${s.x1} ${s.y1} A40 40 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`}
          fill={s.color}
          stroke="white"
          strokeWidth="0.5"
        />
      ))}
      <circle cx="50" cy="50" r="22" fill="white" />
      <text x="50" y="47" textAnchor="middle" fontSize="6" fill="#6B6478" fontFamily="DM Sans">Total</text>
      <text x="50" y="55" textAnchor="middle" fontSize="7" fill="#2C2A35" fontFamily="DM Serif Display" fontWeight="bold">
        {total >= 1000000 ? (total/1000000).toFixed(1)+'M' : total >= 1000 ? (total/1000).toFixed(0)+'k' : total}
      </text>
    </svg>
  )
}

const emptyGasto = { titulo: '', valor: '', moneda: 'ARS $', categoria: 'Otro', tipo: 'gasto', fecha: new Date().toISOString().slice(0,10), notas: '' }

export default function GastosDashboard({ eventoId }) {
  const { user } = useAuth()
  const [gastos, setGastos] = useState([])
  const [presupuesto, setPresupuesto] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyGasto)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('gastos')

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    const u1 = subscribeToGastos(user.uid, eventoId, setGastos)
    const u2 = subscribeToPresupuesto(user.uid, eventoId, setPresupuesto)
    return () => { u1(); u2() }
  }, [user?.uid, eventoId])

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.titulo.trim() || !form.valor) return
    setSaving(true)
    await createGasto(user.uid, eventoId, form)
    setSaving(false)
    setShowModal(false)
    setForm(emptyGasto)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar?')) return
    await deleteGasto(user.uid, eventoId, id)
  }

  function parseVal(v) { return parseFloat(String(v || '0').replace(/[^0-9.]/g, '')) || 0 }
  function fmtCurrency(v, moneda = 'ARS $') {
    const n = parseVal(v)
    if (isNaN(n)) return '—'
    const symbol = moneda.includes('USD') ? 'USD ' : moneda.includes('EUR') ? 'EUR ' : '$'
    return symbol + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const soloGastos = gastos.filter(g => g.tipo !== 'presupuestado')
  const soloPresup = gastos.filter(g => g.tipo === 'presupuestado')

  // Totales por moneda ARS
  const totalGastado = soloGastos.filter(g => g.moneda === 'ARS $').reduce((s, g) => s + parseVal(g.valor), 0)
  const totalPresupuestado = soloPresup.filter(g => g.moneda === 'ARS $').reduce((s, g) => s + parseVal(g.valor), 0)

  // Por categoría para el gráfico
  const byCat = {}
  soloGastos.filter(g => g.moneda === 'ARS $').forEach(g => {
    byCat[g.categoria] = (byCat[g.categoria] || 0) + parseVal(g.valor)
  })
  const pieData = Object.entries(byCat)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const displayList = activeTab === 'gastos' ? soloGastos : soloPresup

  return (
    <div className="p-6 fade-in space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Receipt size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-ink-400">Total gastado</p>
              <p className="text-lg font-serif text-ink-800">{fmtCurrency(totalGastado)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center flex-shrink-0">
              <DollarSign size={18} className="text-gold-600" />
            </div>
            <div>
              <p className="text-xs text-ink-400">Total presupuestado</p>
              <p className="text-lg font-serif text-ink-800">{fmtCurrency(totalPresupuestado)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${totalGastado > totalPresupuestado ? 'bg-red-50' : 'bg-sage-50'}`}>
              <TrendingUp size={18} className={totalGastado > totalPresupuestado ? 'text-red-500' : 'text-sage-600'} />
            </div>
            <div>
              <p className="text-xs text-ink-400">Diferencia</p>
              <p className={`text-lg font-serif ${totalGastado > totalPresupuestado ? 'text-red-600' : 'text-sage-700'}`}>
                {totalGastado > totalPresupuestado ? '-' : '+'}{fmtCurrency(Math.abs(totalPresupuestado - totalGastado))}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico torta */}
        <Card>
          <CardHeader><PieChart size={15} className="text-rose-400" /> Por categoría</CardHeader>
          <CardBody>
            <div className="flex flex-col items-center gap-4">
              <PieChartSVG data={pieData} total={totalGastado} />
              <div className="w-full space-y-1.5">
                {pieData.map((d, i) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-ink-600 flex-1 truncate">{d.label}</span>
                    <span className="text-xs text-ink-400">{Math.round(d.value / totalGastado * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de tickets */}
        <Card className="lg:col-span-2">
          <CardHeader action={
            <Button size="sm" onClick={() => { setShowModal(true); setForm(emptyGasto) }}>
              <Plus size={13} /> Agregar
            </Button>
          }>
            <div className="flex gap-1">
              {['gastos', 'presupuestado'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeTab === t ? 'bg-rose-500 text-white' : 'text-ink-500 hover:bg-rose-50'}`}
                >
                  {t === 'gastos' ? `Gastos (${soloGastos.length})` : `Presupuestado (${soloPresup.length})`}
                </button>
              ))}
            </div>
          </CardHeader>

          {displayList.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-400">
              {activeTab === 'gastos' ? 'Sin gastos cargados' : 'Sin presupuesto cargado'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Concepto</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Categoría</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-400 uppercase">Fecha</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-400 uppercase">Monto</th>
                    <th className="px-4 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {displayList.map(g => (
                    <tr key={g.id} className="hover:bg-rose-50 transition-colors group">
                      <td className="px-4 py-3 font-medium text-ink-800">{g.titulo}</td>
                      <td className="px-4 py-3"><Badge variant="gray">{g.categoria}</Badge></td>
                      <td className="px-4 py-3 text-ink-400 text-xs">{g.fecha ? new Date(g.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink-800">{fmtCurrency(g.valor, g.moneda)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(g.id)} className="text-ink-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink-200">
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-ink-600">Total</td>
                    <td className="px-4 py-3 text-right text-base font-serif font-medium text-ink-800">
                      {fmtCurrency(displayList.filter(g => g.moneda === 'ARS $').reduce((s, g) => s + parseVal(g.valor), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal agregar */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Cargar movimiento" size="md">
        <div className="space-y-4">
          <div className="flex gap-2">
            {[{ value: 'gasto', label: '💸 Gasto real' }, { value: 'presupuestado', label: '📋 Presupuestado' }].map(t => (
              <button
                key={t.value}
                onClick={() => setField('tipo', t.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.tipo === t.value ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-ink-500 border-ink-200 hover:border-rose-300'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Input label="Título del gasto / concepto *" placeholder="Ej: Seña DJ Maxime" value={form.titulo} onChange={e => setField('titulo', e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Valor *" type="number" placeholder="0" value={form.valor} onChange={e => setField('valor', e.target.value)} />
            </div>
            <Select label="Moneda" value={form.moneda} onChange={e => setField('moneda', e.target.value)}>
              {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoría" value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
              {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Fecha" type="date" value={form.fecha} onChange={e => setField('fecha', e.target.value)} />
          </div>
          <Input label="Notas" value={form.notas} onChange={e => setField('notas', e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
