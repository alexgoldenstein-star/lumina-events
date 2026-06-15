import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function PWAInstall() {
  const [prompt,    setPrompt]    = useState(null)
  const [show,      setShow]      = useState(false)
  const [isIOS,     setIsIOS]     = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // ¿Ya instalada?
    const mq = window.matchMedia('(display-mode: standalone)')
    if (mq.matches || window.navigator.standalone) {
      setInstalled(true)
      return
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const safari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    setIsIOS(ios && safari)

    // Android/Desktop
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const lastDismiss = parseInt(dismissed || '0')
      const daysSince = (Date.now() - lastDismiss) / 86400000
      if (daysSince > 3 || !dismissed) {
        setTimeout(() => setShow(true), 3000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS en Safari
    if (ios && safari) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed')
      const lastDismiss = parseInt(dismissed || '0')
      const daysSince = (Date.now() - lastDismiss) / 86400000
      if (daysSince > 7 || !dismissed) {
        setTimeout(() => setShow(true), 5000)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-install-dismissed', Date.now().toString())
  }

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') { setShow(false); setInstalled(true) }
    else dismiss()
  }

  if (installed || !show) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4" style={{paddingBottom:'calc(1rem + env(safe-area-inset-bottom))'}}>
        <div className="bg-white rounded-2xl shadow-2xl border border-nude-200 p-5 max-w-sm mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-warm-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xl font-serif font-bold">L</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-800">Instalá Lumina Events</p>
              <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">
                En Safari, tocá el botón <strong>Compartir</strong> <span className="text-base">⎋</span> y luego <strong>"Agregar a pantalla de inicio"</strong>
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-warm-600 bg-warm-50 rounded-lg px-3 py-2">
                <Smartphone size={13}/>
                Funciona sin internet una vez instalada
              </div>
            </div>
            <button onClick={dismiss} className="text-ink-400 hover:text-ink-600 p-1 flex-shrink-0">
              <X size={16}/>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-ink-900 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto flex items-center gap-3">
        <div className="w-11 h-11 bg-warm-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xl font-serif font-bold">L</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Instalá Lumina Events</p>
          <p className="text-xs text-white/50 mt-0.5">Accedé desde tu pantalla de inicio</p>
        </div>
        <button onClick={install}
          className="px-3 py-2 bg-warm-500 text-white rounded-xl text-xs font-medium hover:bg-warm-600 transition-colors flex-shrink-0 flex items-center gap-1.5">
          <Download size={13}/> Instalar
        </button>
        <button onClick={dismiss} className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
          <X size={16}/>
        </button>
      </div>
    </div>
  )
}
