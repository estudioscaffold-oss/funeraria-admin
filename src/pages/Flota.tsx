import { useState } from "react";
import type { Vehicle, VehicleType, VehicleStatus, VehicleDoc } from "../types";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Car,
  Shield,
  FileText,
  User,
  Calendar,
  Hash,
  Gauge,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

/* ─── labels & config ────────────────────────── */
const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  carroza_funebre: "Carroza Fúnebre",
  furgon: "Furgón",
  automovil: "Automóvil",
  camioneta: "Camioneta",
  carruaje: "Carruaje",
  minibus: "Minibús",
  otro: "Otro",
};

const VEHICLE_TYPE_ICONS: Record<VehicleType, string> = {
  carroza_funebre: "⚰️",
  furgon: "🚐",
  automovil: "🚗",
  camioneta: "🛻",
  carruaje: "🐴",
  minibus: "🚌",
  otro: "🚙",
};

const STATUS_CFG: Record<
  VehicleStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  activo: {
    label: "Activo",
    color: "#6EE7B7",
    bg: "rgba(16,185,129,0.12)",
    dot: "#10B981",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "#FCD34D",
    bg: "rgba(245,158,11,0.12)",
    dot: "#F59E0B",
  },
  inactivo: {
    label: "Inactivo",
    color: "#8FA3B8",
    bg: "rgba(107,114,128,0.12)",
    dot: "#6B7280",
  },
  baja: {
    label: "Baja",
    color: "#FCA5A5",
    bg: "rgba(239,68,68,0.12)",
    dot: "#EF4444",
  },
};

const FUEL_LABELS = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
  gas: "Gas",
};

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm transition-all duration-200 input-veladesk";
const labelCls = "block text-xs font-semibold mb-1.5 uppercase tracking-wide";

/* ─── mock initial data ──────────────────────── */
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    type: "carroza_funebre",
    brand: "Mercedes-Benz",
    model: "Sprinter",
    year: 2021,
    color: "Negro",
    plate: "BCDK-41",
    vin: "WDB9066351S123456",
    capacity: 1,
    mileage: 45200,
    fuelType: "diesel",
    assignedTo: "Roberto Sánchez",
    status: "activo",
    circulationPermit: {
      number: "CP-2024-001",
      issueDate: "2024-01-10",
      expiryDate: "2025-01-10",
    },
    soap: {
      number: "SOAP-2024-01",
      company: "Mapfre",
      issueDate: "2024-01-01",
      expiryDate: "2025-01-01",
    },
    insurance: {
      number: "POL-45892",
      company: "Mapfre Seguros",
      issueDate: "2024-03-01",
      expiryDate: "2025-03-01",
      notes: "Cobertura total, daños a terceros",
    },
    technicalRevision: {
      number: "RT-2024-0412",
      issueDate: "2024-04-12",
      expiryDate: "2026-04-12",
    },
    lastService: "2024-10-15",
    nextService: "2025-04-15",
    nextServiceMileage: 50000,
    observations: "Carroza principal. Climatización interior.",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-10-15T00:00:00Z",
  },
  {
    id: "v2",
    type: "furgon",
    brand: "Ford",
    model: "Transit",
    year: 2019,
    color: "Blanco",
    plate: "GJRP-12",
    capacity: 8,
    mileage: 98300,
    fuelType: "diesel",
    assignedTo: "Ana Martínez",
    status: "activo",
    circulationPermit: {
      number: "CP-2024-002",
      issueDate: "2024-01-10",
      expiryDate: "2026-06-20",
    },
    soap: {
      number: "SOAP-2024-02",
      company: "BCI Seguros",
      issueDate: "2024-01-01",
      expiryDate: "2026-07-01",
    },
    insurance: {
      number: "POL-33210",
      company: "BCI Seguros",
      issueDate: "2024-01-01",
      expiryDate: "2026-01-01",
    },
    technicalRevision: {
      number: "RT-2023-1122",
      issueDate: "2023-11-22",
      expiryDate: "2025-11-22",
    },
    lastService: "2024-08-01",
    nextService: "2025-02-01",
    nextServiceMileage: 105000,
    createdAt: "2020-03-01T00:00:00Z",
    updatedAt: "2024-08-01T00:00:00Z",
  },
  {
    id: "v3",
    type: "automovil",
    brand: "Toyota",
    model: "Corolla",
    year: 2022,
    color: "Gris",
    plate: "FFMN-90",
    capacity: 5,
    mileage: 21000,
    fuelType: "hibrido",
    assignedTo: "Patricia Rojas",
    status: "mantenimiento",
    circulationPermit: {
      number: "CP-2024-003",
      issueDate: "2024-01-10",
      expiryDate: "2026-08-01",
    },
    soap: {
      number: "SOAP-2024-03",
      company: "Sura",
      issueDate: "2024-01-01",
      expiryDate: "2026-09-01",
    },
    insurance: {
      number: "POL-78901",
      company: "Sura Seguros",
      issueDate: "2024-06-01",
      expiryDate: "2026-06-01",
    },
    lastService: "2024-11-01",
    nextService: "2025-05-01",
    observations: "En revisión de suspensión delantera.",
    createdAt: "2022-05-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
];

