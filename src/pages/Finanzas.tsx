import { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { Expense } from "../types";
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
  Plus,
  X,
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
import { dbCollections } from "../lib/db";

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

const budgetTotal = (budget: {
  items: { quantity: number; unitPrice: number }[];
  discount: number;
  tax: number;
}) => {
  const sub = budget.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const afterDiscount = sub * (1 - (budget.discount ?? 0) / 100);
  return Math.round(afterDiscount * (1 + (budget.tax ?? 0) / 100));
};

const EXPENSE_CATEGORIES: { value: Expense["category"]; label: string }[] = [
  { value: "personal", label: "Personal / Sueldos" },
  { value: "vehiculos", label: "Vehículos" },
  { value: "insumos", label: "Insumos" },
  { value: "instalaciones", label: "Instalaciones" },
  { value: "servicios", label: "Servicios externos" },
  { value: "otros", label: "Otros" },
];

/* ─── custom tooltip ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs space-y-1.5 shadow-xl"
      style={{
        background: "#FFFFFF",
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
          <span style={{ color: "#64748B" }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: "#1E293B" }}>
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
    <div className="glass-card rounded-2xl p-5 animate-slide-up">
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
      <p className="text-2xl font-bold mt-1" style={{ color: "#1E293B" }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5" style={{ color: "#64748B" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Pending credit row ────────────────────── */
function PendingRow({
  deceasedName,
  clientName,
  totalAmount,
  paid,
  now,
}: {
  deceasedName: string;
  clientName: string;
  totalAmount: number;
  paid: number;
  now: Date;
}) {
  const [open, setOpen] = useState(false);
  const pending = totalAmount - paid;
  const pct = totalAmount > 0 ? Math.round((paid / totalAmount) * 100) : 0;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: "#FFFFFF",
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
            style={{ color: "#1E293B" }}
          >
            {clientName || "Sin contacto"}
          </p>
          <p className="text-xs truncate" style={{ color: "#64748B" }}>
            {deceasedName}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold" style={{ color: "#D4AF70" }}>
            {fmtFull(totalAmount)}
          </p>
          <p className="text-xs" style={{ color: "#64748B" }}>
            total acuerdo
          </p>
        </div>
        {pending > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold" style={{ color: "#FCD34D" }}>
              {fmtFull(pending)}
            </p>
            <p className="text-xs" style={{ color: "rgba(252,211,77,0.6)" }}>
              pendiente
            </p>
          </div>
        )}
        <ChevronRight
          size={14}
          style={{ color: "#64748B" }}
          className={`transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </div>

      {open && (
        <div
          className="px-5 pb-4 space-y-3"
          style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div className="mt-3">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "#64748B" }}
            >
              <span>Cobrado</span>
              <span>
                {pct}% — {fmtFull(paid)} de {fmtFull(totalAmount)}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(201,169,110,0.1)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#C9A96E,#D4AF70)",
                }}
              />
            </div>
          </div>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#64748B" }}
          >
            <Clock size={12} style={{ color: "#FCD34D" }} />
            <span>
              Saldo pendiente al{" "}
              {format(now, "d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Expense form modal ────────────────────── */
function ExpenseModal({
  onSave,
  onClose,
}: {
  onSave: (e: Expense) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Expense, "id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    category: "otros",
    description: "",
    amount: 0,
    paidTo: "",
  });

  const valid = form.description.trim().length > 0 && form.amount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,14,26,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(201,169,110,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: "#1E293B" }}>
            Registrar egreso
          </h3>
          <button onClick={onClose}>
            <X size={18} style={{ color: "#94A3B8" }} />
          </button>
        </div>

        {[
          {
            label: "Fecha",
            el: (
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(201,169,110,0.3)",
                  color: "#1E293B",
                }}
              />
            ),
          },
          {
            label: "Categoría",
            el: (
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category: e.target.value as Expense["category"],
                  }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(201,169,110,0.3)",
                  color: "#1E293B",
                }}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            ),
          },
          {
            label: "Descripción",
            el: (
              <input
                type="text"
                placeholder="Ej: Combustible flota"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(201,169,110,0.3)",
                  color: "#1E293B",
                }}
              />
            ),
          },
          {
            label: "Monto (CLP)",
            el: (
              <input
                type="number"
                placeholder="0"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(201,169,110,0.3)",
                  color: "#1E293B",
                }}
              />
            ),
          },
          {
            label: "Pagado a (opcional)",
            el: (
              <input
                type="text"
                placeholder="Proveedor o persona"
                value={form.paidTo ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, paidTo: e.target.value }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(201,169,110,0.3)",
                  color: "#1E293B",
                }}
              />
            ),
          },
        ].map(({ label, el }) => (
          <div key={label}>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "#64748B" }}
            >
              {label}
            </label>
            {el}
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "#F1F5F9", color: "#64748B" }}
          >
            Cancelar
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave({ ...form, id: crypto.randomUUID() })}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg,#C9A96E,#A07840)",
              color: "#0A1628",
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
type Period = "mensual" | "trimestral" | "semestral" | "anual";
const PERIOD_MONTHS: Record<Period, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

export default function Finanzas() {
  const { deceased } = useApp();
  const [period, setPeriod] = useState<Period>("semestral");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const now = new Date();

  /* ── load expenses from Supabase ── */
  useEffect(() => {
    dbCollections
      .get<Expense[]>("veladesk-expenses", [])
      .then(setExpenses)
      .catch(console.error);
  }, []);

  const saveExpense = async (e: Expense) => {
    const next = [e, ...expenses];
    setExpenses(next);
    setShowExpenseModal(false);
    await dbCollections.set("veladesk-expenses", next);
  };

  /* ── KPIs from real data ── */
  const kpis = useMemo(() => {
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    const inMonth = (dateStr: string) => {
      try {
        return isWithinInterval(parseISO(dateStr), {
          start: mStart,
          end: mEnd,
        });
      } catch {
        return false;
      }
    };

    // Pagos cobrados este mes
    const allPayments = deceased.flatMap((d) => d.payments ?? []);
    const ingresosCobrados = allPayments
      .filter((p) => inMonth(p.date))
      .reduce((s, p) => s + p.amount, 0);

    // Total presupuestado aprobado/facturado este mes
    const allBudgets = deceased.flatMap((d) =>
      (d.budgets ?? [])
        .filter(
          (b) =>
            (b.status === "aprobado" || b.status === "facturado") &&
            inMonth(b.date),
        )
        .map((b) => budgetTotal(b)),
    );
    const ingresosMes = allBudgets.reduce((s, v) => s + v, ingresosCobrados);

    // Egresos del mes
    const egresosMes = expenses
      .filter((e) => inMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);

    // Créditos pendientes (presupuesto aprobado - pagado por fallecido)
    const creditosPendientes = deceased.reduce((total, d) => {
      const approved = (d.budgets ?? [])
        .filter((b) => b.status === "aprobado" || b.status === "facturado")
        .reduce((s, b) => s + budgetTotal(b), 0);
      const paid = (d.payments ?? []).reduce((s, p) => s + p.amount, 0);
      return total + Math.max(0, approved - paid);
    }, 0);

    const utilidad = ingresosCobrados - egresosMes;

    return {
      ingresosMes,
      ingresosCobrados,
      egresosMes,
      creditosPendientes,
      utilidad,
    };
  }, [deceased, expenses, now]);

  /* ── Deceased with outstanding balance ── */
  const pendingCredits = useMemo(() => {
    return deceased
      .map((d) => {
        const approved = (d.budgets ?? []).filter(
          (b) => b.status === "aprobado" || b.status === "facturado",
        );
        if (!approved.length) return null;
        const totalAmount = approved.reduce((s, b) => s + budgetTotal(b), 0);
        const paid = (d.payments ?? []).reduce((s, p) => s + p.amount, 0);
        const pending = totalAmount - paid;
        if (pending <= 0) return null;
        return {
          id: d.id,
          deceasedName: d.fullName,
          clientName: d.familyContact?.name ?? "",
          totalAmount,
          paid,
        };
      })
      .filter(Boolean) as {
      id: string;
      deceasedName: string;
      clientName: string;
      totalAmount: number;
      paid: number;
    }[];
  }, [deceased]);

  /* ── Projection chart from real payment history ── */
  const projData = useMemo(() => {
    const months = PERIOD_MONTHS[period];
    return Array.from({ length: months }, (_, i) => {
      const d = subMonths(now, months - 1 - i);
      const mk = monthKey(d);
      const isCurrent = mk === monthKey(now);

      const ingresos = deceased
        .flatMap((dec) => dec.payments ?? [])
        .filter((p) => {
          try {
            return monthKey(parseISO(p.date)) === mk;
          } catch {
            return false;
          }
        })
        .reduce((s, p) => s + p.amount, 0);

      const egresos = expenses
        .filter((e) => {
          try {
            return monthKey(parseISO(e.date)) === mk;
          } catch {
            return false;
          }
        })
        .reduce((s, e) => s + e.amount, 0);

      const servicios = deceased.filter((dec) => {
        try {
          return monthKey(parseISO(dec.createdAt)) === mk;
        } catch {
          return false;
        }
      }).length;

      return {
        label: format(d, months <= 3 ? "d MMM" : "MMM", { locale: es }),
        ingresos,
        egresos,
        servicios,
        proyectado: isCurrent,
      };
    });
  }, [deceased, expenses, period, now]);

  /* ── Top services by count ── */
  const topServices = useMemo(() => {
    const COLORS: Record<string, string> = {
      servicio_completo: "#C9A96E",
      cremacion: "#6366F1",
      inhumacion: "#10B981",
      velatorio: "#8B5CF6",
      traslado: "#06B6D4",
      otro: "#94A3B8",
    };
    const LABELS: Record<string, string> = {
      servicio_completo: "Servicio Completo",
      cremacion: "Cremación",
      inhumacion: "Inhumación",
      velatorio: "Velatorio",
      traslado: "Traslado",
      otro: "Otro",
    };
    const counts: Record<string, { count: number; revenue: number }> = {};
    for (const d of deceased) {
      const key = d.serviceType ?? "otro";
      if (!counts[key]) counts[key] = { count: 0, revenue: 0 };
      counts[key].count++;
      counts[key].revenue += (d.payments ?? []).reduce(
        (s, p) => s + p.amount,
        0,
      );
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([key, val]) => ({
        name: LABELS[key] ?? key,
        color: COLORS[key] ?? "#94A3B8",
        ...val,
      }));
  }, [deceased]);

  /* ── Expenses this month ── */
  const expensesThisMonth = useMemo(
    () =>
      expenses.filter((e) => {
        try {
          return monthKey(parseISO(e.date)) === monthKey(now);
        } catch {
          return false;
        }
      }),
    [expenses, now],
  );

  const monthLabel = format(now, "MMMM yyyy", { locale: es });

  return (
    <div className="p-8 space-y-8 overflow-auto" style={{ color: "#1E293B" }}>
      {showExpenseModal && (
        <ExpenseModal
          onSave={saveExpense}
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="animate-fade-in">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#C9A96E" }}
        >
          Gestión Financiera
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1
            className="text-3xl font-bold capitalize"
            style={{ color: "#1E293B" }}
          >
            {monthLabel}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg,#C9A96E,#A07840)",
                color: "#0A1628",
              }}
            >
              <Plus size={13} /> Registrar egreso
            </button>
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
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Ingresos del mes"
          value={fmt$(kpis.ingresosMes)}
          icon={DollarSign}
          color="#C9A96E"
          trend={kpis.ingresosMes > 0 ? "up" : "neutral"}
          sub="presupuestos aprobados"
        />
        <KpiCard
          label="Cobrado al día"
          value={fmt$(kpis.ingresosCobrados)}
          icon={CheckCircle2}
          color="#10B981"
          trend={kpis.ingresosCobrados > 0 ? "up" : "neutral"}
          sub="pagos recibidos"
        />
        <KpiCard
          label="Créditos pendientes"
          value={fmt$(kpis.creditosPendientes)}
          icon={CreditCard}
          color="#6366F1"
          sub="saldo por cobrar"
        />
        <KpiCard
          label="Egresos del mes"
          value={fmt$(kpis.egresosMes)}
          icon={TrendingDown}
          color="#EF4444"
          trend={kpis.egresosMes > 0 ? "down" : "neutral"}
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

      {/* ── Créditos pendientes ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <AlertCircle size={15} style={{ color: "#FCD34D" }} />
          <h2
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "#FCD34D" }}
          >
            Saldos pendientes de cobro
          </h2>
          {pendingCredits.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(252,211,77,0.1)", color: "#FCD34D" }}
            >
              {fmt$(kpis.creditosPendientes)} por cobrar
            </span>
          )}
        </div>
        {pendingCredits.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto mb-3"
              style={{ color: "#10B981", opacity: 0.5 }}
            />
            <p className="text-sm font-medium" style={{ color: "#64748B" }}>
              Sin saldos pendientes
            </p>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              Todos los presupuestos aprobados están al día
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingCredits.map((c) => (
              <PendingRow key={c.id} {...c} now={now} />
            ))}
          </div>
        )}
      </div>

      {/* ── Egresos del mes ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "#C9A96E" }}
          >
            Egresos — {monthLabel}
          </h2>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(201,169,110,0.1)", color: "#C9A96E" }}
          >
            <Plus size={12} /> Agregar
          </button>
        </div>
        {expensesThisMonth.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-sm font-medium" style={{ color: "#64748B" }}>
              Sin egresos registrados este mes
            </p>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              Usa "Registrar egreso" para agregar gastos operacionales
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            {expensesThisMonth.map((e, idx) => {
              const catLabel =
                EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ??
                e.category;
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-3 text-sm"
                  style={{
                    borderBottom:
                      idx < expensesThisMonth.length - 1
                        ? "1px solid rgba(201,169,110,0.08)"
                        : "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ color: "#1E293B" }}
                    >
                      {e.description}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      {catLabel}
                      {e.paidTo ? ` · ${e.paidTo}` : ""}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {format(parseISO(e.date), "d MMM", { locale: es })}
                  </p>
                  <p className="font-bold" style={{ color: "#EF4444" }}>
                    {fmtFull(e.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Projection chart ── */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#C9A96E" }}
            >
              Ingresos · Egresos · Servicios
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              Datos reales por período — pagos cobrados y egresos registrados
            </p>
          </div>
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
                      : { color: "#64748B", background: "transparent" }
                  }
                >
                  {p}
                </button>
              ),
            )}
          </div>
        </div>

        {projData.every(
          (d) => d.ingresos === 0 && d.egresos === 0 && d.servicios === 0,
        ) ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Sin datos en este período — el gráfico se completará al registrar
              pagos y egresos
            </p>
          </div>
        ) : (
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
                wrapperStyle={{
                  paddingTop: 16,
                  fontSize: 12,
                  color: "#64748B",
                }}
                formatter={(v) => <span style={{ color: "#64748B" }}>{v}</span>}
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
                    fill={
                      entry.proyectado ? "rgba(201,169,110,0.35)" : "#C9A96E"
                    }
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
        )}
      </div>

      {/* ── Bottom: Top services + Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="glass-card rounded-2xl p-6">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-5"
            style={{ color: "#C9A96E" }}
          >
            Servicios realizados
          </h2>
          {topServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Sin servicios registrados aún
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topServices.map((s, i) => {
                const maxCount = topServices[0].count;
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
                          style={{ color: "#1E293B" }}
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
                          style={{ color: "#64748B" }}
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
          )}
        </div>

        {/* Métricas generales */}
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
                icon: "📊",
                color: "#C9A96E",
                value: fmt$(
                  deceased.length > 0
                    ? Math.round(
                        deceased
                          .flatMap((d) => d.payments ?? [])
                          .reduce((s, p) => s + p.amount, 0) / deceased.length,
                      )
                    : 0,
                ),
              },
              {
                label: "Casos activos",
                icon: "📋",
                color: "#6366F1",
                value: String(
                  deceased.filter((d) => d.status !== "completado").length,
                ),
              },
              {
                label: "Tasa de cobro",
                icon: "✅",
                color: "#10B981",
                value:
                  kpis.ingresosMes > 0
                    ? `${Math.round((kpis.ingresosCobrados / kpis.ingresosMes) * 100)}%`
                    : "—",
              },
              {
                label: "Pendiente total",
                icon: "⏳",
                color: "#F59E0B",
                value: fmt$(kpis.creditosPendientes),
              },
              {
                label: "Margen bruto",
                icon: "📈",
                color: "#10B981",
                value:
                  kpis.ingresosCobrados > 0
                    ? `${Math.round(((kpis.ingresosCobrados - kpis.egresosMes) / kpis.ingresosCobrados) * 100)}%`
                    : "—",
              },
              {
                label: "Servicios este mes",
                icon: "🔢",
                color: "#8B5CF6",
                value: String(
                  deceased.filter((d) => {
                    try {
                      return monthKey(parseISO(d.createdAt)) === monthKey(now);
                    } catch {
                      return false;
                    }
                  }).length,
                ),
              },
              {
                label: "Egresos / Cobrado",
                icon: "💸",
                color: "#F59E0B",
                value:
                  kpis.ingresosCobrados > 0
                    ? `${Math.round((kpis.egresosMes / kpis.ingresosCobrados) * 100)}%`
                    : "—",
              },
              {
                label: "Total servicios",
                icon: "🏦",
                color: "#C9A96E",
                value: String(deceased.length),
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(201,169,110,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <p className="text-xs" style={{ color: "#64748B" }}>
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
    </div>
  );
}
