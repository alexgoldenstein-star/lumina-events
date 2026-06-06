import * as XLSX from 'xlsx'

/**
 * Lumina Events — Excel Import Utility
 * Parsea archivos Excel/CSV con lista de invitados
 *
 * Columnas esperadas (flexible, case-insensitive):
 * Nombre | Apellido | WhatsApp | Email | Lugares | Menu | Notas
 */

const COLUMN_MAP = {
  nombre:     ['nombre', 'name', 'first name', 'primer nombre'],
  apellido:   ['apellido', 'apellidos', 'last name', 'surname'],
  whatsapp:   ['whatsapp', 'celular', 'telefono', 'teléfono', 'phone', 'cel', 'movil', 'móvil', 'tel'],
  email:      ['email', 'correo', 'mail', 'e-mail'],
  lugares:    ['lugares', 'cantidad', 'qty', 'asientos', 'seats', 'pax'],
  menu:       ['menu', 'menú', 'restriccion', 'restricción', 'dieta', 'alimentacion', 'alimentación'],
  notas:      ['notas', 'notes', 'observaciones', 'comentarios', 'info'],
}

/**
 * Detecta qué columna del Excel corresponde a cada campo
 */
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
 * Parsea un archivo Excel/CSV y retorna array de invitados
 */
export async function parseGuestsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        if (rows.length < 2) {
          reject(new Error('El archivo está vacío o solo tiene encabezados'))
          return
        }

        const headers = rows[0].map(h => String(h || ''))
        const colMap = detectColumns(headers)
        const guests = []

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (row.every(cell => !String(cell || '').trim())) continue // skip empty rows

          const nombre   = colMap.nombre   !== undefined ? String(row[colMap.nombre]   || '').trim() : ''
          const apellido = colMap.apellido  !== undefined ? String(row[colMap.apellido]  || '').trim() : ''
          const whatsapp = colMap.whatsapp  !== undefined ? String(row[colMap.whatsapp]  || '').trim() : ''
          const email    = colMap.email     !== undefined ? String(row[colMap.email]     || '').trim() : ''
          const lugares  = colMap.lugares   !== undefined ? parseInt(row[colMap.lugares]  || 1) || 1    : 1
          const menu     = colMap.menu      !== undefined ? String(row[colMap.menu]      || '').trim() : ''
          const notas    = colMap.notas     !== undefined ? String(row[colMap.notas]     || '').trim() : ''

          if (!nombre && !whatsapp) continue // necesitamos al menos nombre o teléfono

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
 * Genera template Excel de ejemplo para descargar
 */
export function downloadExcelTemplate() {
  const data = [
    ['Nombre', 'Apellido', 'WhatsApp', 'Email', 'Lugares', 'Menu', 'Notas'],
    ['María', 'García', '11 1234-5678', 'maria@email.com', '2', 'Sin TACC', ''],
    ['Carlos', 'López', '351 555-1234', '', '1', '', 'Viene desde Córdoba'],
    ['Ana', 'Martínez', '11 9876-5432', 'ana@email.com', '3', 'Vegetariana', ''],
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 },
    { wch: 8 }, { wch: 20 }, { wch: 25 }
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Invitados')
  XLSX.writeFile(wb, 'lumina_template_invitados.xlsx')
}

/**
 * Re-export addManyInvitados from db so EventoForm can import both from excel
 */
export { addManyInvitados } from './db'
