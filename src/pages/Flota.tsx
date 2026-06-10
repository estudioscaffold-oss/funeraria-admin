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
  Wrench,
  Car,
  Shield,
  FileText,
  User,
  Gauge,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

/* ═══ CONFIG ═══════════════════════════════════════ */
const TYPE_CFG: Record<
  VehicleType,
  { label: string; emoji: string; gradient: string; accent: string }
> = {
  carroza_funebre: {
    label: "Carroza Fúnebre",
    emoji: "⚰️",
    gradient: "from-slate-800 to-slate-900",
    accent: "#94A3B8",
  },
  furgon: {
    label: "Furgón",
    emoji: "🚐",
    gradient: "from-indigo-700 to-indigo-900",
    accent: "#818CF8",
  },
  automovil: {
    label: "Automóvil",
    emoji: "🚗",
    gradient: "from-sky-700 to-sky-900",
    accent: "#38BDF8",
  },
  camioneta: {
    label: "Camioneta",
    emoji: "🛻",
    gradient: "from-teal-700 to-teal-900",
    accent: "#2DD4BF",
  },
  carruaje: {
    label: "Carruaje",
    emoji: "🐴",
    gradient: "from-amber-700 to-amber-900",
    accent: "#FCD34D",
  },
  minibus: {
    label: "Minibús",
    emoji: "🚌",
    gradient: "from-violet-700 to-violet-900",
    accent: "#C4B5FD",
  },
  otro: {
    label: "Otro",
    emoji: "🚙",
    gradient: "from-zinc-600 to-zinc-800",
    accent: "#A1A1AA",
  },
};

const STATUS_CFG: Record<
  VehicleStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  activo: { label: "Activo", dot: "#22C55E", text: "#15803D", bg: "#F0FDF4" },
  mantenimiento: {
    label: "Mantenimiento",
    dot: "#F59E0B",
    text: "#B45309",
    bg: "#FFFBEB",
  },
  inactivo: {
    label: "Inactivo",
    dot: "#94A3B8",
    text: "#475569",
    bg: "#F8FAFC",
  },
  baja: { label: "Baja", dot: "#EF4444", text: "#B91C1C", bg: "#FEF2F2" },
};

const FUEL_LABELS: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
  gas: "Gas",
};

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm input-veladesk";
const labelCls =
  "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

/* ═══ HELPERS ════════════════════════════════════════ */
function docStatus(doc?: VehicleDoc): "ok" | "warning" | "expired" | "missing" {
  if (!doc?.expiryDate) return "missing";
  try {
    const d = differenceInDays(parseISO(doc.expiryDate), new Date());
    if (d < 0) return "expired";
    if (d < 60) return "warning";
    return "ok";
  } catch {
    return "missing";
  }
}

