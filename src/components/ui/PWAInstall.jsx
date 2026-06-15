import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null)
  const [show,   setShow]   = useState(false)
  const [isIOS,  setIsIOS]  = useState(false)

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    // Listen for install prompt (Android/Desktop)
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS instructions if not installed
    if (ios && !window.navigator.standalone) {
      setTimeout(() => setShow(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Don't show if already installed
  if (window.navigator.standalone) return null
  if (!show) return null

  async function handleInstall() {
    if (prompt) {
      await prompt.prompt()
      const result = await prompt.userChoice
      if (result.outcome === 'accepted') setShow(false)
    }
  }

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-nude-200 p-4">
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-ink-400 hover:text-ink-600">
          <X size={16}/>
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-warm-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={18} className="text-white"/>
          </div>
          <div>
            <p className="text-sm font-medium text-ink-800">Instalá Lumina Events</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Tocá <strong>Compartir</strong> <span className="text-base">⎋</span> y luego <strong>"Agregar a inicio"</strong> para tenerla como app
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-nude-200 p-4 max-w-sm mx-auto">
      <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-ink-400 hover:text-ink-600">
        <X size={16}/>
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warm-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-white"/>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-800">Instalá Lumina Events</p>
          <p className="text-xs text-ink-500">Accedé más rápido desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-warm-500 text-white rounded-lg text-xs font-medium hover:bg-warm-600 transition-colors flex-shrink-0"
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
