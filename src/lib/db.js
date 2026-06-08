import { ref, set, push, get, update, remove, onValue, off, query, orderByChild, equalTo } from 'firebase/database'
import { db } from './firebase'

// ─── EVENTOS ─────────────────────────────────────────────────────────────────

export const eventosRef = (userId) => ref(db, `users/${userId}/eventos`)
export const eventoRef  = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}`)

export async function createEvento(userId, data) {
  const newRef = push(eventosRef(userId))
  const evento = {
    ...data,
    id: newRef.key,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { total: 0, confirmed: 0, pending: 0, declined: 0, noResponse: 0 }
  }
  await set(newRef, evento)
  return evento
}

export async function updateEvento(userId, eventId, data) {
  await update(eventoRef(userId, eventId), { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteEvento(userId, eventId) {
  await remove(eventoRef(userId, eventId))
}

export function subscribeToEventos(userId, callback) {
  const r = eventosRef(userId)
  onValue(r, (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date)))
  })
  return () => off(r)
}

// ─── INVITADOS ────────────────────────────────────────────────────────────────

export const invitadosRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/invitados`)
export const invitadoRef  = (userId, eventId, guestId) => ref(db, `users/${userId}/eventos/${eventId}/invitados/${guestId}`)

export async function addInvitado(userId, eventId, guest) {
  const newRef = push(invitadosRef(userId, eventId))
  const invitado = { ...guest, id: newRef.key, createdAt: new Date().toISOString() }
  await set(newRef, invitado)
  return invitado
}

export async function addManyInvitados(userId, eventId, guests) {
  const updates = {}
  const saved = []
  for (const guest of guests) {
    const newRef = push(invitadosRef(userId, eventId))
    const invitado = { ...guest, id: newRef.key, createdAt: new Date().toISOString() }
    updates[`users/${userId}/eventos/${eventId}/invitados/${newRef.key}`] = invitado
    saved.push(invitado)
  }
  await update(ref(db), updates)
  await recalcStats(userId, eventId)
  return saved
}

export async function updateInvitado(userId, eventId, guestId, data) {
  await update(invitadoRef(userId, eventId, guestId), {
    ...data,
    updatedAt: new Date().toISOString()
  })
  await recalcStats(userId, eventId)
}

export async function deleteInvitado(userId, eventId, guestId) {
  await remove(invitadoRef(userId, eventId, guestId))
  await recalcStats(userId, eventId)
}

export function subscribeToInvitados(userId, eventId, callback) {
  const r = invitadosRef(userId, eventId)
  onValue(r, (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data))
  })
  return () => off(r)
}

async function recalcStats(userId, eventId) {
  const snap = await get(invitadosRef(userId, eventId))
  const guests = Object.values(snap.val() || {})
  const now = Date.now()
  const stats = {
    total:      guests.length,
    confirmed:  guests.filter(g => g.status === 'confirmed').length,
    pending:    guests.filter(g => g.status === 'pending').length,
    declined:   guests.filter(g => g.status === 'declined').length,
    noResponse: guests.filter(g => {
      if (g.status !== 'pending') return false
      if (!g.lastContact) return false
      return (now - new Date(g.lastContact).getTime()) > 3 * 24 * 60 * 60 * 1000
    }).length,
    withRestriction: guests.filter(g => g.menu).length,
    totalPlaces: guests.reduce((s, g) => s + (parseInt(g.lugares) || 1), 0),
  }
  await update(eventoRef(userId, eventId), { stats })
}

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────

export const proveedoresRef = (userId) => ref(db, `users/${userId}/proveedores`)
export const proveedorRef   = (userId, provId) => ref(db, `users/${userId}/proveedores/${provId}`)

export async function createProveedor(userId, data) {
  const newRef = push(proveedoresRef(userId))
  const prov = { ...data, id: newRef.key, createdAt: new Date().toISOString() }
  await set(newRef, prov)
  return prov
}

export async function updateProveedor(userId, provId, data) {
  await update(proveedorRef(userId, provId), { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteProveedor(userId, provId) {
  await remove(proveedorRef(userId, provId))
}

export function subscribeToProveedores(userId, callback) {
  const r = proveedoresRef(userId)
  onValue(r, (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data))
  })
  return () => off(r)
}

// ─── PRESUPUESTOS ─────────────────────────────────────────────────────────────

export const presupuestosRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/presupuesto`)

export async function savePresupuesto(userId, eventId, data) {
  await set(presupuestosRef(userId, eventId), { ...data, updatedAt: new Date().toISOString() })
}

export async function getPresupuesto(userId, eventId) {
  const snap = await get(presupuestosRef(userId, eventId))
  return snap.val()
}

export function subscribeToPresupuesto(userId, eventId, callback) {
  const r = presupuestosRef(userId, eventId)
  onValue(r, (snap) => callback(snap.val()))
  return () => off(r)
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────

export const documentosRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/documentos`)

export async function addDocumento(userId, eventId, doc) {
  const newRef = push(documentosRef(userId, eventId))
  const documento = { ...doc, id: newRef.key, createdAt: new Date().toISOString() }
  await set(newRef, documento)
  return documento
}

export async function deleteDocumento(userId, eventId, docId) {
  await remove(ref(db, `users/${userId}/eventos/${eventId}/documentos/${docId}`))
}