/* ═══ LICENSE PLATE ═══════════════════════════════════ */
function Plate({ plate }: { plate: string }) {
  return (
    <div
      className="inline-flex items-center gap-0 rounded-lg overflow-hidden select-none"
      style={{
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
        border: "2px solid #1E293B",
      }}
    >
      {/* blue strip (EU style) */}
      <div
        className="flex flex-col items-center justify-center px-1.5 py-0.5 self-stretch"
        style={{ background: "#003FA5", minWidth: 20 }}
      >
        <span
          className="text-white text-xs font-black leading-none"
          style={{ fontSize: 10 }}
        >
          CL
        </span>
        <span className="text-yellow-300 leading-none" style={{ fontSize: 11 }}>
          ★
        </span>
      </div>
      {/* plate text */}
      <div
        className="px-3 py-1"
        style={{
          background: "linear-gradient(180deg,#FAFAFA 0%,#F0F0F0 100%)",
        }}
      >
        <span
          className="font-black tracking-[0.18em] text-base"
          style={{
            fontFamily: "monospace",
            color: "#0F172A",
            textShadow: "0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {plate}
        </span>
      </div>
    </div>
  );
}

/* ═══ DOCUMENT ARC RING ═══════════════════════════════ */
function DocRing({ label, doc }: { label: string; doc?: VehicleDoc }) {
  const st = docStatus(doc);
  const days = doc?.expiryDate
    ? differenceInDays(parseISO(doc.expiryDate), new Date())
    : null;
  const pct = days === null ? 0 : Math.max(0, Math.min(1, days / 365));
  const R = 16,
    C = 2 * Math.PI * R;
  const dash = C * pct;

  const color = {
    ok: "#22C55E",
    warning: "#F59E0B",
    expired: "#EF4444",
    missing: "#CBD5E1",
  }[st];
  const label2 =
    days === null
      ? "—"
      : days < 0
        ? `${Math.abs(days)}d`
        : days < 365
          ? `${days}d`
          : "OK";

  return (
    <div className="flex flex-col items-center gap-1.5 group/ring">
      <div className="relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="4"
          />
          {pct > 0 && (
            <circle
              cx="20"
              cy="20"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={`${dash} ${C}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xs font-black leading-none"
            style={{ color, fontSize: 9 }}
          >
            {label2}
          </span>
        </div>
      </div>
      <span
        className="text-xs text-center leading-tight font-medium"
        style={{ color: "#64748B", fontSize: 10 }}
      >
        {label}
      </span>
    </div>
  );
}

/* ═══ VEHICLE CARD ════════════════════════════════════ */
function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const type = TYPE_CFG[vehicle.type];
  const status = STATUS_CFG[vehicle.status];
  const hasAlert = [
    vehicle.circulationPermit,
    vehicle.soap,
    vehicle.insurance,
    vehicle.technicalRevision,
  ].some((d) => ["warning", "expired"].includes(docStatus(d)));

  return (
    <div className="group relative select-none" style={{ perspective: 1000 }}>
      {/* ── main card ── */}
      <div
        className="relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
          transform: flipped ? "translateY(-2px)" : "translateY(0)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* ── colored header ── */}
        <div
          className={`relative bg-gradient-to-br ${type.gradient} px-6 pt-5 pb-14 overflow-hidden`}
        >
          {/* background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* alert badge */}
          {hasAlert && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(239,68,68,0.9)", color: "white" }}
            >
              <AlertTriangle size={10} /> Docs
            </div>
          )}

          {/* vehicle emoji — large */}
          <div
            className="text-6xl leading-none mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
          >
            {type.emoji}
          </div>

          {/* brand + model */}
          <div>
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">
              {type.label}
            </p>
            <h3
              className="text-white font-black text-xl leading-tight"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              {vehicle.brand}
            </h3>
            <p className="text-white/80 font-semibold text-sm">
              {vehicle.model} · {vehicle.year}
            </p>
          </div>

          {/* decorative arc */}
          <div
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: type.accent, transform: "scale(1.5)" }}
          />
        </div>

        {/* ── card body ── */}
        <div className="bg-white px-5 pt-3 pb-5" style={{ marginTop: -48 }}>
          {/* plate floating over the divide */}
          <div className="flex items-end justify-between mb-4">
            <Plate plate={vehicle.plate} />
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: status.bg,
                color: status.text,
                border: `1px solid ${status.dot}30`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: status.dot }}
              />
              {status.label}
            </span>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                icon: Gauge,
                value: vehicle.mileage
                  ? `${(vehicle.mileage / 1000).toFixed(1)}k km`
                  : "—",
                label: "Odómetro",
              },
              {
                icon: User,
                value: vehicle.assignedTo?.split(" ")[0] ?? "Sin asignar",
                label: "Conductor",
              },
              {
                icon: Car,
                value: vehicle.fuelType ? FUEL_LABELS[vehicle.fuelType] : "—",
                label: "Combustible",
              },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl p-2.5 text-center"
                style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
              >
                <Icon
                  size={12}
                  className="mx-auto mb-1"
                  style={{ color: "#94A3B8" }}
                />
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: "#1E293B" }}
                >
                  {value}
                </p>
                <p
                  className="text-xs leading-tight mt-0.5"
                  style={{ color: "#94A3B8", fontSize: 10 }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* doc rings */}
          <div className="flex items-start justify-between px-1 mb-4">
            <DocRing label="Permiso" doc={vehicle.circulationPermit} />
            <DocRing label="SOAP" doc={vehicle.soap} />
            <DocRing label="Seguro" doc={vehicle.insurance} />
            <DocRing label="Rev.Téc" doc={vehicle.technicalRevision} />
          </div>

          {/* next service */}
          {vehicle.nextService && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <Wrench size={12} style={{ color: "#C9A96E" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#64748B" }}
              >
                Próx. mantención:{" "}
                <strong style={{ color: "#1E293B" }}>
                  {format(parseISO(vehicle.nextService), "d MMM yyyy", {
                    locale: es,
                  })}
                </strong>
              </span>
            </div>
          )}

          {/* actions */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-md"
              style={{ background: "#0A1628", color: "#D4AF70" }}
            >
              <Pencil size={12} /> Editar
            </button>
            <button
              onClick={onDelete}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "#FEF2F2",
                color: "#EF4444",
                border: "1px solid #FECACA",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* hover glow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ boxShadow: `0 20px 60px -10px ${type.accent}50` }}
      />
    </div>
  );
}

/* ═══ DOC FIELDS ══════════════════════════════════════ */
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
  const st = docStatus(value as VehicleDoc);
  const stColor = {
    ok: "#22C55E",
    warning: "#F59E0B",
    expired: "#EF4444",
    missing: "#94A3B8",
  }[st];

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-100 transition-all"
      style={open ? { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" } : {}}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${stColor}15` }}
        >
          <Icon size={14} style={{ color: stColor }} />
        </div>
        <span
          className="text-sm font-semibold flex-1"
          style={{ color: "#1E293B" }}
        >
          {title}
        </span>
        {value.expiryDate && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${stColor}15`, color: stColor }}
          >
            {format(parseISO(value.expiryDate), "dd/MM/yy")}
          </span>
        )}
        <ChevronDown
          size={14}
          style={{ color: "#94A3B8" }}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-slate-50/60 grid grid-cols-2 gap-3">
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
            <label className={labelCls}>Compañía / Entidad</label>
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

/* ═══ MOCK DATA ═══════════════════════════════════════ */
const emptyDoc = (): Partial<VehicleDoc> => ({});
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
    },
    technicalRevision: {
      number: "RT-2024-0412",
      issueDate: "2024-04-12",
      expiryDate: "2026-04-12",
    },
    lastService: "2024-10-15",
    nextService: "2025-04-15",
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
    circulationPermit: { number: "CP-2024-002", expiryDate: "2026-06-20" },
    soap: { company: "BCI Seguros", expiryDate: "2026-07-01" },
    insurance: {
      number: "POL-33210",
      company: "BCI Seguros",
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
      company: "Sura Seguros",
      expiryDate: "2026-06-01",
    },
    lastService: "2024-11-01",
    nextService: "2025-05-01",
    observations: "En revisión de suspensión delantera.",
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

/* ═══ PAGE ════════════════════════════════════════════ */
export default function Flota() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
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
    (v) => filterStatus === "todos" || v.status === filterStatus,
  );

  const stats = {
    total: vehicles.length,
    activos: vehicles.filter((v) => v.status === "activo").length,
    mant: vehicles.filter((v) => v.status === "mantenimiento").length,
    alertas: vehicles.filter((v) =>
      [v.circulationPermit, v.soap, v.insurance, v.technicalRevision].some(
        (d) => ["warning", "expired"].includes(docStatus(d)),
      ),
    ).length,
  };

  return (
    <div className="min-h-full" style={{ background: "#F1F5F9" }}>
      {/* ── dramatic header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0A1628 0%, #1E3A6E 60%, #0F2952 100%)",
        }}
      >
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#C9A96E", transform: "translate(30%,-30%)" }}
        />

        <div className="relative px-8 py-8">
          <p
            className="text-xs font-semibold tracking-[0.3em] uppercase mb-2"
            style={{ color: "#C9A96E" }}
          >
            Veladesk · Fleet Management
          </p>
          <h1
            className="text-4xl font-black text-white mb-1"
            style={{ letterSpacing: "-0.02em" }}
          >
            Gestión de Flota
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {stats.total} unidades registradas
          </p>

          {/* stat pills */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {[
              { label: "Activos", val: stats.activos, color: "#22C55E" },
              { label: "Mantenimiento", val: stats.mant, color: "#F59E0B" },
              {
                label: "Docs. por vencer",
                val: stats.alertas,
                color: "#EF4444",
              },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: color }}
                />
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
                <span className="font-black" style={{ color }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* ── toolbar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* status tabs */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: "#E2E8F0" }}
          >
            {(
              [
                ["todos", "Todos"],
                ["activo", "Activos"],
                ["mantenimiento", "Mantención"],
                ["inactivo", "Inactivos"],
                ["baja", "Baja"],
              ] as const
            ).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val as VehicleStatus | "todos")}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  filterStatus === val
                    ? {
                        background: "#0A1628",
                        color: "#D4AF70",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }
                    : { color: "#64748B" }
                }
              >
                {lbl}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm btn-gold transition-all hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={16} /> Nuevo vehículo
            </span>
          </button>
        </div>

        {/* ── vehicle grid ── */}
        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center">
            <div className="text-7xl mb-4">🚗</div>
            <p className="text-lg font-bold" style={{ color: "#0A1628" }}>
              Sin vehículos
            </p>
            <button
              onClick={openAdd}
              className="mt-4 px-5 py-2.5 rounded-2xl text-sm font-semibold btn-gold"
            >
              <span className="relative z-10">Agregar primer vehículo</span>
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
      </div>

      {/* ══ DELETE ══ */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white shadow-2xl animate-slide-up">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🚫</div>
              <h3 className="text-lg font-black" style={{ color: "#0A1628" }}>
                ¿Eliminar vehículo?
              </h3>
              <p className="text-sm mt-2" style={{ color: "#64748B" }}>
                <strong style={{ color: "#1E293B" }}>
                  {vehicles.find((v) => v.id === deleteId)?.brand}{" "}
                  {vehicles.find((v) => v.id === deleteId)?.model}
                </strong>{" "}
                se eliminará permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg,#EF4444,#DC2626)",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FORM PANEL ══ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="h-full w-full max-w-xl flex flex-col bg-white shadow-2xl animate-slide-in overflow-hidden"
            style={{ borderLeft: "1px solid #E2E8F0" }}
          >
            {/* form header */}
            <div
              className="relative overflow-hidden px-6 py-5 shrink-0"
              style={{ background: "linear-gradient(135deg,#0A1628,#1E3A6E)" }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: "#C9A96E" }}
                  >
                    {editId ? "Editar" : "Nuevo vehículo"}
                  </p>
                  <h2 className="text-xl font-black text-white">
                    {form.brand || "Sin nombre"} {form.model}
                  </h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* datos básicos */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <Car size={13} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Datos del Vehículo
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Tipo *</label>
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
                      ).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.emoji} {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Estado</label>
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
                    <label className={labelCls}>Marca *</label>
                    <input
                      className={inputCls}
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      placeholder="Mercedes-Benz"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Modelo *</label>
                    <input
                      className={inputCls}
                      value={form.model}
                      onChange={(e) => set("model", e.target.value)}
                      placeholder="Sprinter"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Año</label>
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
                    <label className={labelCls}>Color</label>
                    <input
                      className={inputCls}
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      placeholder="Negro"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Patente *</label>
                    <input
                      className={inputCls}
                      value={form.plate}
                      onChange={(e) =>
                        set("plate", e.target.value.toUpperCase())
                      }
                      placeholder="BCDK-41"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>VIN / Chasis</label>
                    <input
                      className={inputCls}
                      value={form.vin ?? ""}
                      onChange={(e) => set("vin", e.target.value)}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Combustible</label>
                    <select
                      className={inputCls}
                      value={form.fuelType ?? ""}
                      onChange={(e) =>
                        set("fuelType", e.target.value as Vehicle["fuelType"])
                      }
                    >
                      <option value="">Sin especificar</option>
                      {Object.entries(FUEL_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Responsable</label>
                    <input
                      className={inputCls}
                      value={form.assignedTo ?? ""}
                      onChange={(e) => set("assignedTo", e.target.value)}
                      placeholder="Nombre conductor"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Capacidad</label>
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.capacity ?? ""}
                      onChange={(e) =>
                        set(
                          "capacity",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Kilometraje</label>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={form.mileage ?? ""}
                      onChange={(e) =>
                        set(
                          "mileage",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                </div>
              </section>

              {/* documentos */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={13} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Documentos
                    </span>
                  </div>
                </div>
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

              {/* mantención */}
              <section>
                <div className="section-header mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={13} style={{ color: "#C9A96E" }} />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#C9A96E" }}
                    >
                      Mantención
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Última mantención</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.lastService ?? ""}
                      onChange={(e) => set("lastService", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Próxima mantención</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.nextService ?? ""}
                      onChange={(e) => set("nextService", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Próxima km</label>
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
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Observaciones</label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={form.observations ?? ""}
                      onChange={(e) => set("observations", e.target.value)}
                      placeholder="Estado, equipamiento, notas…"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* form footer */}
            <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.brand || !form.model || !form.plate}
                className="flex-[2] py-3 rounded-2xl text-sm font-black btn-gold disabled:opacity-40"
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
