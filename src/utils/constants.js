// Estados de cable-operadores
export const ESTADOS_CABLEOPERADOR = [
  { value: 'Contratado', label: 'Contratado' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'En_Renovacion', label: 'En Renovación' },
  { value: 'Renovacion_firma_prst', label: 'En Renovación - Firma PRST' },
  { value: 'Renovacion_firma_air_e', label: 'En Renovación - Firma AIR-E' },
  { value: 'nuevo_firma_prst', label: 'Nuevo - Firma PRST' },
  { value: 'nuevo_firma_air_e', label: 'Nuevo - Firma AIR-E' },
  { value: 'En_Gestion', label: 'En Gestión' },
  { value: 'Sin_usos', label: 'Sin Usos' },
]
// monto asegurado póliza de cumplimiento
export const MONTO_ASEGURADO_POLIZA_CUMPLIMIENTO = [
  { value: '15%_valor_contrato', label: '15% Valor del Contrato' },
  { value: '20%_valor_contrato', label: '20% Valor del Contrato' },
  { value: '30%_valor_contrato', label: '30% Valor del Contrato' },
  { value: '20%_valor_base_constitucion_poliza', label: '20% Valor base de Constitución de Póliza' },
  { value: '30%_valor_base_constitucion_poliza', label: '30% Valor base de Constitución de Póliza' },
]
// monto asegurado póliza de rce
export const MONTO_ASEGURADO_POLIZA_RCE = [
  { value: 'no_inferior_100_SMLMV', label: 'No inferior a 100 SMLMV' },
  { value: 'no_inferior_200_SMLMV', label: 'No inferior a 200 SMLMV' },
  { value: 'no_inferior_300_SMLMV', label: 'No inferior a 300 SMLMV' },
]
// vigencia amparo póliza
export const VIGENCIA_AMPARO_POLIZA = [
  { value: 'Igual_a_Duracion_de_Contrato_mas_12_Meses', label: 'Igual a Duración de Contrato + 12 Meses' },
  { value: 'Igual_a_Duracion_de_Contrato_mas_6_Meses', label: 'Igual a Duración de Contrato + 6 Meses' },
  { value: 'Igual_a_Duracion_de_Contrato_mas_4_Meses', label: 'Igual a Duración de Contrato + 4 Meses' },
  { value: 'Igual_a_Duracion_de_Contrato_mas_2_Meses', label: 'Igual a Duración de Contrato + 2 Meses' },
]
// Estados de contratos
export const ESTADOS_CONTRATO = [
  { value: 'Vigente', label: 'Vigente' },
  { value: 'Vencido', label: 'Vencido' },
]

// Respuesta preliquidación
export const RESPUESTA_PRELiquidACION = [
  { value: 'Calendarios', label: 'Calendarios' },
  { value: 'Habiles', label: 'Hábiles' },
]
// Notificaciones
export const TIPO_CHOICES = [
    { value: 'cobro_multa', label: 'Cobro de Multa' },
    { value: 'suspension_nuevos_accesos', label: 'Suspensión de Nuevos Accesos' },
    { value: 'cobro_prejuridico', label: 'Cobro Prejurídico' },
    { value: 'incumplimiento_pago_factura', label: 'Incumplimiento de Pago de Factura' },
]
// Paleta de colores
export const COLORS = {
  primary: '#0055b3',
  primaryHover: '#004099',
  secondary: '#2596be',
  secondaryHover: '#1e7a9a',
  accent: '#77d7c5',
  accentLight: '#a5e8dc',
  link: '#029ad7',
  linkHover: '#027ba6',
  success: '#03b097',
  successHover: '#028a7a',
}

