import { ref, set, push, get, update, remove, onValue, off } from 'firebase/database'
import { db } from './firebase'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ts = () => new Date().toISOString()

// ─── EVENTOS ──────────────────────────────────────────────────────────────────
export const eventosRef = (uid) => ref(db, `users/${uid}/eventos`)
export const eventoRef  = (uid, eid) => ref(db, `users/${uid}/eventos/${eid}`)

export async function createEvento(uid, data) {
  const r = push(eventosRef(uid))
  const ev = { ...data, id: r.key, createdAt: ts(), updatedAt: ts(),
    stats: { total:0, confirmed:0, pending:0, declined:0, noResponse:0 } }
  await set(r, ev); return ev
}
export async function updateEvento(uid, eid, data) {
  await update(eventoRef(uid, eid), { ...data, updatedAt: ts() })
}
export async function deleteEvento(uid, eid) { await remove(eventoRef(uid, eid)) }
export function subscribeToEventos(uid, cb) {
  const r = eventosRef(uid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(a.date)-new Date(b.date))))
  return () => off(r)
}

// ─── INVITADOS ────────────────────────────────────────────────────────────────
export const invitadosRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/invitados`)
export const invitadoRef  = (uid,eid,gid) => ref(db,`users/${uid}/eventos/${eid}/invitados/${gid}`)

export async function addInvitado(uid, eid, guest) {
  const r = push(invitadosRef(uid, eid))
  const inv = { ...guest, id: r.key, createdAt: ts() }
  await set(r, inv); await recalcStats(uid,eid); return inv
}
export async function addManyInvitados(uid, eid, guests) {
  const updates = {}
  const saved = []
  for (const g of guests) {
    const r = push(invitadosRef(uid, eid))
    const inv = { ...g, id: r.key, createdAt: ts() }
    updates[`users/${uid}/eventos/${eid}/invitados/${r.key}`] = inv
    saved.push(inv)
  }
  await update(ref(db), updates)
  await recalcStats(uid, eid)
  return saved
}
export async function updateInvitado(uid, eid, gid, data) {
  // Limpiar undefined antes de enviar a Firebase
  const clean = Object.fromEntries(Object.entries({...data, updatedAt: ts()}).filter(([,v])=>v!==undefined))
  await update(invitadoRef(uid,eid,gid), clean)
  await recalcStats(uid, eid)
}
export async function deleteInvitado(uid, eid, gid) {
  await remove(invitadoRef(uid,eid,gid)); await recalcStats(uid,eid)
}
export function subscribeToInvitados(uid, eid, cb) {
  const r = invitadosRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

async function recalcStats(uid, eid) {
  const snap = await get(invitadosRef(uid, eid))
  const gs = Object.values(snap.val()||{})
  const now = Date.now()
  const stats = {
    total:           gs.length,
    confirmed:       gs.filter(g=>g.status==='confirmed').length,
    pending:         gs.filter(g=>g.status==='pending').length,
    declined:        gs.filter(g=>g.status==='declined').length,
    noResponse:      gs.filter(g=>g.status==='pending'&&g.lastContact&&(now-new Date(g.lastContact).getTime())>3*86400000).length,
    withRestriction: gs.filter(g=>g.menu).length,
    totalPlaces:     gs.reduce((s,g)=>s+(parseInt(g.cantidad)||parseInt(g.lugares)||1),0),
  }
  await update(eventoRef(uid, eid), { stats })
}

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────
export const proveedoresRef = (uid) => ref(db,`users/${uid}/proveedores`)
export const proveedorRef   = (uid,pid) => ref(db,`users/${uid}/proveedores/${pid}`)

export async function createProveedor(uid, data) {
  const r = push(proveedoresRef(uid))
  const p = { ...data, id: r.key, createdAt: ts() }
  await set(r, p); return p
}
export async function updateProveedor(uid, pid, data) {
  await update(proveedorRef(uid,pid), { ...data, updatedAt: ts() })
}
export async function deleteProveedor(uid, pid) { await remove(proveedorRef(uid,pid)) }
export function subscribeToProveedores(uid, cb) {
  const r = proveedoresRef(uid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

// ─── PRESUPUESTO (carpetas por rubro) ─────────────────────────────────────────
export const rubrosRef  = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/rubros`)
export const rubroRef   = (uid,eid,rid) => ref(db,`users/${uid}/eventos/${eid}/rubros/${rid}`)

