/**
 * Lumina Events — WhatsApp Utility
 * Genera links wa.me con mensajes prellenados para cada tipo de contacto
 */

/**
 * Normaliza número argentino a formato internacional
 * Acepta: 11 1234-5678 / 011 1234-5678 / +54 9 11 1234-5678 / 5491112345678
 */
export function normalizePhone(raw) {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  // Ya tiene código de país completo
  if (digits.startsWith('549') && digits.length === 13) return digits
  if (digits.startsWith('54') && digits.length === 12)  return '549' + digits.slice(2)
  // Número sin código de país
  if (digits.length === 10) return '549' + digits   // ej: 1112345678
  if (digits.length === 8)  return '54911' + digits  // ej: 12345678 (CABA fijo-like)
  return '549' + digits
}

/**
 * Tipos de mensaje pre-armados
 */
export const MESSAGE_TYPES = {
  PRIMERA_CONFIRMACION: 'primera',
  SEGUIMIENTO:           'seguimiento',
  RECORDATORIO:          'recordatorio',
  DIA_DEL_EVENTO:        'dia_evento',
}

/**
 * Genera el texto del mensaje según tipo y contexto del evento
 */
export function buildMessage({ type, guestName, eventName, eventDate, eventTime, eventPlace, orgName = 'JR Eventos' }) {
  const firstName = guestName?.split(' ')[0] || 'hola'
  const fecha = eventDate ? formatDate(eventDate) : '[fecha]'

  const templates = {
    [MESSAGE_TYPES.PRIMERA_CONFIRMACION]: `Hola ${firstName} 👋, ¿cómo estás?

Te escribo de *${orgName}* en relación al festejo de *${eventName}*.

El evento será el *${fecha}*${eventTime ? ' a las *' + eventTime + ' hs*' : ''}${eventPlace ? ' en *' + eventPlace + '*' : ''}.

¿Podés confirmarnos tu asistencia? Y si es así, ¿tenés alguna restricción alimentaria que debamos tener en cuenta?

¡Muchas gracias! 🌸`,

    [MESSAGE_TYPES.SEGUIMIENTO]: `Hola ${firstName}! 🌷

Te escribo nuevamente de *${orgName}*. Quedó pendiente tu confirmación para el festejo de *${eventName}*.

¿Pudiste verlo? Cualquier consulta, acá estamos 😊`,

    [MESSAGE_TYPES.RECORDATORIO]: `¡Hola ${firstName}! ✨

Ya falta poco para el festejo de *${eventName}* — el *${fecha}*${eventTime ? ' a las *' + eventTime + ' hs*' : ''}${eventPlace ? ' en *' + eventPlace + '*' : ''}.

¡Te esperamos! 💫`,

    [MESSAGE_TYPES.DIA_DEL_EVENTO]: `¡Hola ${firstName}! 🎉

Hoy es el gran día de *${eventName}*. Te esperamos${eventTime ? ' a las *' + eventTime + ' hs*' : ''}${eventPlace ? ' en *' + eventPlace + '*' : ''}.

¡Va a estar increíble! 🌸`,
  }

  return templates[type] || templates[MESSAGE_TYPES.PRIMERA_CONFIRMACION]
}

/**
 * Genera el URL de WhatsApp completo
 */
export function buildWhatsAppUrl(phone, message) {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

/**
 * Helper — abre WhatsApp en nueva pestaña
 */
export function openWhatsApp(phone, message) {
  const url = buildWhatsAppUrl(phone, message)
  if (url) window.open(url, '_blank')
}

/**
 * Formatea fecha ISO a texto legible en español
 */
function formatDate(isoDate) {
  try {
    const d = new Date(isoDate + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return isoDate
  }
}

/**
 * Calcula días sin respuesta dado el último contacto
 */
export function daysSinceContact(lastContactDate) {
  if (!lastContactDate) return Infinity
  const diff = Date.now() - new Date(lastContactDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Determina si un invitado necesita seguimiento (+72hs)
 */
export function needsFollowUp(guest) {
  if (guest.status === 'confirmed' || guest.status === 'declined') return false
  const days = daysSinceContact(guest.lastContact || guest.createdAt)
  return days >= 3
}
