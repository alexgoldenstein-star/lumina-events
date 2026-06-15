import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

function LogoJR({ light = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-sm font-light tracking-[0.35em] uppercase ${light?'text-white':'text-ink-900'}`}
        style={{fontFamily:'Georgia, serif', letterSpacing:'0.35em'}}>
        JAZMIN ROSENBERG
      </div>
      <div className={`text-[9px] tracking-[0.25em] uppercase ${light?'text-white/60':'text-ink-400'}`}>
        ORGANIZACIÓN DE EVENTOS
      </div>
    </div>
  )
}

export function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email,    setEmail]   = useState('')
  const [password, setPassword]= useState('')
  const [showPass, setShowPass]= useState(false)
  const [error,    setError]   = useState('')
  const [loading,  setLoading] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!email.trim() || !password) { setError('Completá todos los campos'); return }
    setLoading(true); setError('')
    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/dashboard')
    } catch(err) {
      const msgs = {
        'auth/invalid-credential':    'Email o contraseña incorrectos',
        'auth/user-not-found':        'No existe una cuenta con ese email',
        'auth/wrong-password':        'Contraseña incorrecta',
        'auth/too-many-requests':     'Demasiados intentos. Esperá unos minutos.',
        'auth/invalid-email':         'Email inválido',
      }
      setError(msgs[err.code] || 'Error al iniciar sesión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-nude-50 flex">
      {/* Lado izquierdo — foto */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85&fit=crop"
          alt="" className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoJR light/>
        </div>
      </div>

      {/* Lado derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <LogoJR/>
          </div>

          <h1 className="text-2xl font-light text-ink-900 mb-1" style={{fontFamily:'Georgia, serif'}}>
            Bienvenida
          </h1>
          <p className="text-sm text-ink-400 mb-8">Accedé a tu panel de gestión</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-5">
              <AlertTriangle size={14} className="flex-shrink-0"/>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-ink-500 mb-2">Email</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="tu@email.com" autoComplete="email"
                className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-ink-500 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors pr-10"
                />
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-ink-900 text-white text-xs tracking-widest uppercase hover:bg-ink-700 transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-ink-400 hover:text-ink-700 transition-colors tracking-widest uppercase">
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]   = useState({ nombre:'', orgName:'', email:'', password:'' })
  const [showPass, setShowPass]= useState(false)
  const [error,  setError] = useState('')
  const [loading,setLoading]=useState(false)

  function set(k,v){ setForm(f=>({...f,[k]:v})) }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!form.nombre||!form.email||!form.password){ setError('Completá todos los campos'); return }
    if (form.password.length<6){ setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      await register(form.email.trim().toLowerCase(), form.password, { nombre:form.nombre, orgName:form.orgName||form.nombre })
      navigate('/dashboard')
    } catch(err) {
      const msgs = { 'auth/email-already-in-use':'Ese email ya tiene una cuenta', 'auth/invalid-email':'Email inválido', 'auth/weak-password':'Contraseña muy débil' }
      setError(msgs[err.code]||err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-nude-50 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center"><LogoJR/></div>
        <h1 className="text-2xl font-light text-ink-900 mb-1 text-center" style={{fontFamily:'Georgia, serif'}}>Crear cuenta</h1>
        <p className="text-sm text-ink-400 mb-8 text-center">Configurá tu espacio de trabajo</p>
        {error&&<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-5"><AlertTriangle size={14}/>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-ink-500 mb-2">Tu nombre</label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} placeholder="Jazmin Rosenberg"
              className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-ink-500 mb-2">Email</label>
            <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="tu@email.com"
              className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"/>
          </div>
          <div className="relative">
            <label className="block text-xs tracking-widest uppercase text-ink-500 mb-2">Contraseña</label>
            <input type={showPass?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Mín. 6 caracteres"
              className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors pr-10"/>
            <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-8 text-ink-400 hover:text-ink-700">
              {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-ink-900 text-white text-xs tracking-widest uppercase hover:bg-ink-700 transition-colors disabled:opacity-50 mt-2">
            {loading?'Creando cuenta...':'Crear cuenta'}
          </button>
        </form>
        <p className="text-center text-xs text-ink-400 mt-6">
          ¿Ya tenés cuenta? <Link to="/login" className="text-ink-700 hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  )
}
