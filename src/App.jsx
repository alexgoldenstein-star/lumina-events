import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { get } from 'firebase/database'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { eventoRef } from './lib/db'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui'

import { Login, Register } from './pages/Auth'
import Dashboard     from './pages/Dashboard'
import Eventos       from './pages/Eventos'
import EventoForm    from './pages/EventoForm'
import EventoDetalle from './pages/EventoDetalle'
import Proveedores   from './pages/Proveedores'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (user) return <Navigate to="/" replace />
  return children
}

function EventoDetalleEdit() {
  const { id } = useParams()
  const { user } = useAuth()
  const [evento, setEvento] = useState(null)

  useEffect(() => {
    if (!user || !id) return
    get(eventoRef(user.uid, id)).then(snap => {
      if (snap.exists()) setEvento(snap.val())
    })
  }, [user, id])

  if (!evento) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
  return <EventoForm evento={evento} />
}

function PlaceholderPage({ label }) {
  return (
    <div className="p-7">
      <p className="text-sm text-ink-400">
        Seleccioná un evento desde{' '}
        <a href="/eventos" className="text-rose-500 hover:underline">Mis Eventos</a>
        {' '}para ver {label}.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registro" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/"                   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/eventos"            element={<PrivateRoute><Eventos /></PrivateRoute>} />
          <Route path="/eventos/nuevo"      element={<PrivateRoute><EventoForm /></PrivateRoute>} />
          <Route path="/eventos/:id"        element={<PrivateRoute><EventoDetalle /></PrivateRoute>} />
          <Route path="/eventos/:id/editar" element={<PrivateRoute><EventoDetalleEdit /></PrivateRoute>} />
          <Route path="/invitados"          element={<PrivateRoute><PlaceholderPage label="los invitados" /></PrivateRoute>} />
          <Route path="/mensajes"           element={<PrivateRoute><PlaceholderPage label="los mensajes" /></PrivateRoute>} />
          <Route path="/proveedores"        element={<PrivateRoute><Proveedores /></PrivateRoute>} />
          <Route path="/presupuestos"       element={<PrivateRoute><PlaceholderPage label="el presupuesto" /></PrivateRoute>} />
          <Route path="/documentos"         element={<PrivateRoute><PlaceholderPage label="los documentos" /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