export async function createRubro(uid, eid, data) {
  const r = push(rubrosRef(uid,eid))
  const rubro = { ...data, id: r.key, items:[], createdAt: ts() }
  await set(r, rubro); return rubro
}
export async function updateRubro(uid, eid, rid, data) {
  await update(rubroRef(uid,eid,rid), { ...data, updatedAt: ts() })
}
export async function deleteRubro(uid, eid, rid) { await remove(rubroRef(uid,eid,rid)) }
export function subscribeToRubros(uid, eid, cb) {
  const r = rubrosRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))))
  return () => off(r)
}

// Items dentro de un rubro
export const rubroItemsRef = (uid,eid,rid) => ref(db,`users/${uid}/eventos/${eid}/rubros/${rid}/items`)
export async function addRubroItem(uid, eid, rid, data) {
  const r = push(rubroItemsRef(uid,eid,rid))
  const item = { ...data, id: r.key, createdAt: ts() }
  await set(r, item); return item
}
export async function updateRubroItem(uid, eid, rid, iid, data) {
  await update(ref(db,`users/${uid}/eventos/${eid}/rubros/${rid}/items/${iid}`), { ...data, updatedAt: ts() })
}
export async function deleteRubroItem(uid, eid, rid, iid) {
  await remove(ref(db,`users/${uid}/eventos/${eid}/rubros/${rid}/items/${iid}`))
}

// ─── GASTOS (tickets reales) ──────────────────────────────────────────────────
export const gastosRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/gastos`)
export const gastoRef  = (uid,eid,gid) => ref(db,`users/${uid}/eventos/${eid}/gastos/${gid}`)

export async function createGasto(uid, eid, data) {
  const r = push(gastosRef(uid,eid))
  const g = { ...data, id: r.key, createdAt: ts() }
  await set(r, g); return g
}
export async function updateGasto(uid, eid, gid, data) {
  await update(gastoRef(uid,eid,gid), { ...data, updatedAt: ts() })
}
export async function deleteGasto(uid, eid, gid) { await remove(gastoRef(uid,eid,gid)) }
export function subscribeToGastos(uid, eid, cb) {
  const r = gastosRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))))
  return () => off(r)
}

// ─── PRESUPUESTO CLIENTE (budget target) ──────────────────────────────────────
export const budgetRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/budget`)
export async function saveBudget(uid, eid, data) {
  await update(budgetRef(uid,eid), { ...data, updatedAt: ts() })
}
export function subscribeToBudget(uid, eid, cb) {
  const r = budgetRef(uid, eid)
  onValue(r, snap => cb(snap.val()||{}))
  return () => off(r)
}

