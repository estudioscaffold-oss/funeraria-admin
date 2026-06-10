/* ─── Inventory types ───────────────────────── */
export type InventoryCategory =
  | "ataudes_urnas"
  | "preparacion"
  | "velatorio"
  | "traslado"
  | "ceremonia"
  | "documentacion"
  | "limpieza"
  | "oficina"
  | "otro";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku?: string; // código interno
  quantity: number;
  unit: string; // unidad, caja, kg, litros, metros…
  unitPrice: number; // valor por unidad
  description?: string; // características / observaciones
  minStock?: number; // stock mínimo de alerta
  location?: string; // ubicación en bodega
  supplier?: string; // proveedor
  createdAt: string;
  updatedAt: string;
}

/* ─── Fleet types ───────────────────────────── */
export type VehicleType =
  | "carroza_funebre"
  | "furgon"
  | "automovil"
  | "camioneta"
  | "carruaje"
  | "minibus"
  | "otro";

export type VehicleStatus = "activo" | "mantenimiento" | "inactivo" | "baja";

export interface VehicleDoc {
  number?: string; // nº póliza / nº permiso
  company?: string; // aseguradora / entidad
  issueDate?: string; // fecha emisión
  expiryDate: string; // fecha vencimiento
  notes?: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string; // marca
  model: string; // modelo
  year: number;
  color: string;
  plate: string; // patente
  vin?: string; // nº chasis / VIN
  capacity?: number; // capacidad de pasajeros
  mileage?: number; // kilometraje actual
  fuelType?: "gasolina" | "diesel" | "electrico" | "hibrido" | "gas";
  assignedTo?: string; // responsable / conductor
  status: VehicleStatus;
  // documentos
  circulationPermit?: VehicleDoc; // permiso de circulación
  soap?: VehicleDoc; // SOAP
  insurance?: VehicleDoc; // seguro
  technicalRevision?: VehicleDoc; // revisión técnica
  // mantenimiento
  lastService?: string; // última mantención YYYY-MM-DD
  nextService?: string; // próxima mantención
  nextServiceMileage?: number;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Financial types ───────────────────────── */
export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category:
    | "vehiculos"
    | "personal"
    | "instalaciones"
    | "insumos"
    | "servicios"
    | "otros";
  description: string;
  amount: number;
  paidTo?: string;
}

export interface CreditInstallment {
  id: string;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  method: "cheque" | "cuota" | "transferencia" | "otro";
  status: "pendiente" | "cobrado" | "vencido";
  reference?: string;
}

export interface CreditPlan {
  id: string;
  deceasedId: string;
  deceasedName: string;
  clientName: string;
  totalAmount: number;
  installments: CreditInstallment[];
  createdAt: string;
}

export type ServiceType =
  | "inhumacion"
  | "cremacion"
  | "traslado"
  | "velatorio"
  | "servicio_completo"
  | "otro";

export type ProcessStatus =
  | "recepcion"
  | "preparacion"
  | "velatorio"
  | "traslado"
  | "ceremonia"
  | "inhumacion_cremacion"
  | "completado";

export type ReligiousPreference =
  | "catolica"
  | "evangelica"
  | "judia"
  | "islamica"
  | "budista"
  | "ninguna"
  | "otra";

export interface FamilyContact {
  name: string;
  rut: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

export interface Document {
  id: string;
  name: string;
  type:
    | "defuncion"
    | "identidad"
    | "autopsia"
    | "cremacion"
    | "traslado"
    | "otro";
  url: string;
  uploadedAt: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  budgetId?: string;
  date: string;
  amount: number;
  method: "efectivo" | "transferencia" | "debito" | "credito" | "cheque";
  reference?: string;
  notes?: string;
  receivedBy?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface DeceasedBudget {
  id: string;
  number: string;
  title: string;
  sucursal: string;
  vendedor: string;
  date: string;
  items: BudgetItem[];
  discount: number;
  tax: number;
  notes?: string;
  status: "borrador" | "aprobado" | "facturado";
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

export type UserRole = "administrador" | "vendedor" | "operario" | "recepcion";

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  sucursal: string;
  active: boolean;
  createdAt: string;
}

export interface Convenio {
  id: string;
  name: string;
  entity: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  discountPct: number;
  description?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export type TaskStatus = "pendiente" | "en_curso" | "completado" | "cancelado";

export interface TaskResource {
  id: string;
  name: string; // ej: "Ataúd modelo X", "Urna", "Vehículo BCDK-41"
  quantity?: number;
  unit?: string; // ej: "unidad", "litros", "kg"
  notes?: string;
}

export interface ProcessTask {
  id: string;
  name: string;
  description?: string;
  assignedTo?: string; // kept for backwards compat
  assignedStaff?: string[]; // múltiples trabajadores
  resources?: TaskResource[]; // insumos / recursos
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status: TaskStatus;
  notes?: string;
  order: number;
}

export interface DeceasedRecord {
  id: string;
  fullName: string;
  rut: string;
  birthDate: string;
  nationality: string;
  deathDate: string;
  deathTime: string;
  deathPlace: string;
  deathCause?: string;
  familyContact: FamilyContact;
  serviceType: ServiceType;
  status: ProcessStatus;
  velatorio?: string;
  velatorioAddress?: string;
  cemetery?: string;
  cemeteryAddress?: string;
  crematorium?: string;
  crematoriumAddress?: string;
  religiousPreference: ReligiousPreference;
  religiousNotes?: string;
  urgencies?: string;
  restrictions?: string;
  sensitiveObservations?: string;
  documents: Document[];
  budgets: DeceasedBudget[];
  payments: PaymentRecord[];
  tasks: ProcessTask[];
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
}

export interface FuneralService {
  id: string;
  deceasedId: string;
  deceasedName: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  location: string;
  notes?: string;
  status: "programado" | "en_curso" | "completado" | "cancelado";
  color?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type ShiftType = "mañana" | "tarde" | "noche" | "libre";

export interface ShiftAssignment {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
}

export interface Quote {
  id: string;
  deceasedId?: string;
  deceasedName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  status: "borrador" | "enviada" | "aceptada" | "rechazada";
  createdAt: string;
  validUntil: string;
}
