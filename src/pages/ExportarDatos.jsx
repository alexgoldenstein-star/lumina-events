import { useState } from 'react'
import { ref, get, set, update } from 'firebase/database'
import { db, auth } from '../lib/firebase'
import { Download, Upload, Check, AlertTriangle, Database } from 'lucide-react'
import { Card, CardHeader, CardBody, Button, Alert } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

export default function ExportarDatos() {
  const [exporting,  setExporting]  = useState(false)
  const [importing,  setImporting]  = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [error,      setError]      = useState('')
  const [stats,      setStats]      = useState(null)
  const [fileData,   setFileData]   = useState(null)

  async function handleExport() {
    const user = auth.currentUser
    if (!user) { setError('Necesitás estar logueado'); return }
    setExporting(true); setError('')
    try {
      const snap = await get(ref(db, `users/${user.uid}`))
      if (!snap.exists()) { setError('No hay datos para exportar'); setExporting(false); return }
      const data = snap.val()

      // Stats
      const eventos    = Object.keys(data.eventos    || {}).length
      const proveedores= Object.keys(data.proveedores|| {}).length
      const clientes   = Object.keys(data.clientes   || {}).length
      const vencim     = Object.keys(data.vencimientos||{}).length
      setStats({ eventos, proveedores, clientes, vencim })

      // Exportar como JSON
      const exportData = {
        exportedAt:  new Date().toISOString(),
        exportedBy:  user.email,
        sourceUid:   user.uid,
        data
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `lumina-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(true)
    } catch(e) { setError(e.message) }
    setExporting(false)
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      setFileData(json)
      setError('')
      // Show stats
      const d = json.data || {}
      setStats({
        eventos:     Object.keys(d.eventos    ||{}).length,
        proveedores: Object.keys(d.proveedores||{}).length,
        clientes:    Object.keys(d.clientes   ||{}).length,
        vencim:      Object.keys(d.vencimientos||{}).length,
        exportedBy:  json.exportedBy,
        exportedAt:  json.exportedAt,
      })
    } catch(e) { setError('Archivo inválido — debe ser un backup de Lumina Events') }
  }

  async function handleImport() {
    const user = auth.currentUser
    if (!user) { setError('Necesitás estar logueado'); return }
    if (!fileData) { setError('Seleccioná un archivo primero'); return }
    if (!confirm('¿Importar los datos? Esto REEMPLAZA los datos actuales de esta cuenta.')) return

    setImporting(true); setError('')
    try {
      const importData = fileData.data || fileData
      // Importar todo bajo el UID actual (jaz)
      // NO importar el profile (para no sobreescribir el rol/email)
      const { profile: _, ...dataWithoutProfile } = importData

      await update(ref(db, `users/${user.uid}`), dataWithoutProfile)
      setImportDone(true)
    } catch(e) { setError(e.message) }
    setImporting(false)
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Exportar / Importar datos"
        subtitle="Backup y migración de datos entre cuentas"
      />
      <div className="p-7 max-w-2xl space-y-6">

        {error && <Alert variant="danger">{error}</Alert>}

        {/* EXPORTAR */}
        <Card>
          <CardHeader><Download size={15} className="text-warm-500"/> Exportar mis datos</CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-ink-500">
              Descargá todos tus eventos, proveedores, clientes y vencimientos en un archivo JSON.
              Usalo para hacer backup o para migrar a otra cuenta.
            </p>
            {exportDone && stats && (
              <div className="p-4 bg-sage-50 border border-sage-200 rounded-xl text-sm text-sage-700 space-y-1">
                <p className="font-medium flex items-center gap-2"><Check size={15}/> Exportado correctamente</p>
                <p className="text-xs text-sage-600">
                  {stats.eventos} eventos · {stats.proveedores} proveedores · {stats.clientes} clientes · {stats.vencim} vencimientos
                </p>
              </div>
            )}
            <Button onClick={handleExport} loading={exporting} className="w-full justify-center">
              <Download size={15}/> {exportDone ? 'Volver a descargar' : 'Descargar mis datos'}
            </Button>
          </CardBody>
        </Card>

        {/* IMPORTAR */}
        <Card>
          <CardHeader><Upload size={15} className="text-warm-500"/> Importar datos</CardHeader>
          <CardBody className="space-y-4">
            <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-xs text-gold-700 flex items-start gap-2">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5"/>
              <span>Esto <strong>reemplaza</strong> los datos de la cuenta actual con los del backup. El perfil y contraseña no se tocan.</span>
            </div>
            <p className="text-sm text-ink-500">
              Seleccioná el archivo JSON que exportaste y hacé clic en Importar.
            </p>

            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-nude-300 rounded-xl p-6 cursor-pointer hover:border-warm-400 hover:bg-warm-50 transition-all">
              <Database size={28} className="text-nude-400"/>
              <div className="text-center">
                <p className="text-sm font-medium text-ink-600">
                  {fileData ? `✓ ${fileData.exportedBy || 'archivo cargado'}` : 'Seleccioná el archivo de backup'}
                </p>
                <p className="text-xs text-ink-400 mt-1">.json</p>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleFileSelect}/>
            </label>

            {fileData && stats && (
              <div className="p-4 bg-nude-50 border border-nude-200 rounded-xl text-sm space-y-1">
                <p className="font-medium text-ink-700">Contenido del backup:</p>
                <p className="text-xs text-ink-500">Exportado por: {stats.exportedBy}</p>
                <p className="text-xs text-ink-500">Fecha: {stats.exportedAt ? new Date(stats.exportedAt).toLocaleString('es-AR') : '—'}</p>
                <p className="text-xs text-ink-500 mt-2">
                  {stats.eventos} eventos · {stats.proveedores} proveedores · {stats.clientes} clientes
                </p>
              </div>
            )}

            {importDone && (
              <div className="p-4 bg-sage-50 border border-sage-200 rounded-xl text-sm text-sage-700 flex items-center gap-2">
                <Check size={15}/> <span>¡Datos importados! Recargá la página para verlos.</span>
              </div>
            )}

            <Button
              onClick={handleImport}
              loading={importing}
              disabled={!fileData}
              className="w-full justify-center"
              variant={fileData ? 'primary' : 'outline'}
            >
              <Upload size={15}/> Importar datos
            </Button>
          </CardBody>
        </Card>

        <p className="text-xs text-ink-400 text-center">
          Esta herramienta no comparte contraseñas ni información de autenticación.
        </p>
      </div>
    </div>
  )
}
