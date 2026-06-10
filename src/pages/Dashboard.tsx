import { useApp } from "../context/AppContext";
import {
  Users,
  CalendarCheck,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { STATUS_LABELS, SERVICE_LABELS } from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 group cursor-default animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: `${accent}18` }}
        >
          <Icon size={20} style={{ color: accent }} strokeWidth={2} />
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: "rgba(201,169,110,0.1)", color: "#A07840" }}
        >
          {sub ?? "Total"}
        </span>
      </div>
      <p className="text-4xl font-bold mb-1" style={{ color: "#0A1628" }}>
        {value}
      </p>
      <p className="text-sm" style={{ color: "#64748B" }}>
        {label}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  action,
  onAction,
  children,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <h2
          className="font-bold text-sm tracking-wide"
          style={{ color: "#0A1628" }}
        >
          {title}
        </h2>
        {action && (
          <button
            onClick={onAction}
            className="flex items-center gap-1 text-xs font-medium transition-all duration-200 hover:gap-2"
            style={{ color: "#C9A96E" }}
          >
            {action} <ArrowRight size={11} />
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  recepcion: { bg: "rgba(59,130,246,0.1)", color: "#1D4ED8" },
  preparacion: { bg: "rgba(139,92,246,0.1)", color: "#6D28D9" },
  en_proceso: { bg: "rgba(201,169,110,0.12)", color: "#A07840" },
  velatorio: { bg: "rgba(249,115,22,0.1)", color: "#C2410C" },
  traslado: { bg: "rgba(20,184,166,0.1)", color: "#0F766E" },
  completado: { bg: "rgba(16,185,129,0.1)", color: "#047857" },
  cancelado: { bg: "rgba(107,114,128,0.1)", color: "#374151" },
};

export default function Dashboard() {
  const { deceased, services, quotes } = useApp();
  const navigate = useNavigate();

  const active = deceased.filter((d) => d.status !== "completado");
  const urgent = deceased.filter(
    (d) => d.urgencies && d.status !== "completado",
  );
  const todayStr = new Date().toISOString().split("T")[0];
  const todayServices = services.filter((s) =>
    s.startDate.startsWith(todayStr),
  );
  const pendingQuotes = quotes.filter(
    (q) => q.status === "borrador" || q.status === "enviada",
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#C9A96E" }}
        >
          {format(new Date(), "EEEE", { locale: es }).toUpperCase()}
        </p>
        <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>
          Bienvenida al cetro de control de tu organización
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Casos Activos"
          value={active.length}
          icon={Users}
          accent="#0A1628"
        />
        <StatCard
          label="Servicios Hoy"
          value={todayServices.length}
          icon={CalendarCheck}
          accent="#047857"
          sub="Hoy"
        />
        <StatCard
          label="Cotizaciones Pendientes"
          value={pendingQuotes.length}
          icon={FileText}
          accent="#1D4ED8"
        />
        <StatCard
          label="Urgencias"
          value={urgent.length}
          icon={AlertTriangle}
          accent="#B91C1C"
          sub="Alerta"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active cases */}
        <SectionCard
          title="Casos en Curso"
          action="Ver todos"
          onAction={() => navigate("/fallecidos")}
        >
          {active.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Users
                size={28}
                className="mx-auto mb-3"
                style={{ color: "#CBD5E1" }}
              />
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Sin casos activos
              </p>
            </div>
          ) : (
            active.slice(0, 6).map((d, i) => {
              const st = STATUS_STYLE[d.status] ?? STATUS_STYLE.recepcion;
              return (
                <div
                  key={d.id}
                  className="table-row-veladesk flex items-center justify-between px-6 py-4 cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => navigate(`/fallecidos/${d.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: "#0A1628", color: "#D4AF70" }}
                    >
                      {d.fullName.charAt(0)}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        {d.fullName}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#64748B" }}
                      >
                        {SERVICE_LABELS[d.serviceType]} ·{" "}
                        {d.assignedStaff || "Sin asignar"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.urgencies && (
                      <AlertTriangle size={13} style={{ color: "#EF4444" }} />
                    )}
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {STATUS_LABELS[d.status]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </SectionCard>

        {/* Today's services */}
        <SectionCard
          title="Servicios de Hoy"
          action="Ver progreso"
          onAction={() => navigate("/progreso")}
        >
          {todayServices.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CalendarCheck
                size={28}
                className="mx-auto mb-3"
                style={{ color: "#CBD5E1" }}
              />
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Sin servicios programados hoy
              </p>
            </div>
          ) : (
            todayServices.map((s, i) => (
              <div
                key={s.id}
                className="table-row-veladesk flex items-start gap-4 px-6 py-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(201,169,110,0.1)",
                    border: "1px solid rgba(201,169,110,0.2)",
                  }}
                >
                  <Clock size={15} style={{ color: "#C9A96E" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "#1E293B" }}
                  >
                    {s.deceasedName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {SERVICE_LABELS[s.serviceType]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                    {format(new Date(s.startDate), "HH:mm")} · {s.location}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                  style={
                    s.status === "en_curso"
                      ? { background: "rgba(16,185,129,0.1)", color: "#047857" }
                      : {
                          background: "rgba(201,169,110,0.1)",
                          color: "#A07840",
                        }
                  }
                >
                  {s.status === "en_curso" ? "En curso" : "Programado"}
                </span>
              </div>
            ))
          )}
        </SectionCard>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div
          className="rounded-2xl p-6 animate-slide-up"
          style={{ background: "#FFF7F7", border: "1px solid #FECACA" }}
        >
          <h2
            className="font-bold flex items-center gap-2 mb-4 text-sm"
            style={{ color: "#B91C1C" }}
          >
            <AlertTriangle size={16} /> Alertas de Urgencia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {urgent.map((d) => (
              <div
                key={d.id}
                className="rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-sm"
                style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
                onClick={() => navigate(`/fallecidos/${d.id}`)}
              >
                <p
                  className="font-semibold text-sm"
                  style={{ color: "#1E293B" }}
                >
                  {d.fullName}
                </p>
                <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
                  {d.urgencies}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
