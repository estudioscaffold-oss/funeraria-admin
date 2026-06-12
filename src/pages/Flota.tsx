import { useState } from "react";
import type { Vehicle, VehicleType, VehicleStatus, VehicleDoc } from "../types";
import { useCollection } from "../hooks/useCollection";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Car,
  Shield,
  FileText,
  Gauge,
  User2,
  Truck,
  Bus,
  Settings2,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

/* ═══ CONFIG ══════════════════════════════════════ */
const TYPE_CFG: Record<
  VehicleType,
  { label: string; Icon: React.ElementType; accent: string }
> = {
  carroza_funebre: { label: "Carroza Fúnebre", Icon: Car, accent: "#64748B" },
  furgon: { label: "Furgón", Icon: Truck, accent: "#3B82F6" },
  automovil: { label: "Automóvil", Icon: Car, accent: "#6366F1" },
  camioneta: { label: "Camioneta", Icon: Truck, accent: "#0EA5E9" },
  carruaje: { label: "Carruaje", Icon: Settings2, accent: "#D97706" },
  minibus: { label: "Minibús", Icon: Bus, accent: "#8B5CF6" },
  otro: { label: "Otro", Icon: Car, accent: "#94A3B8" },
};

const STATUS_CFG: Record<
  VehicleStatus,
  { label: string; dot: string; text: string; bar: string }
> = {
  activo: { label: "Activo", dot: "#22C55E", text: "#15803D", bar: "#22C55E" },
  mantenimiento: {
    label: "Mantención",
    dot: "#F59E0B",
    text: "#B45309",
    bar: "#F59E0B",
  },
  inactivo: {
    label: "Inactivo",
    dot: "#94A3B8",
    text: "#475569",
    bar: "#94A3B8",
  },
  baja: {
    label: "Dado de baja",
    dot: "#EF4444",
    text: "#B91C1C",
    bar: "#EF4444",
  },
};

const FUEL_LABELS: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
  gas: "Gas",
};

const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm input-veladesk";
const labelCls =
  "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5";

/* ═══ DOC STATUS ══════════════════════════════════ */
function docDays(doc?: VehicleDoc) {
  if (!doc?.expiryDate) return null;
  try {
    return differenceInDays(parseISO(doc.expiryDate), new Date());
  } catch {
    return null;
  }
}

function docColor(days: number | null) {
  if (days === null) return "#CBD5E1";
  if (days < 0) return "#EF4444";
  if (days < 60) return "#F59E0B";
  return "#22C55E";
}

/* ═══ DOC RING ════════════════════════════════════ */
function DocRing({ label, doc }: { label: string; doc?: VehicleDoc }) {
  const days = docDays(doc);
  const color = docColor(days);
  const pct = days === null ? 0 : Math.max(0, Math.min(1, days / 365));
  const R = 14,
    C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="3"
          />
          {pct > 0 && (
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${C * pct} ${C}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {days === null ? (
            <span style={{ color: "#CBD5E1", fontSize: 9 }}>—</span>
          ) : days < 0 ? (
            <span style={{ color, fontSize: 9, fontWeight: 800 }}>✗</span>
          ) : (
            <span
              style={{ color, fontSize: 8, fontWeight: 800, lineHeight: 1 }}
            >
              {days < 365 ? `${days}d` : "✓"}
            </span>
          )}
        </div>
      </div>
      <span
        className="text-center font-medium"
        style={{ color: "#94A3B8", fontSize: 9, lineHeight: 1.2 }}
      >
        {label}
      </span>
    </div>
  );
}

/* ═══ PLATE ═══════════════════════════════════════ */
function Plate({ plate }: { plate: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-mono font-black text-sm tracking-widest"
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        color: "#0F172A",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
        letterSpacing: "0.15em",
      }}
    >
      <span className="w-1 h-4 rounded-sm" style={{ background: "#003FA5" }} />
      {plate}
    </span>
  );
}

