import { useEffect, useState, useRef } from 'react'
import { FileText, Upload, Trash2, Download, File } from 'lucide-react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { useAuth } from '../lib/AuthContext'
import { subscribeToDocumentos, addDocumento, deleteDocumento } from '../lib/db'
import { storage } from '../lib/firebase'
import { Card, CardHeader, CardBody, Button, EmptyState, Alert } from '../components/ui'

const FILE_ICONS = {
  pdf:  { icon: '📄', color: 'text-red-500 bg-red-50' },
  xlsx: { icon: '📊', color: 'text-green-600 bg-green-50' },
  xls:  { icon: '📊', color: 'text-green-600 bg-green-50' },
  docx: { icon: '📝', color: 'text-blue-500 bg-blue-50' },
  doc:  { icon: '📝', color: 'text-blue-500 bg-blue-50' },
  jpg:  { icon: '🖼️', color: 'text-rose-500 bg-rose-50' },
  jpeg: { icon: '🖼️', color: 'text-rose-500 bg-rose-50' },
  png:  { icon: '🖼️', color: 'text-rose-500 bg-rose-50' },
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Documentos({ eventoId, evento }) {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()

  useEffect(() => {
    if (!user?.uid || !eventoId) return
    return subscribeToDocumentos(user.uid, eventoId, setDocs)
  }, [user?.uid, eventoId])

  async function handleFiles(files) {
    if (!files?.length) return
    setUploading(true)
    setError('')
    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        setError(`${file.name} supera los 20MB`); continue
      }
      try {
        const path = `users/${user.uid}/eventos/${eventoId}/docs/${Date.now()}_${file.name}`
        const sRef = storageRef(storage, path)
        const task = uploadBytesResumable(sRef, file)
        await new Promise((res, rej) => {
          task.on('state_changed',
            snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
            rej,
            async () => {
              const url = await getDownloadURL(task.snapshot.ref)
              await addDocumento(user.uid, eventoId, {
                nombre: file.name,
                url,
                path,
                size: file.size,
                type: file.name.split('.').pop().toLowerCase(),
              })
              res()
            }
          )
        })
      } catch (e) {
        setError(`Error al subir ${file.name}: ${e.message}`)
      }
    }
    setUploading(false)
    setProgress(0)
  }

  async function handleDelete(doc) {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return
    try {
      if (doc.path) {
        const sRef = storageRef(storage, doc.path)
        await deleteObject(sRef).catch(() => {}) // ignore if already deleted
      }
      await deleteDocumento(user.uid, eventoId, doc.id)
    } catch (e) {
      setError(e.message)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="p-6 fade-in">
      <Card>
        <CardHeader><FileText size={15} className="text-rose-400" /> Documentos del evento</CardHeader>
        <CardBody className="space-y-4">
          {error && <Alert variant="danger" onDismiss={() => setError('')}>{error}</Alert>}

          {/* Upload zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-ink-200 rounded-xl p-8 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all"
          >
            <Upload size={28} className="text-rose-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-600">
              {uploading ? `Subiendo... ${progress}%` : 'Arrastrá archivos o hacé clic para subir'}
            </p>
            <p className="text-xs text-ink-400 mt-1">PDF, Excel, Word, imágenes · Máx. 20MB por archivo</p>
            {uploading && (
              <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden mx-auto max-w-xs">
                <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.docx,.doc,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin documentos todavía"
              description="Subí contratos, propuestas, listas de invitados y cualquier archivo del evento."
            />
          ) : (
            <div className="space-y-2">
              {docs.map(doc => {
                const ext = doc.type || doc.nombre?.split('.').pop()?.toLowerCase()
                const cfg = FILE_ICONS[ext] || { icon: '📁', color: 'text-ink-400 bg-ink-50' }
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-ink-50/50 rounded-xl hover:bg-rose-50 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">{doc.nombre}</p>
                      <p className="text-xs text-ink-400">
                        {formatSize(doc.size)}
                        {doc.createdAt && ` · ${new Date(doc.createdAt).toLocaleDateString('es-AR')}`}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="xs"><Download size={13} /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="xs" className="hover:text-red-500" onClick={() => handleDelete(doc)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