// ─── DOCUMENTOS ───────────────────────────────────────────────────────────────
export const documentosRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/documentos`)
export async function addDocumento(uid, eid, doc) {
  const r = push(documentosRef(uid,eid))
  const d = { ...doc, id: r.key, createdAt: ts() }
  await set(r, d); return d
}
export async function deleteDocumento(uid, eid, did) {
  await remove(ref(db,`users/${uid}/eventos/${eid}/documentos/${did}`))
}
export function subscribeToDocumentos(uid, eid, cb) {
  const r = documentosRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

// ─── MESAS ────────────────────────────────────────────────────────────────────
export const mesasRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/mesas`)
export const mesaRef  = (uid,eid,mid) => ref(db,`users/${uid}/eventos/${eid}/mesas/${mid}`)
export async function createMesa(uid, eid, data) {
  const r = push(mesasRef(uid,eid))
  const m = { ...data, id: r.key, createdAt: ts() }
  await set(r, m); return m
}
export async function updateMesa(uid, eid, mid, data) {
  await update(mesaRef(uid,eid,mid), data)
}
export async function deleteMesa(uid, eid, mid) { await remove(mesaRef(uid,eid,mid)) }
export function subscribeToMesas(uid, eid, cb) {
  const r = mesasRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export const clientesRef = (uid) => ref(db,`users/${uid}/clientes`)
export const clienteRef  = (uid,cid) => ref(db,`users/${uid}/clientes/${cid}`)
export async function createCliente(uid, data) {
  const r = push(clientesRef(uid))
  const c = { ...data, id: r.key, createdAt: ts(),
    accessCode: Math.random().toString(36).slice(2,8).toUpperCase() }
  await set(r, c); return c
}
export async function updateCliente(uid, cid, data) {
  await update(clienteRef(uid,cid), { ...data, updatedAt: ts() })
}
export async function deleteCliente(uid, cid) { await remove(clienteRef(uid,cid)) }
export function subscribeToClientes(uid, cb) {
  const r = clientesRef(uid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

// ─── TAREAS / CHECKLIST ───────────────────────────────────────────────────────
export const tareasRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/tareas`)
export const tareaRef  = (uid,eid,tid) => ref(db,`users/${uid}/eventos/${eid}/tareas/${tid}`)
export async function createTarea(uid, eid, data) {
  const r = push(tareasRef(uid,eid))
  const t = { ...data, id: r.key, done: false, createdAt: ts() }
  await set(r, t); return t
}
export async function toggleTarea(uid, eid, tid, done) {
  await update(tareaRef(uid,eid,tid), { done, updatedAt: ts() })
}
export async function deleteTarea(uid, eid, tid) { await remove(tareaRef(uid,eid,tid)) }
export function subscribeToTareas(uid, eid, cb) {
  const r = tareasRef(uid, eid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))))
  return () => off(r)
}

// ─── VENCIMIENTOS ─────────────────────────────────────────────────────────────
export const vencimientosRef = (uid) => ref(db,`users/${uid}/vencimientos`)
export const vencimientoRef  = (uid,vid) => ref(db,`users/${uid}/vencimientos/${vid}`)
export async function createVencimiento(uid, data) {
  const r = push(vencimientosRef(uid))
  const v = { ...data, id: r.key, notified: false, createdAt: ts() }
  await set(r, v); return v
}
export async function deleteVencimiento(uid, vid) { await remove(vencimientoRef(uid,vid)) }
export function subscribeToVencimientos(uid, cb) {
  const r = vencimientosRef(uid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate))))
  return () => off(r)
}

// ─── PLANTILLAS DE MENSAJES ───────────────────────────────────────────────────
export const plantillasRef = (uid,eid) => ref(db,`users/${uid}/eventos/${eid}/plantillas`)
export async function savePlantillas(uid, eid, data) {
  await set(plantillasRef(uid,eid), { ...data, updatedAt: ts() })
}
export function subscribeToPlantillas(uid, eid, cb) {
  const r = plantillasRef(uid, eid)
  onValue(r, snap => cb(snap.val()||null))
  return () => off(r)
}

// ─── PERFIL / CONFIGURACION ───────────────────────────────────────────────────
export async function saveProfile(uid, data) {
  await update(ref(db,`users/${uid}/profile`), { ...data, updatedAt: ts() })
}

// ─── CALENDARIO / NOTIFICACIONES ─────────────────────────────────────────────
export const calEventosRef = (uid) => ref(db, `users/${uid}/calendario`)
export const calEventoRef  = (uid, cid) => ref(db, `users/${uid}/calendario/${cid}`)

export async function createCalEvento(uid, data) {
  const r = push(calEventosRef(uid))
  const ev = { ...data, id: r.key, createdAt: ts() }
  await set(r, ev); return ev
}
export async function updateCalEvento(uid, cid, data) {
  await update(calEventoRef(uid, cid), { ...data, updatedAt: ts() })
}
export async function deleteCalEvento(uid, cid) { await remove(calEventoRef(uid, cid)) }
export function subscribeToCalendario(uid, cb) {
  const r = calEventosRef(uid)
  onValue(r, snap => cb(Object.values(snap.val()||{}).sort((a,b)=>new Date(a.date)-new Date(b.date))))
  return () => off(r)
}

// ─── COTIZACIÓN DÓLAR (por usuario) ───────────────────────────────────────────
export async function saveCotizacion(uid, data) {
  await update(ref(db, `users/${uid}/cotizacion`), { ...data, updatedAt: ts() })
}
export function subscribeToCotizacion(uid, cb) {
  const r = ref(db, `users/${uid}/cotizacion`)
  onValue(r, snap => cb(snap.val()||{ usd: 1000, eur: 1100 }))
  return () => off(r)
}

// ─── CONTRATOS DE PROVEEDORES ──────────────────────────────────────────────
export const contratosRef = (uid,pid) => ref(db,`users/${uid}/proveedores/${pid}/contratos`)
export async function addContrato(uid, pid, data) {
  const r = push(contratosRef(uid,pid))
  const c = { ...data, id: r.key, createdAt: ts() }
  await set(r, c); return c
}
export async function deleteContrato(uid, pid, cid) {
  await remove(ref(db,`users/${uid}/proveedores/${pid}/contratos/${cid}`))
}
export function subscribeToContratos(uid, pid, cb) {
  const r = contratosRef(uid, pid)
  onValue(r, snap => cb(Object.values(snap.val()||{})))
  return () => off(r)
}

// ─── USUARIOS DEL EQUIPO ──────────────────────────────────────────────────────
export const teamRef     = (ownerUid) => ref(db, `teams/${ownerUid}/members`)
export const memberRef   = (ownerUid, memberId) => ref(db, `teams/${ownerUid}/members/${memberId}`)
export const inviteRef   = (code) => ref(db, `invites/${code}`)

export async function createTeamMember(ownerUid, data) {
  const r = push(teamRef(ownerUid))
  const member = { ...data, id: r.key, ownerUid, createdAt: ts(), active: true }
  await set(r, member)
  // Create invite code
  const code = Math.random().toString(36).slice(2, 10).toUpperCase()
  await set(inviteRef(code), { ownerUid, memberId: r.key, email: data.email, role: data.role, used: false, createdAt: ts() })
  return { member, code }
}

export async function updateTeamMember(ownerUid, memberId, data) {
  await update(memberRef(ownerUid, memberId), { ...data, updatedAt: ts() })
}

export async function deleteTeamMember(ownerUid, memberId) {
  await remove(memberRef(ownerUid, memberId))
}

export function subscribeToTeam(ownerUid, cb) {
  const r = teamRef(ownerUid)
  onValue(r, snap => cb(Object.values(snap.val() || {})))
  return () => off(r)
}

export async function getInvite(code) {
  const snap = await get(inviteRef(code))
  return snap.val()
}

export async function markInviteUsed(code, userId) {
  await update(inviteRef(code), { used: true, usedBy: userId, usedAt: ts() })
}

// ─── EVENTOS COMPARTIDOS ───────────────────────────────────────────────────────
// Guarda qué usuarios tienen acceso a qué eventos
// Estructura: eventAccess/{eventoOwnerId}/{eventoId}/{userId} = { role, addedAt }

export const eventAccessRef = (ownerUid, eventoId) =>
  ref(db, `eventAccess/${ownerUid}/${eventoId}`)

export async function shareEventoWith(ownerUid, eventoId, targetUid, role = 'viewer') {
  await set(
    ref(db, `eventAccess/${ownerUid}/${eventoId}/${targetUid}`),
    { role, addedAt: ts() }
  )
  // Also add reverse index so targetUid can find shared events
  await set(
    ref(db, `sharedWith/${targetUid}/${ownerUid}_${eventoId}`),
    { ownerUid, eventoId, role, addedAt: ts() }
  )
}

export async function unshareEventoWith(ownerUid, eventoId, targetUid) {
  await remove(ref(db, `eventAccess/${ownerUid}/${eventoId}/${targetUid}`))
  await remove(ref(db, `sharedWith/${targetUid}/${ownerUid}_${eventoId}`))
}

export function subscribeToEventAccess(ownerUid, eventoId, cb) {
  const r = eventAccessRef(ownerUid, eventoId)
  onValue(r, snap => cb(snap.val() || {}))
  return () => off(r)
}

// Get all events shared WITH a user (from other owners)
export function subscribeToSharedEventos(uid, cb) {
  const r = ref(db, `sharedWith/${uid}`)
  onValue(r, async snap => {
    const data = snap.val() || {}
    const entries = Object.values(data)
    if (!entries.length) { cb([]); return }
    // Fetch each shared evento
    const eventos = await Promise.all(
      entries.map(async ({ ownerUid, eventoId, role }) => {
        const eSnap = await get(ref(db, `users/${ownerUid}/eventos/${eventoId}`))
        if (!eSnap.exists()) return null
        return { ...eSnap.val(), _shared: true, _ownerUid: ownerUid, _sharedRole: role }
      })
    )
    cb(eventos.filter(Boolean))
  })
  return () => off(r)
}