/* ═══ VEHICLE CARD ════════════════════════════════ */
function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const type = TYPE_CFG[vehicle.type];
  const status = STATUS_CFG[vehicle.status];
  const hasAlert = [
    vehicle.circulationPermit,
    vehicle.soap,
    vehicle.insurance,
    vehicle.technicalRevision,
  ].some((d) => {
    const days = docDays(d);
    return days !== null && days < 60;
  });

  return (
    <div
      className="group relative bg-white transition-all duration-300"
      style={{
        borderRadius: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* status accent bar top */}
      <div
        style={{
          height: 3,
          background: status.bar,
          borderRadius: "14px 14px 0 0",
        }}
      />

      <div className="px-5 pt-4 pb-5">
        {/* row 1: icon + brand/model + alert */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${type.accent}12` }}
          >
            <type.Icon
              size={16}
              style={{ color: type.accent }}
              strokeWidth={1.8}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-bold text-base leading-tight truncate"
                style={{ color: "#0F172A" }}
              >
                {vehicle.brand}{" "}
                <span style={{ color: "#475569" }}>{vehicle.model}</span>
              </h3>
              {hasAlert && (
                <AlertTriangle size={12} style={{ color: "#F59E0B" }} />
              )}
            </div>
            <p
              className="text-xs mt-0.5 font-medium"
              style={{ color: "#94A3B8" }}
            >
              {vehicle.year} · {type.label} · {vehicle.color}
            </p>
          </div>
          {/* actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#F1F5F9";
                (e.currentTarget as HTMLElement).style.color = "#0A1628";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
              }}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FEF2F2";
                (e.currentTarget as HTMLElement).style.color = "#EF4444";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* row 2: plate + status */}
        <div className="flex items-center justify-between mb-4">
          <Plate plate={vehicle.plate} />
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: status.text }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.dot }}
            />
            {status.label}
          </span>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "0 0 14px" }} />

        {/* row 3: stats */}
        <div className="grid grid-cols-3 gap-0 text-center mb-4">
          {[
            {
              icon: Gauge,
              value: vehicle.mileage
                ? `${(vehicle.mileage / 1000).toFixed(0)}k`
                : "—",
              label: "km",
            },
            {
              icon: User2,
              value: vehicle.assignedTo?.split(" ")[0] ?? "—",
              label: "Conductor",
            },
            {
              icon: Car,
              value: vehicle.fuelType ? FUEL_LABELS[vehicle.fuelType] : "—",
              label: "Combustible",
            },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col gap-0.5 ${i < 2 ? "border-r border-slate-100" : ""}`}
            >
              <p className="font-bold text-sm" style={{ color: "#1E293B" }}>
                {value}
              </p>
              <p
                className="text-xs font-medium"
                style={{ color: "#94A3B8", fontSize: 10 }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* row 4: doc rings */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "0 0 14px" }} />
        <div className="flex justify-between items-start mb-4">
          <DocRing label="Permiso Circ." doc={vehicle.circulationPermit} />
          <DocRing label="SOAP" doc={vehicle.soap} />
          <DocRing label="Seguro" doc={vehicle.insurance} />
          <DocRing label="Rev. Técnica" doc={vehicle.technicalRevision} />
        </div>

        {/* row 5: next service */}
        {vehicle.nextService && (
          <div className="flex items-center gap-2 mt-1">
            <Wrench size={11} style={{ color: "#CBD5E1" }} />
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              Próx. mantención:{" "}
              <span style={{ color: "#475569", fontWeight: 600 }}>
                {format(parseISO(vehicle.nextService), "d MMM yyyy", {
                  locale: es,
                })}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ DOC FIELDS ════════════════════════════════════ */
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
  const days = docDays(value as VehicleDoc);
  const color = docColor(days);

  return (
    <div style={{ border: "1px solid #F1F5F9", borderRadius: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors"
        style={{ borderRadius: open ? "10px 10px 0 0" : 10 }}
      >
        <Icon
          size={13}
          style={{ color: value.expiryDate ? color : "#CBD5E1" }}
        />
        <span
          className="flex-1 text-sm font-medium"
          style={{ color: "#374151" }}
        >
          {title}
        </span>
        {days !== null && (
          <span className="text-xs font-semibold" style={{ color }}>
            {days < 0 ? "Vencido" : `${days}d`}
          </span>
        )}
        <ChevronDown
          size={13}
          style={{ color: "#CBD5E1" }}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3"
          style={{
            background: "#FAFAFA",
            borderTop: "1px solid #F1F5F9",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <div className="col-span-2">
            <label className={labelCls}>Número / Póliza</label>
            <input
              className={inputCls}
              value={value.number ?? ""}
              onChange={(e) => onChange({ ...value, number: e.target.value })}
              placeholder="Nº de documento"
            />
          </div>
          <div>
            <label className={labelCls}>Compañía</label>
            <input
              className={inputCls}
              value={value.company ?? ""}
              onChange={(e) => onChange({ ...value, company: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Emisión</label>
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
            <label className={labelCls}>Vencimiento *</label>
            <input
              type="date"
              className={inputCls}
              value={value.expiryDate ?? ""}
              onChange={(e) =>
                onChange({ ...value, expiryDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <input
              className={inputCls}
              value={value.notes ?? ""}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ MOCK DATA ═════════════════════════════════════ */
const emptyDoc = (): Partial<VehicleDoc> => ({});
export const MOCK_VEHICLES: Vehicle[] = [
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
      expiryDate: "2025-01-01",
    },
    insurance: {
      number: "POL-45892",
      company: "Mapfre Seguros",
      expiryDate: "2025-03-01",
    },
    technicalRevision: { number: "RT-2024-0412", expiryDate: "2026-04-12" },
    lastService: "2024-10-15",
    nextService: "2025-04-15",
    observations: "Carroza principal.",
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
    circulationPermit: { expiryDate: "2026-06-20" },
    soap: { company: "BCI Seguros", expiryDate: "2026-07-01" },
    insurance: {
      number: "POL-33210",
      company: "BCI",
      expiryDate: "2026-01-01",
    },
    technicalRevision: { expiryDate: "2025-11-22" },
    lastService: "2024-08-01",
    nextService: "2025-08-01",
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
    circulationPermit: { expiryDate: "2026-08-01" },
    soap: { company: "Sura", expiryDate: "2026-09-01" },
    insurance: {
      number: "POL-78901",
      company: "Sura",
      expiryDate: "2026-06-01",
    },
    lastService: "2024-11-01",
    nextService: "2025-05-01",
    observations: "Revisión suspensión delantera.",
    createdAt: "2022-05-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
];

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
  observations: "",
});

/* ═══ PAGE ══════════════════════════════════════════ */
export default function Flota() {
  const [vehicles, setVehicles] = useCollection<Vehicle>(
    "veladesk-flota",
    MOCK_VEHICLES,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | "todos">(
    "todos",
  );
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
    const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = v;
    setForm({ ...emptyVehicle(), ...rest });
    setModalOpen(true);
  };
  const handleSave = () => {
    if (!form.brand || !form.model || !form.plate) return;
    const now = new Date().toISOString();
    if (editId)
      setVehicles(
        vehicles.map((v) =>
          v.id === editId ? { ...v, ...form, updatedAt: now } : v,
        ),
      );
    else
      setVehicles([
        ...vehicles,
        { ...form, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ]);
    setModalOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) setVehicles(vehicles.filter((v) => v.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = vehicles.filter(
    (v) => filterStatus === "todos" || v.status === filterStatus,
  );

  const stats = {
    activos: vehicles.filter((v) => v.status === "activo").length,
    mant: vehicles.filter((v) => v.status === "mantenimiento").length,
    alertas: vehicles.filter((v) =>
      [v.circulationPermit, v.soap, v.insurance, v.technicalRevision].some(
        (d) => {
          const days = docDays(d);
          return days !== null && days < 60;
        },
      ),
    ).length,
  };

  return (
    <div className="p-8 space-y-7">
      {/* ── Page header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4 animate-fade-in">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#C9A96E" }}
          >
            Gestión de Flota
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "#0A1628", letterSpacing: "-0.02em" }}
          >
            Vehículos
          </h1>
          {/* inline stats */}
          <div className="flex items-center gap-4 mt-2">
            {[
              { val: stats.activos, label: "activos", color: "#22C55E" },
              { val: stats.mant, label: "mantención", color: "#F59E0B" },
              { val: stats.alertas, label: "alertas doc", color: "#EF4444" },
            ].map(({ val, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: color }}
                />
                <span className="font-bold" style={{ color: "#0F172A" }}>
                  {val}
                </span>
                <span style={{ color: "#94A3B8" }}>{label}</span>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm btn-gold transition-all hover:scale-[1.02]"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={15} /> Nuevo vehículo
          </span>
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div
        className="flex items-center gap-1"
        style={{ borderBottom: "1px solid #E2E8F0", paddingBottom: 0 }}
      >
        {(
          [
            ["todos", "Todos", vehicles.length],
            ["activo", "Activos", stats.activos],
            ["mantenimiento", "En mantención", stats.mant],
            [
              "inactivo",
              "Inactivos",
              vehicles.filter((v) => v.status === "inactivo").length,
            ],
            [
              "baja",
              "Baja",
              vehicles.filter((v) => v.status === "baja").length,
            ],
          ] as const
        ).map(([val, lbl, count]) => {
          const active = filterStatus === val;
          return (
            <button
              key={val}
              onClick={() => setFilterStatus(val as VehicleStatus | "todos")}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all duration-200 relative"
              style={{ color: active ? "#0A1628" : "#94A3B8" }}
            >
              {lbl}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  background: active ? "#0A162812" : "#F1F5F9",
                  color: active ? "#0A1628" : "#94A3B8",
                }}
              >
                {count}
              </span>
              {/* active underline */}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: "#0A1628" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Vehicle grid ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ border: "1px dashed #E2E8F0" }}
        >
          <Car size={32} style={{ color: "#E2E8F0" }} className="mb-4" />
          <p className="text-base font-semibold" style={{ color: "#94A3B8" }}>
            Sin vehículos registrados
          </p>
          <button
            onClick={openAdd}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold btn-navy"
          >
            Agregar vehículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
      {deleteId &&
        (() => {
          const v = vehicles.find((x) => x.id === deleteId);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: "rgba(15,23,42,0.4)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slide-up"
                style={{ border: "1px solid #F1F5F9" }}
              >
                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: "#0F172A" }}
                >
                  Eliminar vehículo
                </h3>
                <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                  <span style={{ color: "#0F172A", fontWeight: 600 }}>
                    {v?.brand} {v?.model} — {v?.plate}
                  </span>{" "}
                  será eliminado permanentemente.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-navy"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "#EF4444" }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ══ FORM PANEL ══ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{
            background: "rgba(15,23,42,0.35)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="h-full w-full max-w-xl flex flex-col bg-white shadow-2xl animate-slide-in overflow-hidden"
            style={{ borderLeft: "1px solid #E2E8F0" }}
          >
            {/* panel header */}
            <div
              className="flex items-center justify-between px-6 py-5 shrink-0"
              style={{ borderBottom: "1px solid #F1F5F9" }}
            >
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#C9A96E" }}
                >
                  {editId ? "Editar vehículo" : "Nuevo vehículo"}
                </p>
                <h2
                  className="text-xl font-bold mt-0.5"
                  style={{ color: "#0A1628", letterSpacing: "-0.02em" }}
                >
                  {form.brand || "Sin marca"} {form.model}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                style={{ color: "#94A3B8" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* panel body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#C9A96E" }}
                >
                  Datos del vehículo
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "type", label: "Tipo", type: "select-type" },
                    { k: "status", label: "Estado", type: "select-status" },
                    { k: "brand", label: "Marca", ph: "Mercedes-Benz" },
                    { k: "model", label: "Modelo", ph: "Sprinter" },
                    { k: "year", label: "Año", type: "number" },
                    { k: "color", label: "Color", ph: "Negro" },
                    { k: "plate", label: "Patente", ph: "BCDK-41", mono: true },
                    { k: "vin", label: "VIN / Chasis" },
                    {
                      k: "fuelType",
                      label: "Combustible",
                      type: "select-fuel",
                    },
                    { k: "assignedTo", label: "Responsable" },
                    { k: "capacity", label: "Capacidad", type: "number" },
                    { k: "mileage", label: "Kilometraje", type: "number" },
                  ].map(({ k, label, type: t, ph, mono }) => (
                    <div key={k}>
                      <label className={labelCls}>{label}</label>
                      {t === "select-type" ? (
                        <select
                          className={inputCls}
                          value={form.type}
                          onChange={(e) =>
                            set("type", e.target.value as VehicleType)
                          }
                        >
                          {(
                            Object.entries(TYPE_CFG) as [
                              VehicleType,
                              (typeof TYPE_CFG)[VehicleType],
                            ][]
                          ).map(([key, v]) => (
                            <option key={key} value={key}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : t === "select-status" ? (
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
                          ).map(([key, v]) => (
                            <option key={key} value={key}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : t === "select-fuel" ? (
                        <select
                          className={inputCls}
                          value={form.fuelType ?? ""}
                          onChange={(e) =>
                            set(
                              "fuelType",
                              e.target.value as Vehicle["fuelType"],
                            )
                          }
                        >
                          <option value="">Sin especificar</option>
                          {Object.entries(FUEL_LABELS).map(([key, v]) => (
                            <option key={key} value={key}>
                              {v}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={t === "number" ? "number" : "text"}
                          className={inputCls}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          value={(form as any)[k] ?? ""}
                          onChange={(e) => {
                            const val =
                              t === "number"
                                ? e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                                : e.target.value;
                            set(k as keyof typeof form, val as never);
                          }}
                          placeholder={ph}
                          style={
                            mono
                              ? {
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                }
                              : {}
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#C9A96E" }}
                >
                  Documentos y permisos
                </p>
                <div className="space-y-2">
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
                    title="Seguro"
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

              <section>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#C9A96E" }}
                >
                  Mantención
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      k: "lastService",
                      label: "Última mantención",
                      type: "date",
                    },
                    {
                      k: "nextService",
                      label: "Próxima mantención",
                      type: "date",
                    },
                    {
                      k: "nextServiceMileage",
                      label: "Próxima mantención km",
                      type: "number",
                    },
                  ].map(({ k, label, type: t }) => (
                    <div key={k}>
                      <label className={labelCls}>{label}</label>
                      <input
                        type={t}
                        className={inputCls}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value={(form as any)[k] ?? ""}
                        onChange={(e) =>
                          set(
                            k as keyof typeof form,
                            t === "number"
                              ? e.target.value
                                ? Number(e.target.value)
                                : undefined
                              : (e.target.value as never),
                          )
                        }
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className={labelCls}>Observaciones</label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={form.observations ?? ""}
                      onChange={(e) => set("observations", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* panel footer */}
            <div
              className="flex gap-3 px-6 py-4 shrink-0"
              style={{ borderTop: "1px solid #F1F5F9" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.brand || !form.model || !form.plate}
                className="flex-[2] py-2.5 rounded-xl text-sm font-bold btn-gold disabled:opacity-40"
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
