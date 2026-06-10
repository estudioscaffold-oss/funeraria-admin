import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import type { CreditPlan, Expense } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  subMonths,
  getMonth,
  getYear,
} from "date-fns";
import { es } from "date-fns/locale";

/* ─── helpers ──────────────────────────────── */
const fmt$ = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n.toLocaleString("es-CL")}`;

const fmtFull = (n: number) =>
  `$${n.toLocaleString("es-CL", { minimumFractionDigits: 0 })}`;

const monthKey = (d: Date) =>
  `${getYear(d)}-${String(getMonth(d) + 1).padStart(2, "0")}`;

/* ─── mock expenses (demo) ─────────────────── */
const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    date: "2026-06-02",
    category: "vehiculos",
    description: "Combustible flota",
    amount: 180000,
  },
  {
    id: "e2",
    date: "2026-06-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1800000,
  },
  {
    id: "e3",
    date: "2026-06-05",
    category: "insumos",
    description: "Ataúdes stock",
    amount: 620000,
  },
  {
    id: "e4",
    date: "2026-06-07",
    category: "instalaciones",
    description: "Arriendo sala velatorio",
    amount: 450000,
  },
  {
    id: "e5",
    date: "2026-06-10",
    category: "servicios",
    description: "Crematorio externo",
    amount: 280000,
  },
  {
    id: "e6",
    date: "2026-06-12",
    category: "otros",
    description: "Papelería y admin",
    amount: 45000,
  },
  {
    id: "e7",
    date: "2026-05-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1800000,
  },
  {
    id: "e8",
    date: "2026-05-05",
    category: "insumos",
    description: "Urnas stock",
    amount: 320000,
  },
  {
    id: "e9",
    date: "2026-05-08",
    category: "vehiculos",
    description: "Mantención vehículo",
    amount: 210000,
  },
  {
    id: "e10",
    date: "2026-04-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1800000,
  },
  {
    id: "e11",
    date: "2026-04-06",
    category: "insumos",
    description: "Insumos preparación",
    amount: 180000,
  },
  {
    id: "e12",
    date: "2026-03-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1750000,
  },
  {
    id: "e13",
    date: "2026-03-07",
    category: "vehiculos",
    description: "Seguro flota",
    amount: 320000,
  },
  {
    id: "e14",
    date: "2026-02-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1750000,
  },
  {
    id: "e15",
    date: "2026-01-03",
    category: "personal",
    description: "Sueldos quincena",
    amount: 1700000,
  },
];

/* ─── mock credit plans (demo) ─────────────── */
const MOCK_CREDITS: CreditPlan[] = [
  {
    id: "cp1",
    deceasedId: "",
    deceasedName: "Juan Carlos Pérez Morales",
    clientName: "María Pérez",
    totalAmount: 1800000,
    createdAt: "2026-01-10",
    installments: [
      {
        id: "i1",
        dueDate: "2026-01-15",
        amount: 600000,
        method: "cheque",
        status: "cobrado",
        reference: "CH-001",
      },
      {
        id: "i2",
        dueDate: "2026-02-15",
        amount: 600000,
        method: "cheque",
        status: "cobrado",
        reference: "CH-002",
      },
      {
        id: "i3",
        dueDate: "2026-06-15",
        amount: 600000,
        method: "cheque",
        status: "pendiente",
        reference: "CH-003",
      },
    ],
  },
  {
    id: "cp2",
    deceasedId: "",
    deceasedName: "Rosa Elena Vidal Soto",
    clientName: "Carlos Vidal",
    totalAmount: 2400000,
    createdAt: "2026-05-20",
    installments: [
      {
        id: "i4",
        dueDate: "2026-06-01",
        amount: 800000,
        method: "cuota",
        status: "cobrado",
        reference: "C-001",
      },
      {
        id: "i5",
        dueDate: "2026-07-01",
        amount: 800000,
        method: "cuota",
        status: "pendiente",
        reference: "C-002",
      },
      {
        id: "i6",
        dueDate: "2026-08-01",
        amount: 800000,
        method: "cuota",
        status: "pendiente",
        reference: "C-003",
      },
    ],
  },
  {
    id: "cp3",
    deceasedId: "",
    deceasedName: "Pedro Antonio Ramos",
    clientName: "Ana Ramos",
    totalAmount: 950000,
    createdAt: "2026-06-01",
    installments: [
      {
        id: "i7",
        dueDate: "2026-06-20",
        amount: 475000,
        method: "transferencia",
        status: "pendiente",
        reference: "T-201",
      },
      {
        id: "i8",
        dueDate: "2026-07-20",
        amount: 475000,
        method: "transferencia",
        status: "pendiente",
        reference: "T-202",
      },
    ],
  },
  {
    id: "cp4",
    deceasedId: "",
    deceasedName: "Carmen López Díaz",
    clientName: "Luis López",
    totalAmount: 1200000,
    createdAt: "2026-05-15",
    installments: [
      {
        id: "i9",
        dueDate: "2026-05-20",
        amount: 400000,
        method: "cheque",
        status: "cobrado",
        reference: "CH-010",
      },
      {
        id: "i10",
        dueDate: "2026-06-05",
        amount: 400000,
        method: "cheque",
        status: "vencido",
        reference: "CH-011",
      },
      {
        id: "i11",
        dueDate: "2026-07-05",
        amount: 400000,
        method: "cheque",
        status: "pendiente",
        reference: "CH-012",
      },
    ],
  },
];

/* ─── projection mock data ─────────────────── */
function buildProjectionData(months: number) {
  const base = new Date(2026, 5, 1); // June 2026
  return Array.from({ length: months }, (_, i) => {
    const d = subMonths(base, months - 1 - i);
    const isFuture = i >= months - 1;
    const seed = (getMonth(d) + 1) * 7 + getYear(d);
    const servicios = isFuture
      ? Math.round(4 + (seed % 5))
      : Math.round(3 + (seed % 6));
    const ingresos = servicios * (780000 + (seed % 4) * 120000);
    const egresos = Math.round(ingresos * (0.38 + (seed % 10) * 0.02));
    return {
      label: format(d, "MMM", { locale: es }),
      servicios,
      ingresos,
      egresos,
      proyectado: isFuture,
    };
  });
}

/* ─── top services mock ────────────────────── */
const TOP_SERVICES = [
  { name: "Servicio Completo", count: 18, revenue: 14400000, color: "#C9A96E" },
  { name: "Cremación", count: 11, revenue: 7700000, color: "#6366F1" },
  { name: "Inhumación", count: 8, revenue: 4800000, color: "#10B981" },
  { name: "Velatorio", count: 6, revenue: 2400000, color: "#8B5CF6" },
  { name: "Traslado", count: 4, revenue: 1200000, color: "#06B6D4" },
];

/* ─── custom tooltip ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs space-y-1.5 shadow-xl"
      style={{
        background: "#0D1E35",
        border: "1px solid rgba(201,169,110,0.3)",
      }}
    >
      <p className="font-bold mb-2 capitalize" style={{ color: "#D4AF70" }}>
        {label}
      </p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.fill }}
          />
          <span style={{ color: "#8FA3B8" }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: "#F0EDE8" }}>
            {p.dataKey === "servicios" ? p.value : fmt$(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI card ─────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="glass-card rounded-2xl p-5 animate-slide-up group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}20`,
            boxShadow: `0 4px 12px ${color}30`,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
            style={{
              background:
                trend === "up"
                  ? "rgba(16,185,129,0.1)"
                  : trend === "down"
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(201,169,110,0.1)",
              color:
                trend === "up"
                  ? "#6EE7B7"
                  : trend === "down"
                    ? "#FCA5A5"
                    : "#D4AF70",
            }}
          >
            {trend === "up" ? (
              <TrendingUp size={11} />
            ) : trend === "down" ? (
              <TrendingDown size={11} />
            ) : null}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mt-1" style={{ color: "#F0EDE8" }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5" style={{ color: "#8FA3B8" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "rgba(143,163,184,0.6)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Credit row ───────────────────────────── */
