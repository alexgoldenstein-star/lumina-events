import * as XLSX from 'xlsx'

const COLUMN_MAP = {
  nombre:   ['nombre', 'name', 'first name', 'primer nombre'],
  apellido: ['apellido', 'apellidos', 'last name', 'surname'],
  whatsapp: ['whatsapp', 'celular', 'telefono', 'teléfono', 'phone', 'cel', 'movil', 'móvil', 'tel', 'nro', 'número', 'numero'],
  email:    ['email', 'correo', 'mail', 'e-mail'],
  lugares:  ['lugares', 'cantidad', 'qty', 'asientos', 'seats', 'pax', 'personas'],
  menu:     ['menu', 'menú', 'restriccion', 'restricción', 'dieta', 'alimentacion', 'alimentación'],
  notas:    ['notas', 'notes', 'observaciones', 'comentarios', 'info'],
}

function detectColumns(headers) {
  const normalized = headers.map(h => String(h || '').toLowerCase().trim())
  const result = {}
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    const idx = normalized.findIndex(h => aliases.some(a => h.includes(a)))
    if (idx !== -1) result[field] = idx
  }
  return result
}

/**
 * Limpia y normaliza el número de teléfono desde Excel
 * Excel a veces guarda los números como enteros (ej: 1112345678)
 */
function cleanPhone(raw) {
  if (!raw && raw !== 0) return ''
  const str = String(raw).trim()
  if (!str || str === '0') return ''
  // Quitar caracteres raros pero mantener + y dígitos
  return str.replace(/[^\d+\s\-().]/g, '').trim()
}

export async function parseGuestsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        // raw:false para que los números se lean como texto
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })

        if (rows.length < 2) {
          reject(new Error('El archivo está vacío o solo tiene encabezados'))
          return
        }

        const headers = rows[0].map(h => String(h || ''))
        const colMap = detectColumns(headers)
        const guests = []

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (row.every(cell => !String(cell || '').trim())) continue

          const nombre   = colMap.nombre   !== undefined ? String(row[colMap.nombre]   || '').trim() : ''
          const apellido = colMap.apellido  !== undefined ? String(row[colMap.apellido]  || '').trim() : ''
          const whatsapp = colMap.whatsapp  !== undefined ? cleanPhone(row[colMap.whatsapp]) : ''
          const email    = colMap.email     !== undefined ? String(row[colMap.email]     || '').trim() : ''
          const lugarRaw = colMap.lugares   !== undefined ? String(row[colMap.lugares]   || '1').trim() : '1'
          const lugares  = parseInt(lugarRaw) || 1
          const menu     = colMap.menu      !== undefined ? String(row[colMap.menu]      || '').trim() : ''
          const notas    = colMap.notas     !== undefined ? String(row[colMap.notas]     || '').trim() : ''

          if (!nombre && !whatsapp) continue

          guests.push({
            id:          `guest_${Date.now()}_${i}`,
            nombre:      nombre || '—',
            apellido,
            fullName:    [nombre, apellido].filter(Boolean).join(' ') || '—',
            whatsapp:    whatsapp || null,
            email:       email    || null,
            lugares:     isNaN(lugares) ? 1 : lugares,
            menu:        menu    || null,
            notas:       notas   || null,
            status:      'pending',
            lastContact: null,
            createdAt:   new Date().toISOString(),
          })
        }

        resolve({
          guests,
          total: guests.length,
          withPhone: guests.filter(g => g.whatsapp).length,
          detected: colMap,
        })
      } catch (err) {
        reject(new Error('Error al leer el archivo: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Error al cargar el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Template Excel con instrucciones incluidas
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new()

  // Hoja 1: Template para completar
  const data = [
    ['Nombre', 'Apellido', 'WhatsApp', 'Email', 'Lugares', 'Menu', 'Notas'],
    ['María', 'García', '1112345678', 'maria@email.com', '2', 'Sin TACC', ''],
    ['Carlos', 'López', '3515551234', '', '1', '', 'Viene desde Córdoba'],
    ['Ana', 'Martínez', '1198765432', 'ana@email.com', '3', 'Vegetariana', ''],
    ['Juan', 'Pérez', '2614321234', '', '2', '', ''],
  ]
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Estilos de ancho de columnas
  ws['!cols'] = [
    { wch: 15 }, // Nombre
    { wch: 15 }, // Apellido
    { wch: 14 }, // WhatsApp
    { wch: 25 }, // Email
    { wch: 8  }, // Lugares
    { wch: 20 }, // Menu
    { wch: 30 }, // Notas
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados')

  // Hoja 2: Instrucciones
  const instrucciones = [
    ['INSTRUCCIONES — Lumina Events'],
    [''],
    ['Columna', 'Descripción', 'Ejemplo', '¿Obligatorio?'],
    ['Nombre', 'Primer nombre del invitado', 'María', 'Sí (o WhatsApp)'],
    ['Apellido', 'Apellido del invitado', 'García', 'No'],
    ['WhatsApp', 'Número sin espacios ni guiones', '1112345678', 'Recomendado'],
    ['Email', 'Correo electrónico', 'maria@email.com', 'No'],
    ['Lugares', 'Cantidad de personas que asisten', '2', 'No (default: 1)'],
    ['Menu', 'Restricción o preferencia alimentaria', 'Sin TACC / Vegano', 'No'],
    ['Notas', 'Información adicional', 'Viene desde el interior', 'No'],
    [''],
    ['FORMATOS DE TELÉFONO ACEPTADOS:'],
    ['Formato', 'Ejemplo'],
    ['Sin espacios (recomendado)', '1112345678'],
    ['Con espacios', '11 1234 5678'],
    ['Con código de área 0', '0114321234'],
    ['Con +54', '+541112345678'],
    ['Interior (Córdoba)', '3515551234'],
    ['Interior (Mendoza)', '2614321234'],
  ]
  const wsInst = XLSX.utils.aoa_to_sheet(instrucciones)
  wsInst['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 20 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsInst, 'Instrucciones')

  XLSX.writeFile(wb, 'lumina_template_invitados.xlsx')
}

export { addManyInvitados } from './db'
