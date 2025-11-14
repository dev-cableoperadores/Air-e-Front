import { format, parseISO } from 'date-fns'

// Formatear fecha para mostrar
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    return date
  }
}

// Formatear fecha para input
export const formatDateForInput = (date) => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'yyyy-MM-dd')
  } catch (error) {
    return date
  }
}

// Formatear moneda
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Formatear número
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}

// Formatear teléfono
export const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.toString().replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Formatear Mes_uso para mostrar solo mes/año (MM/yyyy)
export const formatMonthYear = (date) => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MM/yyyy')
  } catch (error) {
    return date
  }
}

// Convertir mes a formato date con día 01 para enviar al backend
// Recibe formato "YYYY-MM" y retorna "YYYY-MM-01"
export const convertMonthToDate = (monthString) => {
  if (!monthString) return ''
  try {
    // monthString viene en formato "YYYY-MM" del input type="month"
    return `${monthString}-01`
  } catch (error) {
    return ''
  }
}

// Calcular mes siguiente (para Periodo_vencimiento a partir de Mes_uso)
export const addOneMonth = (monthString) => {
  if (!monthString) return ''
  try {
    // monthString viene en formato "YYYY-MM" del input type="month"
    const [year, month] = monthString.split('-').map(Number)
    let newMonth = month + 1
    let newYear = year
    
    if (newMonth > 12) {
      newMonth = 1
      newYear = year + 1
    }
    
    // Retornar en formato "YYYY-MM" para el input type="month"
    return `${newYear}-${String(newMonth).padStart(2, '0')}`
  } catch (error) {
    return ''
  }
}