function CreditRow({ plan, now }: { plan: CreditPlan; now: Date }) {
  const [open, setOpen] = useState(false);
  const thisMonth = plan.installments.filter((i) => {
    try {
      return monthKey(parseISO(i.dueDate)) === monthKey(now);
    } catch {
      return false;
    }
  });
  const pendThisMonth = thisMonth.filter(
    (i) => i.status === "pendiente" || i.status === "vencido",
  );
  const totalPend = pendThisMonth.reduce((s, i) => s + i.amount, 0);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: "rgba(13,30,53,0.7)",
        border: "1px solid rgba(201,169,110,0.12)",
      }}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "#F0EDE8" }}
          >
            {plan.clientName}
          </p>
          <p className="text-xs truncate" style={{ color: "#8FA3B8" }}>
            {plan.deceasedName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold" style={{ color: "#D4AF70" }}>
            {fmtFull(plan.totalAmount)}
          </p>
          <p className="text-xs" style={{ color: "#8FA3B8" }}>
            total acuerdo
          </p>
        </div>
        {totalPend > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: "#FCD34D" }}>
              {fmtFull(totalPend)}
            </p>
            <p className="text-xs" style={{ color: "rgba(252,211,77,0.6)" }}>
              ingresa este mes
            </p>
          </div>
        )}
        <ChevronRight
          size={14}
          style={{ color: "#8FA3B8" }}
          className={`transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </div>

      {open && (
        <div
          className="px-5 pb-4 space-y-2"
          style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
        >
          {plan.installments.map((inst, idx) => {
            const statusStyle = {
              cobrado: {
                icon: CheckCircle2,
                color: "#6EE7B7",
                bg: "rgba(16,185,129,0.1)",
              },
              pendiente: {
                icon: Clock,
                color: "#FCD34D",
                bg: "rgba(245,158,11,0.1)",
              },
              vencido: {
                icon: XCircle,
                color: "#FCA5A5",
                bg: "rgba(239,68,68,0.1)",
              },
            }[inst.status];
            const StatusIcon = statusStyle.icon;
            const isCurrent =
              monthKey(parseISO(inst.dueDate)) === monthKey(now);
            return (
              <div
                key={inst.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs"
                style={{
                  background: isCurrent
                    ? "rgba(201,169,110,0.06)"
                    : "transparent",
                  border: isCurrent
                    ? "1px solid rgba(201,169,110,0.15)"
                    : "1px solid transparent",
                }}
              >
                <span style={{ color: "#8FA3B8" }}>Cuota {idx + 1}</span>
                <span className="font-semibold" style={{ color: "#F0EDE8" }}>
                  {fmtFull(inst.amount)}
                </span>
                <span style={{ color: "#8FA3B8" }}>
                  {format(parseISO(inst.dueDate), "d MMM yyyy", { locale: es })}
                </span>
                <span
                  className="capitalize px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(201,169,110,0.1)",
                    color: "#C9A96E",
                  }}
                >
                  {inst.method}
                </span>
                {inst.reference && (
                  <span style={{ color: "rgba(143,163,184,0.5)" }}>
                    {inst.reference}
                  </span>
                )}
                <div
                  className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                  }}
                >
                  <StatusIcon size={10} />
                  <span className="capitalize">{inst.status}</span>
                </div>
                {isCurrent && inst.status !== "cobrado" && (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#FCD34D" }}
                  >
                    ← Este mes
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
type Period = "mensual" | "trimestral" | "semestral" | "anual";
const PERIOD_MONTHS: Record<Period, number> = {
  mensual: 3,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

export default function Finanzas() {
  const { deceased } = useApp();
  const [period, setPeriod] = useState<Period>("semestral");
  const now = new Date();

  /* ── compute KPIs ── */
  const kpis = useMemo(() => {
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    // All payments from deceased records
    const allPayments = deceased.flatMap((d) => d.payments ?? []);

    // Ingresos del mes: budgets with status confirmed in this month
    const monthPayments = allPayments.filter((p) => {
      try {
        return isWithinInterval(parseISO(p.date), { start: mStart, end: mEnd });
      } catch {
        return false;
      }
    });
    const ingresosCobrados = monthPayments.reduce((s, p) => s + p.amount, 0);

    // Add mock income from deceased budgets
    const mockIngresos = 3_850_000;
    const ingresosMes = mockIngresos + ingresosCobrados;

    // Egresos del mes
    const egresosMes = MOCK_EXPENSES.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), { start: mStart, end: mEnd });
      } catch {
        return false;
      }
    }).reduce((s, e) => s + e.amount, 0);

    // Créditos pendientes total
    const creditosPendientes = MOCK_CREDITS.flatMap((c) => c.installments)
      .filter((i) => i.status === "pendiente" || i.status === "vencido")
      .reduce((s, i) => s + i.amount, 0);

    // Proyección ingresos mes actual (from credits due this month)
    const proyeccionMes = MOCK_CREDITS.flatMap((c) => c.installments)
      .filter((i) => {
        try {
          return (
            monthKey(parseISO(i.dueDate)) === monthKey(now) &&
            i.status !== "cobrado"
          );
        } catch {
          return false;
        }
      })
      .reduce((s, i) => s + i.amount, 0);

    const utilidad = ingresosMes + ingresosCobrados - egresosMes;

    return {
      ingresosMes,
      ingresosCobrados,
      egresosMes,
      creditosPendientes,
      proyeccionMes,
      utilidad,
    };
  }, [deceased, now]);

  /* ── projection chart data ── */
  const projData = useMemo(
    () => buildProjectionData(PERIOD_MONTHS[period]),
    [period],
  );

  /* ── credits due this month ── */
  const creditsThisMonth = MOCK_CREDITS.filter((c) =>
    c.installments.some((i) => {
      try {
        return (
          monthKey(parseISO(i.dueDate)) === monthKey(now) &&
          i.status !== "cobrado"
        );
      } catch {
        return false;
      }
    }),
  );

  const monthLabel = format(now, "MMMM yyyy", { locale: es });

  return (
    <div className="p-8 space-y-8 overflow-auto" style={{ color: "#F0EDE8" }}>
      {/* ── Header ── */}
      <div className="animate-fade-in">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#C9A96E" }}
        >
          Gestión Financiera
        </p>
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl font-bold capitalize"
            style={{ color: "#F0EDE8" }}
          >
            {monthLabel}
          </h1>
          <span
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(201,169,110,0.1)",
              color: "#C9A96E",
              border: "1px solid rgba(201,169,110,0.2)",
            }}
          >
            Datos en tiempo real
          </span>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Ingresos totales del mes"
          value={fmt$(kpis.ingresosMes)}
          icon={DollarSign}
          color="#C9A96E"
          trend="up"
          sub="facturado + cobrado"
        />
        <KpiCard
          label="Cobrado al día"
          value={fmt$(kpis.ingresosCobrados)}
          icon={CheckCircle2}
          color="#10B981"
          trend="up"
          sub="pagos recibidos"
        />
        <KpiCard
          label="Créditos otorgados"
          value={fmt$(kpis.creditosPendientes)}
          icon={CreditCard}
          color="#6366F1"
          sub="saldo pendiente total"
        />
        <KpiCard
          label="Egresos del mes"
          value={fmt$(kpis.egresosMes)}
          icon={TrendingDown}
          color="#EF4444"
          trend="down"
          sub="gastos operacionales"
        />
        <KpiCard
          label="Utilidad del mes"
          value={fmt$(kpis.utilidad)}
          icon={TrendingUp}
          color={kpis.utilidad >= 0 ? "#10B981" : "#EF4444"}
          trend={kpis.utilidad >= 0 ? "up" : "down"}
          sub="cobrado − egresos"
        />
      </div>

      {/* ── Credits this month ── */}
      {creditsThisMonth.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={15} style={{ color: "#FCD34D" }} />
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#FCD34D" }}
            >
              Ingresos programados — {monthLabel}
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(252,211,77,0.1)", color: "#FCD34D" }}
            >
              {fmt$(kpis.proyeccionMes)} proyectados
            </span>
          </div>
          <div className="space-y-2">
            {creditsThisMonth.map((c) => (
              <CreditRow key={c.id} plan={c} now={now} />
            ))}
          </div>
        </div>
      )}

      {/* ── Projection chart ── */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#C9A96E" }}
            >
              Proyección — Servicios · Ingresos · Egresos
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8FA3B8" }}>
              Último periodo · barras sólidas = real · translúcido = estimado
            </p>
          </div>
          {/* period tabs */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(201,169,110,0.2)" }}
          >
            {(["mensual", "trimestral", "semestral", "anual"] as Period[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-4 py-2 text-xs font-medium capitalize transition-all duration-200"
                  style={
                    period === p
                      ? {
                          background: "linear-gradient(135deg,#D4AF70,#A07840)",
                          color: "#060E1A",
                        }
                      : { color: "#8FA3B8", background: "transparent" }
                  }
                >
                  {p}
                </button>
              ),
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={projData} barGap={4} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="rgba(201,169,110,0.07)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#8FA3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: "#8FA3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmt$}
              width={56}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#8FA3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 16, fontSize: 12, color: "#8FA3B8" }}
              formatter={(v) => <span style={{ color: "#8FA3B8" }}>{v}</span>}
            />
            <Bar
              yAxisId="left"
              dataKey="ingresos"
              name="Ingresos"
              radius={[6, 6, 0, 0]}
            >
              {projData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.proyectado ? "rgba(201,169,110,0.35)" : "#C9A96E"}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="left"
              dataKey="egresos"
              name="Egresos"
              radius={[6, 6, 0, 0]}
            >
              {projData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.proyectado ? "rgba(239,68,68,0.3)" : "#EF4444"}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="right"
              dataKey="servicios"
              name="Servicios"
              radius={[6, 6, 0, 0]}
            >
              {projData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.proyectado ? "rgba(99,102,241,0.3)" : "#6366F1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* legend clarification */}
        <div className="flex gap-6 mt-2 flex-wrap">
          {[
            { color: "#C9A96E", label: "Ingresos (real)" },
            { color: "rgba(201,169,110,0.35)", label: "Ingresos (estimado)" },
            { color: "#EF4444", label: "Egresos (real)" },
            { color: "#6366F1", label: "Servicios vendidos" },
          ].map(({ color, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#8FA3B8" }}
            >
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom: Top services + Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="glass-card rounded-2xl p-6">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-5"
            style={{ color: "#C9A96E" }}
          >
            Servicios más vendidos
          </h2>
          <div className="space-y-4">
            {TOP_SERVICES.map((s, i) => {
              const maxCount = TOP_SERVICES[0].count;
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                        style={{ background: `${s.color}20`, color: s.color }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#F0EDE8" }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-sm font-bold"
                        style={{ color: s.color }}
                      >
                        {s.count}
                      </span>
                      <span
                        className="text-xs ml-2"
                        style={{ color: "#8FA3B8" }}
                      >
                        {fmt$(s.revenue)}
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${s.color}90, ${s.color})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* General metrics */}
        <div className="glass-card rounded-2xl p-6">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-5"
            style={{ color: "#C9A96E" }}
          >
            Métricas generales
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Ticket promedio",
                value: fmt$(
                  Math.round(kpis.ingresosMes / Math.max(deceased.length, 1)),
                ),
                icon: "📊",
                color: "#C9A96E",
              },
              {
                label: "Casos activos",
                value: String(
                  deceased.filter((d) => d.status !== "completado").length,
                ),
                icon: "📋",
                color: "#6366F1",
              },
              {
                label: "Tasa cobro",
                value: `${Math.round((kpis.ingresosCobrados / Math.max(kpis.ingresosMes, 1)) * 100)}%`,
                icon: "✅",
                color: "#10B981",
              },
              {
                label: "Créditos vencidos",
                value: fmt$(
                  MOCK_CREDITS.flatMap((c) => c.installments)
                    .filter((i) => i.status === "vencido")
                    .reduce((s, i) => s + i.amount, 0),
                ),
                icon: "⚠️",
                color: "#EF4444",
              },
              {
                label: "Margen bruto",
                value: `${Math.round(((kpis.ingresosMes - kpis.egresosMes) / Math.max(kpis.ingresosMes, 1)) * 100)}%`,
                icon: "📈",
                color: "#10B981",
              },
              {
                label: "Servicios este mes",
                value: String(
                  TOP_SERVICES.reduce((s, x) => s + x.count, 0) > 0 ? 7 : 0,
                ),
                icon: "🔢",
                color: "#8B5CF6",
              },
              {
                label: "Egresos / Ingreso",
                value: `${Math.round((kpis.egresosMes / Math.max(kpis.ingresosMes, 1)) * 100)}%`,
                icon: "💸",
                color: "#F59E0B",
              },
              {
                label: "Saldo proyectado",
                value: fmt$(
                  kpis.ingresosMes - kpis.egresosMes + kpis.proyeccionMes,
                ),
                icon: "🏦",
                color: "#C9A96E",
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "rgba(6,14,26,0.5)",
                  border: "1px solid rgba(201,169,110,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <p className="text-xs" style={{ color: "#8FA3B8" }}>
                    {label}
                  </p>
                </div>
                <p className="text-lg font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── All credits table ── */}
      <div className="space-y-3">
        <h2
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color: "#C9A96E" }}
        >
          Todos los créditos activos
        </h2>
        <div className="space-y-2">
          {MOCK_CREDITS.map((c) => (
            <CreditRow key={c.id} plan={c} now={now} />
          ))}
        </div>
      </div>
    </div>
  );
}
