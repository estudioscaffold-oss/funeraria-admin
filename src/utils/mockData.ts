import type {
  DeceasedRecord,
  FuneralService,
  Quote,
  ProcessTask,
  CatalogCategory,
  AppUser,
  Convenio,
  InventoryItem,
  Sucursal,
} from "../types";

// ─── Sucursales mock (seed inicial) ──────────────────────────────────────────
export const MOCK_SUCURSALES: Sucursal[] = [
  {
    id: "suc-1",
    name: "Casa Central",
    address: "Av. Principal 1234",
    city: "Santiago",
    phone: "+56 2 2345 6789",
    email: "central@veladesk.cl",
    managerName: "Juan Pérez",
    managerPhone: "+56 9 8765 4321",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "suc-2",
    name: "Sucursal Norte",
    address: "Calle Norte 567",
    city: "Concepción",
    phone: "+56 2 2345 6790",
    email: "norte@veladesk.cl",
    managerName: "María González",
    managerPhone: "+56 9 8765 4322",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

// Helper para obtener nombres de sucursales (compatibilidad)
export const SUCURSALES = ["Casa Central", "Sucursal Norte", "Sucursal Sur"];

// ─── Inventario mock (seed inicial) ──────────────────────────────────────────
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv1",
    name: "Ataúd madera MDF estándar",
    category: "ataudes_urnas",
    sku: "AT-001",
    quantity: 8,
    unit: "unidad",
    unitPrice: 180000,
    minStock: 3,
    location: "Bodega A",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv2",
    name: "Urna cerámica blanca",
    category: "ataudes_urnas",
    sku: "UR-001",
    quantity: 12,
    unit: "unidad",
    unitPrice: 45000,
    minStock: 4,
    location: "Bodega A",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv3",
    name: "Formol 37%",
    category: "preparacion",
    sku: "PR-001",
    quantity: 20,
    unit: "litros",
    unitPrice: 8500,
    minStock: 5,
    location: "Bodega B",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Tareas predeterminadas del proceso funerario ────────────────────────────
export const DEFAULT_TASK_TEMPLATES: {
  name: string;
  description: string;
  offsetHours: number;
  durationHours: number;
}[] = [
  {
    name: "Servicio ingresado",
    description: "Registro del servicio, datos del fallecido y familia",
    offsetHours: 0,
    durationHours: 1,
  },
  {
    name: "Traslado",
    description: "Retiro del cuerpo desde el lugar de fallecimiento",
    offsetHours: 1,
    durationHours: 2,
  },
  {
    name: "Ingreso y preparación",
    description: "Recepción en funeraria, tanatopraxia y vestimenta",
    offsetHours: 3,
    durationHours: 4,
  },
  {
    name: "Ataúd preparado",
    description: "Acondicionamiento del ataúd y presentación del fallecido",
    offsetHours: 7,
    durationHours: 2,
  },
  {
    name: "Traslado a velatorio",
    description: "Traslado del fallecido a sala de velatorio",
    offsetHours: 9,
    durationHours: 1,
  },
  {
    name: "Velatorio en curso",
    description: "Período de velación con familia y allegados",
    offsetHours: 10,
    durationHours: 14,
  },
  {
    name: "Cortejo en tránsito",
    description: "Salida del velatorio y traslado en cortejo fúnebre",
    offsetHours: 24,
    durationHours: 1,
  },
  {
    name: "Sepultación realizada",
    description: "Ceremonia de sepultación en cementerio",
    offsetHours: 25,
    durationHours: 2,
  },
  {
    name: "Cremación realizada",
    description: "Proceso de cremación y entrega de cenizas",
    offsetHours: 25,
    durationHours: 3,
  },
  {
    name: "Servicio finalizado",
    description: "Cierre administrativo, documentos y entrega a familia",
    offsetHours: 27,
    durationHours: 1,
  },
];

/** Genera tareas por defecto calculadas desde la hora de fallecimiento */
export function generateDefaultTasks(
  deathDate: string,
  deathTime: string,
): ProcessTask[] {
  const base = new Date(`${deathDate}T${deathTime || "00:00"}:00`);
  return DEFAULT_TASK_TEMPLATES.map((t, i) => {
    const start = new Date(base.getTime() + t.offsetHours * 3600000);
    const end = new Date(start.getTime() + t.durationHours * 3600000);
    return {
      id: `task-default-${i}`,
      name: t.name,
      description: t.description,
      plannedStart: start.toISOString(),
      plannedEnd: end.toISOString(),
      status: "pendiente" as const,
      order: i,
    };
  });
}

// ─── Catálogo de vendedores ───────────────────────────────────────────────────
export const VENDEDORES = [
  "Carlos Mendoza",
  "Ana Fuentes",
  "Roberto Silva",
  "Patricia Morales",
  "Diego Castillo",
];

// ─── Catálogo por categoría → ítems con precio ───────────────────────────────
export const CATALOG: Record<string, { name: string; price: number }[]> = {
  "Ataúdes y Urnas": [
    { name: "Ataúd estándar madera MDF", price: 180000 },
    { name: "Ataúd madera pino", price: 280000 },
    { name: "Ataúd madera noble", price: 450000 },
    { name: "Ataúd madera caoba premium", price: 680000 },
    { name: "Ataúd infantil", price: 150000 },
    { name: "Urna cremación estándar", price: 85000 },
    { name: "Urna cremación madera tallada", price: 145000 },
    { name: "Urna cremación mármol", price: 220000 },
  ],
  Velatorio: [
    { name: "Sala velatorio 4h (Sala A)", price: 80000 },
    { name: "Sala velatorio 8h (Sala A)", price: 130000 },
    { name: "Sala velatorio 16h (Sala A)", price: 180000 },
    { name: "Sala velatorio 24h (Sala A)", price: 240000 },
    { name: "Sala velatorio VIP 8h", price: 220000 },
    { name: "Sala velatorio VIP 16h", price: 320000 },
    { name: "Velatorio en domicilio (8h)", price: 200000 },
  ],
  Florería: [
    { name: "Arreglo floral básico", price: 35000 },
    { name: "Arreglo floral intermedio", price: 55000 },
    { name: "Arreglo floral premium", price: 85000 },
    { name: "Corona fúnebre estándar", price: 65000 },
    { name: "Corona fúnebre premium", price: 110000 },
    { name: "Ramo de condolencias", price: 28000 },
    { name: "Decoración floral sala completa", price: 280000 },
    { name: "Flores solapa (por asistente)", price: 3500 },
  ],
  Cremación: [
    { name: "Servicio cremación adulto", price: 320000 },
    { name: "Servicio cremación infantil", price: 180000 },
    { name: "Cremación ecológica", price: 290000 },
    { name: "Dispersión de cenizas (trámite)", price: 45000 },
    { name: "Certificado autorización cremación", price: 15000 },
  ],
  Traslado: [
    { name: "Traslado local en carroza (hasta 30km)", price: 120000 },
    { name: "Traslado regional (31–200km)", price: 280000 },
    { name: "Traslado interregional (+200km)", price: 450000 },
    { name: "Traslado internacional (trámite)", price: 850000 },
    { name: "Traslado desde clínica/hospital", price: 80000 },
    { name: "Traslado desde domicilio", price: 65000 },
  ],
  "Documentación y Trámites": [
    { name: "Gestión certificado de defunción", price: 30000 },
    { name: "Inscripción en Registro Civil", price: 20000 },
    { name: "Permiso de sepultación", price: 15000 },
    { name: "Trámite pensión de sobrevivencia", price: 45000 },
    { name: "Publicación esquela (periódico)", price: 55000 },
    { name: "Publicación esquela (online)", price: 15000 },
    { name: "Carpeta documentación completa", price: 80000 },
  ],
  "Preparación y Servicios Especiales": [
    { name: "Tanatopraxia (embalsamamiento)", price: 120000 },
    { name: "Maquillaje y presentación", price: 80000 },
    { name: "Vestimenta funeraria", price: 45000 },
    { name: "Refrigeración (por día)", price: 35000 },
    { name: "Servicio de guardia nocturna", price: 60000 },
  ],
  "Ceremonia y Despedida": [
    { name: "Servicio religioso (coordinación)", price: 70000 },
    { name: "Música en vivo (dúo)", price: 110000 },
    { name: "Música grabada sistema sonido", price: 35000 },
    { name: "Libro de condolencias", price: 18000 },
    { name: "Video homenaje (15 min)", price: 95000 },
    { name: "Transmisión en vivo (streaming)", price: 65000 },
    { name: "Impresión recordatorio (100 uds)", price: 42000 },
  ],
  Inhumación: [
    { name: "Derecho sepultura perpetua", price: 980000 },
    { name: "Derecho sepultura temporal (5 años)", price: 280000 },
    { name: "Apertura nicho / fosa", price: 85000 },
    { name: "Cierre nicho / fosa", price: 55000 },
    { name: "Lápida básica", price: 120000 },
    { name: "Lápida mármol grabado", price: 280000 },
    { name: "Mantención anual nicho", price: 45000 },
  ],
};

// ─── Mock data ────────────────────────────────────────────────────────────────
export const mockDeceased: DeceasedRecord[] = [
  {
    id: "1",
    fullName: "Juan Carlos Pérez Morales",
    rut: "12.345.678-9",
    birthDate: "1945-03-15",
    nationality: "Chilena",
    deathDate: "2026-06-07",
    deathTime: "14:30",
    deathPlace: "Hospital San José, Santiago",
    deathCause: "Insuficiencia cardíaca",
    familyContact: {
      name: "María Pérez González",
      rut: "15.678.901-2",
      relationship: "Hija",
      phone: "+56 9 8765 4321",
      email: "maria.perez@email.com",
      address: "Av. Providencia 1234, Santiago",
    },
    serviceType: "servicio_completo",
    status: "velatorio",
    cemetery: "Cementerio General de Santiago",
    religiousPreference: "catolica",
    documents: [
      {
        id: "d1",
        name: "Certificado de Defunción",
        type: "defuncion",
        url: "#",
        uploadedAt: "2026-06-07T16:00:00Z",
      },
      {
        id: "d2",
        name: "Cédula de Identidad",
        type: "identidad",
        url: "#",
        uploadedAt: "2026-06-07T16:30:00Z",
      },
    ],
    budgets: [
      {
        id: "b1",
        number: "PPTO-2026-001",
        title: "Servicio completo inhumación",
        sucursal: "Casa Central",
        vendedor: "Carlos Mendoza",
        date: "2026-06-07",
        items: [
          {
            id: "bi1",
            category: "Ataúdes y Urnas",
            description: "Ataúd madera noble",
            quantity: 1,
            unitPrice: 450000,
          },
          {
            id: "bi2",
            category: "Velatorio",
            description: "Sala velatorio 16h (Sala A)",
            quantity: 1,
            unitPrice: 180000,
          },
          {
            id: "bi3",
            category: "Traslado",
            description: "Traslado local en carroza (hasta 30km)",
            quantity: 1,
            unitPrice: 120000,
          },
          {
            id: "bi4",
            category: "Florería",
            description: "Arreglo floral premium",
            quantity: 2,
            unitPrice: 85000,
          },
          {
            id: "bi5",
            category: "Documentación y Trámites",
            description: "Gestión certificado de defunción",
            quantity: 1,
            unitPrice: 30000,
          },
        ],
        discount: 50000,
        tax: 0,
        notes: "Pago en dos cuotas acordado con familia",
        status: "aprobado",
      },
    ],
    payments: [
      {
        id: "p1",
        budgetId: "b1",
        date: "2026-06-07T18:00:00Z",
        amount: 400000,
        method: "transferencia",
        reference: "TRF-2026-0607-001",
        notes: "Abono inicial",
        receivedBy: "Carlos Mendoza",
      },
      {
        id: "p2",
        budgetId: "b1",
        date: "2026-06-09T10:00:00Z",
        amount: 200000,
        method: "efectivo",
        notes: "Segundo abono",
        receivedBy: "Carlos Mendoza",
      },
    ],
    tasks: [
      {
        id: "t1-1",
        name: "Retiro del cuerpo",
        description: "Traslado desde Hospital San José",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-07T15:00:00",
        plannedEnd: "2026-06-07T17:00:00",
        actualStart: "2026-06-07T15:20:00",
        actualEnd: "2026-06-07T17:10:00",
        status: "completado",
        order: 0,
      },
      {
        id: "t1-2",
        name: "Recepción en funeraria",
        description: "Ingreso y registro del fallecido",
        assignedTo: "Patricia Morales",
        plannedStart: "2026-06-07T17:00:00",
        plannedEnd: "2026-06-07T18:00:00",
        actualStart: "2026-06-07T17:10:00",
        actualEnd: "2026-06-07T18:00:00",
        status: "completado",
        order: 1,
      },
      {
        id: "t1-3",
        name: "Preparación del cuerpo",
        description: "Tanatopraxia, vestimenta y presentación",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-07T18:00:00",
        plannedEnd: "2026-06-07T23:00:00",
        actualStart: "2026-06-07T18:00:00",
        status: "completado",
        order: 2,
      },
      {
        id: "t1-4",
        name: "Traslado a velatorio",
        description: "Traslado a Sala A - Funeraria Central",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-09T17:00:00",
        plannedEnd: "2026-06-09T18:00:00",
        status: "en_curso",
        order: 3,
      },
      {
        id: "t1-5",
        name: "Velatorio",
        description: "Período de velación con familia — Sala A",
        assignedTo: "Patricia Morales",
        plannedStart: "2026-06-09T18:00:00",
        plannedEnd: "2026-06-10T10:00:00",
        status: "pendiente",
        order: 4,
      },
      {
        id: "t1-6",
        name: "Traslado al cementerio",
        description: "Traslado en carroza al Cementerio General",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-10T10:30:00",
        plannedEnd: "2026-06-10T11:30:00",
        status: "pendiente",
        order: 5,
      },
      {
        id: "t1-7",
        name: "Inhumación",
        description: "Ceremonia final en Cementerio General de Santiago",
        assignedTo: "Carlos Mendoza",
        plannedStart: "2026-06-10T11:30:00",
        plannedEnd: "2026-06-10T13:00:00",
        status: "pendiente",
        order: 6,
      },
    ],
    createdAt: "2026-06-07T15:00:00Z",
    updatedAt: "2026-06-08T10:00:00Z",
    assignedStaff: "Carlos Mendoza",
  },
  {
    id: "2",
    fullName: "Rosa Elena Vidal Soto",
    rut: "8.901.234-5",
    birthDate: "1938-11-22",
    nationality: "Chilena",
    deathDate: "2026-06-08",
    deathTime: "09:15",
    deathPlace: "Domicilio particular, Maipú",
    familyContact: {
      name: "Pedro Vidal Muñoz",
      rut: "17.234.567-8",
      relationship: "Hijo",
      phone: "+56 9 7654 3210",
      email: "pedro.vidal@email.com",
      address: "Calle Los Aromos 567, Maipú",
    },
    serviceType: "cremacion",
    status: "preparacion",
    crematorium: "Crematorio Parque del Recuerdo",
    religiousPreference: "evangelica",
    urgencies: "Traslado urgente requerido antes de las 18:00",
    documents: [],
    budgets: [],
    payments: [],
    tasks: [
      {
        id: "t2-1",
        name: "Retiro del cuerpo",
        description: "Traslado desde domicilio en Maipú",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-08T10:00:00",
        plannedEnd: "2026-06-08T12:00:00",
        actualStart: "2026-06-08T10:30:00",
        actualEnd: "2026-06-08T12:15:00",
        status: "completado",
        order: 0,
      },
      {
        id: "t2-2",
        name: "Recepción en funeraria",
        description: "Ingreso y registro",
        assignedTo: "Patricia Morales",
        plannedStart: "2026-06-08T12:00:00",
        plannedEnd: "2026-06-08T13:00:00",
        actualStart: "2026-06-08T12:15:00",
        status: "completado",
        order: 1,
      },
      {
        id: "t2-3",
        name: "Preparación del cuerpo",
        description: "Preparación para cremación",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-08T13:00:00",
        plannedEnd: "2026-06-08T16:00:00",
        status: "en_curso",
        order: 2,
      },
      {
        id: "t2-4",
        name: "Traslado a crematorio",
        description: "Traslado a Crematorio Parque del Recuerdo",
        assignedTo: "Roberto Silva",
        plannedStart: "2026-06-09T14:00:00",
        plannedEnd: "2026-06-09T15:00:00",
        status: "pendiente",
        order: 3,
      },
      {
        id: "t2-5",
        name: "Cremación",
        description: "Servicio de cremación",
        assignedTo: "Ana Fuentes",
        plannedStart: "2026-06-09T15:00:00",
        plannedEnd: "2026-06-09T17:00:00",
        status: "pendiente",
        order: 4,
      },
    ],
    createdAt: "2026-06-08T10:30:00Z",
    updatedAt: "2026-06-08T10:30:00Z",
  },
];

export const mockServices: FuneralService[] = [
  {
    id: "s1",
    deceasedId: "1",
    deceasedName: "Juan Carlos Pérez Morales",
    serviceType: "velatorio",
    startDate: "2026-06-09T18:00:00",
    endDate: "2026-06-10T10:00:00",
    location: "Sala A - Funeraria Central",
    status: "programado",
    color: "#6366f1",
  },
  {
    id: "s2",
    deceasedId: "1",
    deceasedName: "Juan Carlos Pérez Morales",
    serviceType: "inhumacion",
    startDate: "2026-06-10T11:00:00",
    endDate: "2026-06-10T13:00:00",
    location: "Cementerio General de Santiago",
    status: "programado",
    color: "#6366f1",
  },
  {
    id: "s3",
    deceasedId: "2",
    deceasedName: "Rosa Elena Vidal Soto",
    serviceType: "cremacion",
    startDate: "2026-06-10T15:00:00",
    endDate: "2026-06-10T17:00:00",
    location: "Crematorio Parque del Recuerdo",
    status: "programado",
    color: "#ec4899",
  },
];

export const mockQuotes: Quote[] = [];

// ─── Labels y colores ─────────────────────────────────────────────────────────
export const SERVICE_LABELS: Record<string, string> = {
  inhumacion: "Inhumación",
  cremacion: "Cremación",
  traslado: "Traslado",
  velatorio: "Velatorio",
  servicio_completo: "Servicio Completo",
  otro: "Otro",
};

export const STATUS_LABELS: Record<string, string> = {
  recepcion: "Recepción",
  preparacion: "Preparación",
  velatorio: "Velatorio",
  traslado: "Traslado",
  ceremonia: "Ceremonia",
  inhumacion_cremacion: "Inhumación/Cremación",
  completado: "Completado",
};

export const STATUS_COLORS: Record<string, string> = {
  recepcion: "bg-blue-100 text-blue-800",
  preparacion: "bg-yellow-100 text-yellow-800",
  velatorio: "bg-purple-100 text-purple-800",
  traslado: "bg-orange-100 text-orange-800",
  ceremonia: "bg-indigo-100 text-indigo-800",
  inhumacion_cremacion: "bg-gray-100 text-gray-800",
  completado: "bg-green-100 text-green-800",
};

export const RELIGIOUS_LABELS: Record<string, string> = {
  catolica: "Católica",
  evangelica: "Evangélica",
  judia: "Judía",
  islamica: "Islámica",
  budista: "Budista",
  ninguna: "Sin preferencia",
  otra: "Otra",
};

export const BUDGET_STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  aprobado: "Aprobado",
  facturado: "Facturado",
};

export const BUDGET_STATUS_COLORS: Record<string, string> = {
  borrador: "bg-slate-100 text-slate-600",
  aprobado: "bg-emerald-100 text-emerald-700",
  facturado: "bg-blue-100 text-blue-700",
};

// legacy
export const defaultQuoteItems: { description: string; unitPrice: number }[] =
  Object.values(CATALOG).flatMap((items) =>
    items.map((i) => ({ description: i.name, unitPrice: i.price })),
  );

// ─── Catálogo estructurado con IDs (editable desde Admin) ────────────────────
export const mockCatalog: CatalogCategory[] = Object.entries(CATALOG).map(
  ([catName, items], ci) => ({
    id: `cat-${ci + 1}`,
    name: catName,
    items: items.map((item, ii) => ({
      id: `item-${ci + 1}-${ii + 1}`,
      name: item.name,
      price: item.price,
    })),
  }),
);

// ─── Usuarios mock ────────────────────────────────────────────────────────────
export const mockUsers: AppUser[] = [
  {
    id: "u1",
    fullName: "Carlos Mendoza",
    email: "carlos.mendoza@funeraria.cl",
    phone: "+56 9 8765 4321",
    role: "vendedor",
    sucursal: "Casa Central",
    active: true,
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "u2",
    fullName: "Ana Fuentes",
    email: "ana.fuentes@funeraria.cl",
    phone: "+56 9 7654 3210",
    role: "vendedor",
    sucursal: "Sucursal Norte",
    active: true,
    createdAt: "2025-02-15T08:00:00Z",
  },
  {
    id: "u3",
    fullName: "Roberto Silva",
    email: "roberto.silva@funeraria.cl",
    phone: "+56 9 6543 2109",
    role: "equipo_tecnico",
    sucursal: "Casa Central",
    active: true,
    createdAt: "2025-03-01T08:00:00Z",
  },
  {
    id: "u4",
    fullName: "Patricia Morales",
    email: "patricia.morales@funeraria.cl",
    phone: "+56 9 5432 1098",
    role: "administrador",
    sucursal: "Sucursal Sur",
    active: true,
    createdAt: "2025-04-20T08:00:00Z",
  },
  {
    id: "u5",
    fullName: "Diego Castillo",
    email: "diego.castillo@funeraria.cl",
    phone: "+56 9 4321 0987",
    role: "administrador",
    sucursal: "Casa Central",
    active: true,
    createdAt: "2024-12-01T08:00:00Z",
  },
];

// ─── Convenios mock ───────────────────────────────────────────────────────────
export const mockConvenios: Convenio[] = [
  {
    id: "c1",
    name: "Convenio ISAPRE Banmédica",
    entity: "Banmédica",
    contactName: "Rodrigo Pérez",
    contactPhone: "+56 2 2345 6789",
    contactEmail: "r.perez@banmedica.cl",
    discountPct: 10,
    description: "Descuento en servicio completo para afiliados",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    active: true,
  },
  {
    id: "c2",
    name: "Convenio Municipalidad de Santiago",
    entity: "Municipalidad de Santiago",
    contactName: "Laura González",
    contactPhone: "+56 2 3456 7890",
    contactEmail: "l.gonzalez@santiago.cl",
    discountPct: 15,
    description: "Servicios con descuento para residentes de Santiago",
    startDate: "2026-01-01",
    active: true,
  },
  {
    id: "c3",
    name: "Convenio Caja Los Andes",
    entity: "Caja de Compensación Los Andes",
    contactName: "Mario Castro",
    contactPhone: "+56 2 4567 8901",
    contactEmail: "m.castro@losandes.cl",
    discountPct: 8,
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    active: false,
  },
];

export const USER_ROLE_LABELS: Record<string, string> = {
  maestro: "Maestro",
  administrador: "Administrador",
  vendedor: "Vendedor",
  equipo_tecnico: "Equipo Técnico",
  familia: "Familia",
};

export const USER_ROLE_COLORS: Record<string, string> = {
  maestro: "bg-yellow-100 text-yellow-800",
  administrador: "bg-purple-100 text-purple-700",
  vendedor: "bg-blue-100 text-blue-700",
  equipo_tecnico: "bg-amber-100 text-amber-700",
  familia: "bg-emerald-100 text-emerald-700",
};
