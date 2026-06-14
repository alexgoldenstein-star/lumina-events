import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Button, Input, Alert } from '../components/ui'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/app')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif text-ink-800">Lumina Events</h1>
          <p className="text-sm text-ink-400 mt-1">Tu plataforma de gestión de eventos</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 p-8 shadow-sm">
          <h2 className="text-lg font-medium text-ink-800 mb-6">Iniciar sesión</h2>
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            <Input label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button className="w-full justify-center" loading={loading} type="submit">
              Ingresar
            </Button>
          </form>
          <p className="text-center text-sm text-ink-400 mt-5">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-rose-600 hover:underline font-medium">Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', orgName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) { setForm(f => ({...f, [k]: v})) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6)       { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      await register(form.email, form.password, { nombre: form.nombre, orgName: form.orgName })
      navigate('/app')
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Ese email ya está registrado' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif text-ink-800">Lumina Events</h1>
          <p className="text-sm text-ink-400 mt-1">Creá tu cuenta gratis</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 p-8 shadow-sm">
          <h2 className="text-lg font-medium text-ink-800 mb-6">Crear cuenta</h2>
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Tu nombre" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
            <Input label="Nombre de tu empresa / marca" placeholder="Ej: JR Eventos" value={form.orgName} onChange={e => set('orgName', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            <Input label="Contraseña" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />
            <Input label="Confirmar contraseña" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
            <Button className="w-full justify-center" loading={loading} type="submit">
              Crear cuenta
            </Button>
          </form>
          <p className="text-center text-sm text-ink-400 mt-5">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-rose-600 hover:underline font-medium">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
