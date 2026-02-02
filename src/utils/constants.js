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
export const MONTO_ASEGURADO_POLIZA_CHOICES = [
  { value: '15%_valor_contrato', label: '15% Valor del Contrato' },
  { value: '20%_valor_contrato', label: '20% Valor del Contrato' },
  { value: '30%_valor_contrato', label: '30% Valor del Contrato' },
  { value: '20%_valor_base_constitucion_poliza', label: '20% Valor base de Constitución de Póliza' },
  { value: '30%_valor_base_constitucion_poliza', label: '30% Valor base de Constitución de Póliza' },
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
// Estado inicial de proyectos
export const ESTADO_INICIAL = [
  { value: 'gestionar_escritorio', label: 'Gestionar desde Escritorio' },
  { value: 'gestionar_sitio', label: 'Gestionar en Sitio' },
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

// Países
export const PAISES = [
  { value: 'Colombia', label: 'Colombia' }
]

// Departamentos de Colombia
export const DEPARTAMENTOS_COLOMBIA = [
  { value: 'Amazonas', label: 'Amazonas' },
  { value: 'Antioquia', label: 'Antioquia' },
  { value: 'Atlántico', label: 'Atlántico' },
  { value: 'Arauca', label: 'Arauca' },
  { value: 'Bogotá D.C.', label: 'Bogotá D.C.' },
  { value: 'Bolívar', label: 'Bolívar' },
  { value: 'Boyacá', label: 'Boyacá' },
  { value: 'Caldas', label: 'Caldas' },
  { value: 'Caquetá', label: 'Caquetá' },
  { value: 'Casanare', label: 'Casanare' },
  { value: 'Cauca', label: 'Cauca' },
  { value: 'Cesar', label: 'Cesar' },
  { value: 'Chocó', label: 'Chocó' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Cundinamarca', label: 'Cundinamarca' },
  { value: 'Guainía', label: 'Guainía' },
  { value: 'Guaviare', label: 'Guaviare' },
  { value: 'Huila', label: 'Huila' },
  { value: 'La Guajira', label: 'La Guajira' },
  { value: 'Magdalena', label: 'Magdalena' },
  { value: 'Meta', label: 'Meta' },
  { value: 'Nariño', label: 'Nariño' },
  { value: 'Norte de Santander', label: 'Norte de Santander' },
  { value: 'Putumayo', label: 'Putumayo' },
  { value: 'Quindío', label: 'Quindío' },
  { value: 'Risaralda', label: 'Risaralda' },
  { value: 'San Andrés y Providencia', label: 'San Andrés y Providencia' },
  { value: 'Santander', label: 'Santander' },
  { value: 'Sucre', label: 'Sucre' },
  { value: 'Tolima', label: 'Tolima' },
  { value: 'Valle del Cauca', label: 'Valle del Cauca' },
  { value: 'Vaupés', label: 'Vaupés' },
  { value: 'Vichada', label: 'Vichada' },
]

// Municipios de Colombia por departamento (lista simplificada)
export const MUNICIPIOS_COLOMBIA = {
  'Amazonas': [
    { value: 'Leticia', label: 'Leticia' },
    { value: 'Puerto Nariño', label: 'Puerto Nariño' },
  ],
  'Antioquia': [
    { value: 'Medellín', label: 'Medellín' },
    { value: 'Envigado', label: 'Envigado' },
    { value: 'Itagüí', label: 'Itagüí' },
    { value: 'Bello', label: 'Bello' },
    { value: 'Sabaneta', label: 'Sabaneta' },
    { value: 'Rionegro', label: 'Rionegro' },
    { value: 'Apartadó', label: 'Apartadó' },
  ],
  'Arauca': [
    { value: 'Arauca', label: 'Arauca' },
    { value: 'Arauquita', label: 'Arauquita' },
    { value: 'Saravena', label: 'Saravena' },
    { value: 'Tame', label: 'Tame' },
  ],
  'Atlántico': [
    { value: 'Barranquilla', label: 'Barranquilla' },
    { value: 'Soledad', label: 'Soledad' },
    { value: 'Malambo', label: 'Malambo' },
    { value: 'Baranoa', label: 'Baranoa' },
    { value: 'Sabanalarga', label: 'Sabanalarga' },
    { value: 'Santo Tomás', label: 'Santo Tomás' },
    { value: 'Juan de Acosta', label: 'Juan de Acosta' },
    { value: 'Sabanagrande', label: 'Sabanagrande' },
    { value: 'Manatí', label: 'Manatí' },
    { value: 'Ponedera', label: 'Ponedera' },
    { value: 'Puerto Colombia', label: 'Puerto Colombia' },
  ],
  'Bolívar': [
    { value: 'Cartagena', label: 'Cartagena' },
    { value: 'Magangué', label: 'Magangué' },
    { value: 'Turbaco', label: 'Turbaco' },
  ],
  'Boyacá': [
    { value: 'Tunja', label: 'Tunja' },
    { value: 'Duitama', label: 'Duitama' },
    { value: 'Sogamoso', label: 'Sogamoso' },
  ],
  'Caldas': [
    { value: 'Manizales', label: 'Manizales' },
    { value: 'Villamaría', label: 'Villamaría' },
    { value: 'La Dorada', label: 'La Dorada' },
  ],
  'Caquetá': [
    { value: 'Florencia', label: 'Florencia' },
    { value: 'San Vicente del Caguán', label: 'San Vicente del Caguán' },
  ],
  'Casanare': [
    { value: 'Yopal', label: 'Yopal' },
    { value: 'Aguazul', label: 'Aguazul' },
  ],
  'Cauca': [
    { value: 'Popayán', label: 'Popayán' },
    { value: 'Santander de Quilichao', label: 'Santander de Quilichao' },
  ],
  'Cesar': [
    { value: 'Valledupar', label: 'Valledupar' },
    { value: 'Aguachica', label: 'Aguachica' },
    { value: 'Codazzi', label: 'Codazzi' },
    { value: 'Astrea', label: 'Astrea' },
    { value: 'El Copey', label: 'El Copey' },
  ],
  'Chocó': [
    { value: 'Quibdó', label: 'Quibdó' },
    { value: 'Istmina', label: 'Istmina' },
  ],
  'Córdoba': [
    { value: 'Montería', label: 'Montería' },
    { value: 'Cereté', label: 'Cereté' },
    { value: 'Sahagún', label: 'Sahagún' },
    { value: 'Montelibano', label: 'Montelibano' },
  ],
  'Cundinamarca': [
    { value: 'Chía', label: 'Chía' },
    { value: 'Zipaquirá', label: 'Zipaquirá' },
    { value: 'Fusagasugá', label: 'Fusagasugá' },
    { value: 'Soacha', label: 'Soacha' },
    { value: 'Girardot', label: 'Girardot' },
    { value: 'Facatativá', label: 'Facatativá' },
    { value: 'Bogotá', label: 'Bogotá' },
    { value: 'Funza', label: 'Funza' },
    { value: 'Bojacá', label: 'Bojacá' },
  ],
  'Guainía': [
    { value: 'Inírida', label: 'Inírida' },
  ],
  'Guaviare': [
    { value: 'San José del Guaviare', label: 'San José del Guaviare' },
  ],
  'Huila': [
    { value: 'Neiva', label: 'Neiva' },
    { value: 'Pitalito', label: 'Pitalito' },
    { value: 'Garzón', label: 'Garzón' },
  ],
  'La Guajira': [
    { value: 'Riohacha', label: 'Riohacha' },
    { value: 'Maicao', label: 'Maicao' },
    { value: 'San Juan del Cesar', label: 'San Juan del Cesar' },
    { value: 'Dibulla', label: 'Dibulla' },
    { value: 'Albania', label: 'Albania' },
    { value: 'Fonseca', label: 'Fonseca' },
    { value: 'Hatonuevo', label: 'Hatonuevo' },
    { value: 'Barrancas', label: 'Barrancas' },
    { value: 'Manaure', label: 'Manaure' },
    { value: 'Uribia', label: 'Uribia' },
    { value: 'San Juan del Cesar', label: 'San Juan del Cesar' },
    { value: 'Manaure', label: 'Manaure' },
  ],
  'Magdalena': [
    { value: 'Santa Marta', label: 'Santa Marta' },
    { value: 'Ciénaga', label: 'Ciénaga' },
    { value: 'Fundación', label: 'Fundación' },
    { value: 'Pueblo Viejo', label: 'Pueblo Viejo' },
    { value: 'Zona Bananera', label: 'Zona Bananera' },
    { value: 'Aracataca', label: 'Aracataca' },
  ],
  'Meta': [
    { value: 'Villavicencio', label: 'Villavicencio' },
    { value: 'Acacías', label: 'Acacías' },
    { value: 'Granada', label: 'Granada' },
  ],
  'Nariño': [
    { value: 'Pasto', label: 'Pasto' },
    { value: 'Tumaco', label: 'Tumaco' },
    { value: 'Ipiales', label: 'Ipiales' },
  ],
  'Norte de Santander': [
    { value: 'Cúcuta', label: 'Cúcuta' },
    { value: 'Ocaña', label: 'Ocaña' },
    { value: 'Villa del Rosario', label: 'Villa del Rosario' },
    { value: 'Pamplona', label: 'Pamplona' },
  ],
  'Putumayo': [
    { value: 'Mocoa', label: 'Mocoa' },
    { value: 'Puerto Asís', label: 'Puerto Asís' },
  ],
  'Quindío': [
    { value: 'Armenia', label: 'Armenia' },
    { value: 'Calarcá', label: 'Calarcá' },
    { value: 'Quimbaya', label: 'Quimbaya' },
  ],
  'Risaralda': [
    { value: 'Pereira', label: 'Pereira' },
    { value: 'Dosquebradas', label: 'Dosquebradas' },
    { value: 'Santa Rosa de Cabal', label: 'Santa Rosa de Cabal' },
  ],
  'San Andrés y Providencia': [
    { value: 'San Andrés', label: 'San Andrés' },
    { value: 'Providencia', label: 'Providencia' },
  ],
  'Santander': [
    { value: 'Bucaramanga', label: 'Bucaramanga' },
    { value: 'Floridablanca', label: 'Floridablanca' },
    { value: 'Girón', label: 'Girón' },
    { value: 'Piedecuesta', label: 'Piedecuesta' },
    { value: 'Barrancabermeja', label: 'Barrancabermeja' },
  ],
  'Sucre': [
    { value: 'Sincelejo', label: 'Sincelejo' },
    { value: 'Corozal', label: 'Corozal' },
  ],
  'Tolima': [
    { value: 'Ibagué', label: 'Ibagué' },
    { value: 'Espinal', label: 'Espinal' },
    { value: 'Melgar', label: 'Melgar' },
  ],
  'Valle del Cauca': [
    { value: 'Cali', label: 'Cali' },
    { value: 'Palmira', label: 'Palmira' },
    { value: 'Buenaventura', label: 'Buenaventura' },
    { value: 'Tuluá', label: 'Tuluá' },
    { value: 'Buga', label: 'Buga' },
    { value: 'Jamundí', label: 'Jamundí' },
  ],
  'Vaupés': [
    { value: 'Mitú', label: 'Mitú' },
  ],
  'Vichada': [
    { value: 'Puerto Carreño', label: 'Puerto Carreño' },
  ],
};

// Constantes para Postes
export const MATERIALES_POSTE = [
  { value: 'Madera', label: 'Madera' },
  { value: 'Concreto', label: 'Concreto' },
  { value: 'Metalico', label: 'Metálico' },
  { value: 'Prefabricado', label: 'Prefabricado' },
  { value: 'Fibra', label: 'Fibra' },
];

export const TIPO_POSTE = [
  { value: 'BT', label: 'BT' },
  { value: 'MT', label: 'MT' },
  { value: 'MT-BT', label: 'MT-BT' },
  { value: 'torre_str', label: 'Torre STR' },
  { value: 'sin_identificar', label: 'Sin Identificar' },
];

export const DEPARTAMENTOS_POSTES = [
  { value: 'atlantico', label: 'ATLÁNTICO' },
  { value: 'magdalena', label: 'MAGDALENA' },
  { value: 'la_guajira', label: 'LA GUAJIRA' },
];

export const FUENTE_USOS = [
  { value: 'Contrato', label: 'Contrato' },
  { value: 'Legalizacion', label: 'Legalización' },
  { value: 'Viabilidad', label: 'Viabilidad' },
];

export const TIPO_COORDENADA = [
  { value: 'Real', label: 'Real' },
  { value: 'Ficticio', label: 'Ficticio' },
];

export const TIPO_ELEMENTO = [
  { value: 'Cable', label: 'Cable' },
  { value: 'Caja_empalme', label: 'Caja empalme' },
  { value: 'Nap', label: 'NAP' },
  { value: 'Reserva', label: 'Reserva' },
  { value: 'Cruce_americano', label: 'Cruce americano' },
  { value: 'Gabinete', label: 'Gabinete' },
  { value: 'Fuentes', label: 'Fuentes' },
  { value: 'Antena', label: 'Antena' },
  { value: 'Antena_bts', label: 'Antena BTS' },
  { value: 'Bajante', label: 'Bajante' },
  { value: 'brazo_extensor', label: 'Brazo extensor' },
];

export const ELEMENTOS_EXISTENTES = [
  { value: 'Cortacircuitos/Seccionador', label: 'Cortacircuitos/Seccionador' },
  { value: 'Transformador de distribución', label: 'Transformador de distribución' },
  { value: 'Interruptor de Potencia', label: 'Interruptor de Potencia'},
  { value: 'Reconectador', label: 'Reconectador' },
];

export const CHOICE_TIPO_POSTE = [
  { value: 'BT', label: 'BT'},
  { value: 'MT', label: 'MT'},
  { value: 'MT-BT', label: 'MT-BT'},
  { value: 'Torre STR', label: 'Torre STR'},
  { value: 'Sin identificar', label: 'Sin identificar'},
];

export const MATERIALES = [
  { value: 'Concreto', label: 'Concreto'},
  { value: 'Madera', label: 'Madera'},
  { value: 'Metalico', label: 'Metalico'},
  { value: 'Fibra', label: 'Fibra'},
];

export const ALTURAS = [
  { value: 8, label: '8'},
  { value: 9, label: '9'},
  { value: 10, label: '10'},
  { value: 11, label: '11'},
  { value: 12, label: '12'},
  { value: 14, label: '14'},
  { value: 16, label: '16'},
  { value: 18, label: '18'},
  { value: 25, label: '25'},
];