/* ─── doc expiry helpers ─────────────────────── */
function docStatus(doc?: VehicleDoc): "ok" | "warning" | "expired" | "missing" {
  if (!doc?.expiryDate) return "missing";
  try {
    const days = differenceInDays(parseISO(doc.expiryDate), new Date());
    if (days < 0) return "expired";
    if (days < 60) return "warning";
    return "ok";
  } catch {
    return "missing";
  }
}

const DOC_STATUS_CFG = {
  ok: { color: "#6EE7B7", icon: CheckCircle2 },
  warning: { color: "#FCD34D", icon: AlertTriangle },
  expired: { color: "#FCA5A5", icon: AlertTriangle },
  missing: { color: "#6B7280", icon: Clock },
};

function DocBadge({ label, doc }: { label: string; doc?: VehicleDoc }) {
  const st = docStatus(doc);
  const { color, icon: Icon } = DOC_STATUS_CFG[st];
  const days = doc?.expiryDate
    ? differenceInDays(parseISO(doc.expiryDate), new Date())
    : null;
  return (
    <div
      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={10} style={{ color }} />
      <span style={{ color }}>{label}</span>
      {days !== null && (
        <span style={{ color: "rgba(143,163,184,0.7)" }}>
          {days < 0 ? `vencido hace ${Math.abs(days)}d` : `${days}d`}
        </span>
      )}
    </div>
  );
}