export function subscribeToDocumentos(userId, eventId, callback) {
  const r = documentosRef(userId, eventId)
  onValue(r, (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data))
  })
  return () => off(r)
}

// ─── CLIENTES (panel cliente) ─────────────────────────────────────────────────

export const clientesRef = (userId) => ref(db, `users/${userId}/clientes`)
export const clienteRef  = (userId, clienteId) => ref(db, `users/${userId}/clientes/${clienteId}`)

export async function createCliente(userId, data) {
  const newRef = push(clientesRef(userId))
  const cliente = {
    ...data,
    id: newRef.key,
    createdAt: new Date().toISOString(),
    accessCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
  }
  await set(newRef, cliente)
  return cliente
}

export async function updateCliente(userId, clienteId, data) {
  await update(clienteRef(userId, clienteId), { ...data, updatedAt: new Date().toISOString() })
}

export async function deleteCliente(userId, clienteId) {
  await remove(clienteRef(userId, clienteId))
}

export function subscribeToClientes(userId, callback) {
  const r = clientesRef(userId)
  onValue(r, snap => {
    const data = snap.val() || {}
    callback(Object.values(data))
  })
  return () => off(r)
}

// ─── CHECKLIST / TAREAS ───────────────────────────────────────────────────────

export const tareasRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/tareas`)
export const tareaRef  = (userId, eventId, tareaId) => ref(db, `users/${userId}/eventos/${eventId}/tareas/${tareaId}`)

export async function createTarea(userId, eventId, data) {
  const newRef = push(tareasRef(userId, eventId))
  const tarea = { ...data, id: newRef.key, done: false, createdAt: new Date().toISOString() }
  await set(newRef, tarea)
  return tarea
}

export async function toggleTarea(userId, eventId, tareaId, done) {
  await update(tareaRef(userId, eventId, tareaId), { done, updatedAt: new Date().toISOString() })
}

export async function deleteTarea(userId, eventId, tareaId) {
  await remove(tareaRef(userId, eventId, tareaId))
}

export function subscribeToTareas(userId, eventId, callback) {
  const r = tareasRef(userId, eventId)
  onValue(r, snap => {
    const data = snap.val() || {}
    callback(Object.values(data).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
  })
  return () => off(r)
}

// ─── GASTOS (tickets) ─────────────────────────────────────────────────────────

export const gastosRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/gastos`)
export const gastoRef  = (userId, eventId, gastoId) => ref(db, `users/${userId}/eventos/${eventId}/gastos/${gastoId}`)

export async function createGasto(userId, eventId, data) {
  const newRef = push(gastosRef(userId, eventId))
  const gasto = { ...data, id: newRef.key, createdAt: new Date().toISOString() }
  await set(newRef, gasto)
  return gasto
}

export async function updateGasto(userId, eventId, gastoId, data) {
  await update(gastoRef(userId, eventId, gastoId), { ...data })
}

export async function deleteGasto(userId, eventId, gastoId) {
  await remove(gastoRef(userId, eventId, gastoId))
}

export function subscribeToGastos(userId, eventId, callback) {
  const r = gastosRef(userId, eventId)
  onValue(r, snap => {
    const data = snap.val() || {}
    callback(Object.values(data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  })
  return () => off(r)
}

// ─── MESAS ────────────────────────────────────────────────────────────────────

export const mesasRef = (userId, eventId) => ref(db, `users/${userId}/eventos/${eventId}/mesas`)
export const mesaRef  = (userId, eventId, mesaId) => ref(db, `users/${userId}/eventos/${eventId}/mesas/${mesaId}`)

export async function createMesa(userId, eventId, data) {
  const newRef = push(mesasRef(userId, eventId))
  const mesa = { ...data, id: newRef.key, createdAt: new Date().toISOString() }
  await set(newRef, mesa)
  return mesa
}

export async function updateMesa(userId, eventId, mesaId, data) {
  await update(mesaRef(userId, eventId, mesaId), data)
}

export async function deleteMesa(userId, eventId, mesaId) {
  await remove(mesaRef(userId, eventId, mesaId))
}

export function subscribeToMesas(userId, eventId, callback) {
  const r = mesasRef(userId, eventId)
  onValue(r, snap => {
    const data = snap.val() || {}
    callback(Object.values(data))
  })
  return () => off(r)
}

// ─── VENCIMIENTOS ─────────────────────────────────────────────────────────────

export const vencimientosRef = (userId) => ref(db, `users/${userId}/vencimientos`)
export const vencimientoRef  = (userId, vId) => ref(db, `users/${userId}/vencimientos/${vId}`)

export async function createVencimiento(userId, data) {
  const newRef = push(vencimientosRef(userId))
  const v = { ...data, id: newRef.key, notified: false, createdAt: new Date().toISOString() }
  await set(newRef, v)
  return v
}

export async function deleteVencimiento(userId, vId) {
  await remove(vencimientoRef(userId, vId))
}

export function subscribeToVencimientos(userId, callback) {
  const r = vencimientosRef(userId)
  onValue(r, snap => {
    const data = snap.val() || {}
    callback(Object.values(data).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)))
  })
  return () => off(r)
}