/* ─── doc form section ───────────────────────── */
function DocFields({
  title,
  icon: Icon,
  value,
  onChange,
}: {
  title: string;
  icon: React.ElementType;
  value: Partial<VehicleDoc>;
  onChange: (v: Partial<VehicleDoc>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(201,169,110,0.15)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        <Icon size={14} style={{ color: "#C9A96E" }} />
        <span
          className="text-sm font-semibold flex-1"
          style={{ color: "#F0EDE8" }}
        >
          {title}
        </span>
        {value.expiryDate && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background:
                docStatus(value as VehicleDoc) === "ok"
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(245,158,11,0.12)",
              color:
                docStatus(value as VehicleDoc) === "ok" ? "#6EE7B7" : "#FCD34D",
            }}
          >
            {format(parseISO(value.expiryDate), "dd MMM yyyy", { locale: es })}
          </span>
        )}
        <ChevronDown
          size={13}
          style={{ color: "#8FA3B8" }}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-4 grid grid-cols-2 gap-3"
          style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div className="col-span-2 mt-3">
            <label className={labelCls} style={{ color: "#C9A96E" }}>
              Número / Póliza
            </label>
            <input
              className={inputCls}
              value={value.number ?? ""}
              onChange={(e) => onChange({ ...value, number: e.target.value })}
              placeholder="Nº de documento"
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: "#C9A96E" }}>
              Compañía / Entidad
            </label>
            <input
              className={inputCls}
              value={value.company ?? ""}
              onChange={(e) => onChange({ ...value, company: e.target.value })}
              placeholder="Ej: Mapfre"
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: "#C9A96E" }}>
              Fecha emisión
            </label>
            <input
              type="date"
              className={inputCls}
              value={value.issueDate ?? ""}
              onChange={(e) =>
                onChange({ ...value, issueDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: "#C9A96E" }}>
              Fecha vencimiento *
            </label>
            <input
              type="date"
              className={inputCls}
              value={value.expiryDate ?? ""}
              onChange={(e) =>
                onChange({ ...value, expiryDate: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls} style={{ color: "#C9A96E" }}>
              Observaciones
            </label>
            <input
              className={inputCls}
              value={value.notes ?? ""}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              placeholder="Cobertura, condiciones especiales…"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── vehicle card ───────────────────────────── */
function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_CFG[vehicle.status];
  const criticalDocs = [
    { label: "Permiso circ.", doc: vehicle.circulationPermit },
    { label: "SOAP", doc: vehicle.soap },
    { label: "Seguro", doc: vehicle.insurance },
    { label: "Rev. Técnica", doc: vehicle.technicalRevision },
  ].filter(
    (d) => docStatus(d.doc) === "warning" || docStatus(d.doc) === "expired",
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      {/* header */}
      <div className="flex items-stretch">
        {/* colored left stripe by status */}
        <div className="w-1.5 shrink-0" style={{ background: st.dot }} />

        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
            {/* type icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{
                background: "rgba(201,169,110,0.08)",
                border: "1px solid rgba(201,169,110,0.15)",
              }}
            >
              {VEHICLE_TYPE_ICONS[vehicle.type]}
            </div>

            {/* main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="text-base font-bold"
                  style={{ color: "#F0EDE8" }}
                >
                  {vehicle.brand} {vehicle.model}
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: st.bg, color: st.color }}
                >
                  ● {st.label}
                </span>
              </div>
              <div
                className="flex items-center gap-3 mt-1 flex-wrap text-xs"
                style={{ color: "#8FA3B8" }}
              >
                <span>{vehicle.year}</span>
                <span>·</span>
                <span
                  className="font-mono font-bold"
                  style={{ color: "#C9A96E" }}
                >
                  {vehicle.plate}
                </span>
                <span>·</span>
                <span>{VEHICLE_TYPE_LABELS[vehicle.type]}</span>
                <span>·</span>
                <span>{vehicle.color}</span>
                {vehicle.fuelType && (
                  <>
                    <span>·</span>
                    <span>{FUEL_LABELS[vehicle.fuelType]}</span>
                  </>
                )}
              </div>
              {vehicle.assignedTo && (
                <div
                  className="flex items-center gap-1 mt-1 text-xs"
                  style={{ color: "#8FA3B8" }}
                >
                  <User size={10} /> {vehicle.assignedTo}
                </div>
              )}
            </div>

            {/* actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  background: "rgba(201,169,110,0.08)",
                  color: "#C9A96E",
                  border: "1px solid rgba(201,169,110,0.2)",
                }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#FCA5A5",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* doc alerts */}
          {criticalDocs.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {criticalDocs.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#FCA5A5",
                  }}
                >
                  <AlertTriangle size={10} /> {d.label} vence pronto
                </div>
              ))}
            </div>
          )}

          {/* doc badges row */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <DocBadge label="Permiso circ." doc={vehicle.circulationPermit} />
            <DocBadge label="SOAP" doc={vehicle.soap} />
            <DocBadge label="Seguro" doc={vehicle.insurance} />
            <DocBadge label="Rev. Técnica" doc={vehicle.technicalRevision} />
          </div>

          {/* expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-xs mt-3 transition-colors"
            style={{ color: "#8FA3B8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A96E")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8FA3B8")}
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Ocultar detalles" : "Ver detalles"}
          </button>

          {/* expanded details */}
          {expanded && (
            <div
              className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4"
              style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
            >
              {[
                { icon: Hash, label: "VIN / Chasis", value: vehicle.vin },
                {
                  icon: Gauge,
                  label: "Kilometraje",
                  value: vehicle.mileage
                    ? `${vehicle.mileage.toLocaleString()} km`
                    : undefined,
                },
                {
                  icon: Car,
                  label: "Capacidad",
                  value: vehicle.capacity
                    ? `${vehicle.capacity} personas`
                    : undefined,
                },
                {
                  icon: Wrench,
                  label: "Último servicio",
                  value: vehicle.lastService
                    ? format(parseISO(vehicle.lastService), "d MMM yyyy", {
                        locale: es,
                      })
                    : undefined,
                },
                {
                  icon: Calendar,
                  label: "Próx. mantención",
                  value: vehicle.nextService
                    ? format(parseISO(vehicle.nextService), "d MMM yyyy", {
                        locale: es,
                      })
                    : undefined,
                },
                {
                  icon: Gauge,
                  label: "Próx. mantención km",
                  value: vehicle.nextServiceMileage
                    ? `${vehicle.nextServiceMileage.toLocaleString()} km`
                    : undefined,
                },
              ]
                .filter((f) => f.value)
                .map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(6,14,26,0.4)",
                      border: "1px solid rgba(201,169,110,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={10} style={{ color: "#C9A96E" }} />
                      <span className="text-xs" style={{ color: "#8FA3B8" }}>
                        {label}
                      </span>
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F0EDE8" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              {vehicle.observations && (
                <div
                  className="col-span-2 md:col-span-4 rounded-xl p-3"
                  style={{
                    background: "rgba(6,14,26,0.4)",
                    border: "1px solid rgba(201,169,110,0.08)",
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: "#8FA3B8" }}>
                    Observaciones
                  </p>
                  <p className="text-sm" style={{ color: "#F0EDE8" }}>
                    {vehicle.observations}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── empty doc ──────────────────────────────── */
const emptyDoc = (): Partial<VehicleDoc> => ({
  number: "",
  company: "",
  issueDate: "",
  expiryDate: "",
  notes: "",
});

/* ─── empty vehicle ──────────────────────────── */
const emptyVehicle = (): Omit<Vehicle, "id" | "createdAt" | "updatedAt"> => ({
  type: "carroza_funebre",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  plate: "",
  vin: "",
  capacity: undefined,
  mileage: undefined,
  fuelType: "diesel",
  assignedTo: "",
  status: "activo",
  circulationPermit: emptyDoc() as VehicleDoc,
  soap: emptyDoc() as VehicleDoc,
  insurance: emptyDoc() as VehicleDoc,
  technicalRevision: emptyDoc() as VehicleDoc,
  lastService: "",
  nextService: "",
  nextServiceMileage: undefined,
  observations: "",
});

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Flota() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "todos">(
    "todos",
  );
  const [filterType, setFilterType] = useState<VehicleType | "todos">("todos");
  const [form, setForm] =
    useState<Omit<Vehicle, "id" | "createdAt" | "updatedAt">>(emptyVehicle());

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditId(null);
    setForm(emptyVehicle());
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditId(v.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = v;
    setForm({ ...emptyVehicle(), ...rest });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.brand || !form.model || !form.plate) return;
    const now = new Date().toISOString();
    if (editId) {
      setVehicles((p) =>
        p.map((v) => (v.id === editId ? { ...v, ...form, updatedAt: now } : v)),
      );
    } else {
      setVehicles((p) => [
        ...p,
        { ...form, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) setVehicles((p) => p.filter((v) => v.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = vehicles.filter(
    (v) =>
      (filterStatus === "todos" || v.status === filterStatus) &&
      (filterType === "todos" || v.type === filterType),
  );

  /* stats */
  const stats = {
    total: vehicles.length,
    activos: vehicles.filter((v) => v.status === "activo").length,
    mantenimiento: vehicles.filter((v) => v.status === "mantenimiento").length,
    alertas: vehicles.filter((v) =>
      [v.circulationPermit, v.soap, v.insurance, v.technicalRevision].some(
        (d) => ["warning", "expired"].includes(docStatus(d)),
      ),
    ).length,
  };

  return (
    <div className="p-8 space-y-6" style={{ color: "#F0EDE8" }}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 animate-fade-in">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#C9A96E" }}
          >
            Gestión de Flota
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#F0EDE8" }}>
            Vehículos
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8FA3B8" }}>
            {stats.total} unidades · {stats.activos} activas ·{" "}
            {stats.mantenimiento} en mantención
            {stats.alertas > 0 && (
              <span className="ml-2 font-semibold" style={{ color: "#FCA5A5" }}>
                · ⚠ {stats.alertas} con documentos por vencer
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 btn-gold"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={16} /> Agregar vehículo
          </span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* status filter */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(201,169,110,0.2)" }}
        >
          {(
            ["todos", "activo", "mantenimiento", "inactivo", "baja"] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200"
              style={
                filterStatus === s
                  ? {
                      background: "linear-gradient(135deg,#D4AF70,#A07840)",
                      color: "#060E1A",
                    }
                  : { color: "#8FA3B8" }
              }
            >
              {s === "todos" ? "Todos" : STATUS_CFG[s as VehicleStatus].label}
            </button>
          ))}
        </div>

        {/* type filter */}
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as VehicleType | "todos")
          }
          className="text-xs rounded-xl px-3 py-1.5 input-veladesk"
        >
          <option value="todos">Todos los tipos</option>
          {(Object.entries(VEHICLE_TYPE_LABELS) as [VehicleType, string][]).map(
            ([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ),
          )}
        </select>
      </div>

      {/* ── Vehicle list ── */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🚗</div>
          <p className="text-base font-medium" style={{ color: "#8FA3B8" }}>
            Sin vehículos
          </p>
          <button
            onClick={openAdd}
            className="mt-4 text-sm btn-navy px-4 py-2 rounded-xl"
          >
            Agregar primer vehículo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={() => openEdit(v)}
              onDelete={() => setDeleteId(v.id)}
            />
          ))}
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(6,14,26,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-slide-up"
            style={{
              background: "#0D1E35",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)" }}
              >
                <Trash2 size={18} style={{ color: "#FCA5A5" }} />
              </div>
              <h3 className="font-bold" style={{ color: "#F0EDE8" }}>
                ¿Eliminar vehículo?
              </h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "#8FA3B8" }}>
              Se eliminará permanentemente el registro y todos sus documentos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg,#EF4444,#DC2626)",
                  color: "#fff",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADD / EDIT MODAL ══ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{
            background: "rgba(6,14,26,0.7)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="h-full w-full max-w-2xl flex flex-col animate-slide-in overflow-hidden"
            style={{
              background: "#0A1628",
              borderLeft: "1px solid rgba(201,169,110,0.2)",
            }}
          >
            {/* modal header */}
            <div
              className="flex items-center justify-between px-6 py-5 shrink-0"
              style={{ borderBottom: "1px solid rgba(201,169,110,0.12)" }}
            >
              <div>
                <h2 className="text-lg font-bold" style={{ color: "#F0EDE8" }}>
                  {editId ? "Editar vehículo" : "Agregar vehículo"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#8FA3B8" }}>
                  Completa los antecedentes del medio de transporte
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(201,169,110,0.08)",
                  color: "#8FA3B8",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* ── Datos básicos ── */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <Car size={14} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Datos del Vehículo
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Tipo de transporte *
                    </label>
                    <select
                      className={inputCls}
                      value={form.type}
                      onChange={(e) =>
                        set("type", e.target.value as VehicleType)
                      }
                    >
                      {(
                        Object.entries(VEHICLE_TYPE_LABELS) as [
                          VehicleType,
                          string,
                        ][]
                      ).map(([k, v]) => (
                        <option key={k} value={k}>
                          {VEHICLE_TYPE_ICONS[k]} {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Estado *
                    </label>
                    <select
                      className={inputCls}
                      value={form.status}
                      onChange={(e) =>
                        set("status", e.target.value as VehicleStatus)
                      }
                    >
                      {(
                        Object.entries(STATUS_CFG) as [
                          VehicleStatus,
                          (typeof STATUS_CFG)[VehicleStatus],
                        ][]
                      ).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Marca *
                    </label>
                    <input
                      className={inputCls}
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      placeholder="Ej: Mercedes-Benz"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Modelo *
                    </label>
                    <input
                      className={inputCls}
                      value={form.model}
                      onChange={(e) => set("model", e.target.value)}
                      placeholder="Ej: Sprinter"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Año *
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.year}
                      onChange={(e) => set("year", Number(e.target.value))}
                      min={1980}
                      max={2030}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Color *
                    </label>
                    <input
                      className={inputCls}
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      placeholder="Ej: Negro"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Patente *
                    </label>
                    <input
                      className={inputCls}
                      value={form.plate}
                      onChange={(e) =>
                        set("plate", e.target.value.toUpperCase())
                      }
                      placeholder="Ej: BCDK-41"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "0.1em",
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      VIN / Nº Chasis
                    </label>
                    <input
                      className={inputCls}
                      value={form.vin ?? ""}
                      onChange={(e) => set("vin", e.target.value)}
                      placeholder="17 caracteres"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Combustible
                    </label>
                    <select
                      className={inputCls}
                      value={form.fuelType ?? ""}
                      onChange={(e) =>
                        set("fuelType", e.target.value as Vehicle["fuelType"])
                      }
                    >
                      <option value="">Sin especificar</option>
                      {(Object.entries(FUEL_LABELS) as [string, string][]).map(
                        ([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Capacidad (personas)
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.capacity ?? ""}
                      onChange={(e) =>
                        set(
                          "capacity",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="Ej: 8"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Kilometraje actual
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.mileage ?? ""}
                      onChange={(e) =>
                        set(
                          "mileage",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="km"
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      <User size={10} className="inline mr-1" />
                      Responsable
                    </label>
                    <input
                      className={inputCls}
                      value={form.assignedTo ?? ""}
                      onChange={(e) => set("assignedTo", e.target.value)}
                      placeholder="Nombre del conductor"
                    />
                  </div>
                </div>
              </section>

              {/* ── Documentos ── */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Documentos y Permisos
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <DocFields
                    title="Permiso de Circulación"
                    icon={FileText}
                    value={form.circulationPermit ?? emptyDoc()}
                    onChange={(v) => set("circulationPermit", v as VehicleDoc)}
                  />
                  <DocFields
                    title="SOAP"
                    icon={Shield}
                    value={form.soap ?? emptyDoc()}
                    onChange={(v) => set("soap", v as VehicleDoc)}
                  />
                  <DocFields
                    title="Seguro del Vehículo"
                    icon={Shield}
                    value={form.insurance ?? emptyDoc()}
                    onChange={(v) => set("insurance", v as VehicleDoc)}
                  />
                  <DocFields
                    title="Revisión Técnica"
                    icon={CheckCircle2}
                    value={form.technicalRevision ?? emptyDoc()}
                    onChange={(v) => set("technicalRevision", v as VehicleDoc)}
                  />
                </div>
              </section>

              {/* ── Mantención ── */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={14} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Mantención
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Última mantención
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.lastService ?? ""}
                      onChange={(e) => set("lastService", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Próxima mantención
                    </label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.nextService ?? ""}
                      onChange={(e) => set("nextService", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Próxima mantención (km)
                    </label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.nextServiceMileage ?? ""}
                      onChange={(e) =>
                        set(
                          "nextServiceMileage",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="Kilometraje"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls} style={{ color: "#C9A96E" }}>
                      Observaciones
                    </label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={form.observations ?? ""}
                      onChange={(e) => set("observations", e.target.value)}
                      placeholder="Estado general, equipamiento especial, notas…"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* modal footer */}
            <div
              className="flex gap-3 px-6 py-5 shrink-0"
              style={{ borderTop: "1px solid rgba(201,169,110,0.12)" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.brand || !form.model || !form.plate}
                className="flex-2 px-8 py-3 rounded-xl text-sm font-semibold btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {editId ? "Guardar cambios" : "Agregar vehículo"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
