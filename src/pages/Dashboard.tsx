import { useApp } from "../context/AppContext";
import {
  Users,
  CalendarCheck,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_LABELS,
} from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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

  const stats = [
    {
      label: "Casos Activos",
      value: active.length,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-200",
    },
    {
      label: "Servicios Hoy",
      value: todayServices.length,
      icon: CalendarCheck,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-200",
    },
    {
      label: "Cotizaciones Pendientes",
      value: pendingQuotes.length,
      icon: FileText,
      color: "bg-amber-50 text-amber-700",
      border: "border-amber-200",
    },
    {
      label: "Urgencias",
      value: urgent.length,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      border: "border-red-200",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`bg-white rounded-xl p-5 border ${border} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}
              >
                <Icon size={20} />
              </div>
              <TrendingUp size={14} className="text-slate-300" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active cases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Casos en Curso</h2>
            <button
              onClick={() => navigate("/fallecidos")}
              className="text-indigo-600 text-sm hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {active.length === 0 && (
              <p className="px-5 py-6 text-slate-400 text-sm text-center">
                Sin casos activos
              </p>
            )}
            {active.map((d) => (
              <div
                key={d.id}
                className="px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/fallecidos/${d.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {d.fullName}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {SERVICE_LABELS[d.serviceType]} ·{" "}
                      {d.assignedStaff || "Sin asignar"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[d.status]}`}
                  >
                    {STATUS_LABELS[d.status]}
                  </span>
                </div>
                {d.urgencies && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} /> {d.urgencies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's services */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Servicios de Hoy</h2>
            <button
              onClick={() => navigate("/calendario")}
              className="text-indigo-600 text-sm hover:underline"
            >
              Ver calendario
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {todayServices.length === 0 && (
              <p className="px-5 py-6 text-slate-400 text-sm text-center">
                Sin servicios programados hoy
              </p>
            )}
            {todayServices.map((s) => (
              <div key={s.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Clock size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">
                      {s.deceasedName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {SERVICE_LABELS[s.serviceType]}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {format(new Date(s.startDate), "HH:mm")} · {s.location}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.status === "en_curso"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {s.status === "en_curso" ? "En curso" : "Programado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent alerts */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Alertas de Urgencia
          </h2>
          <div className="space-y-2">
            {urgent.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-lg px-4 py-3 border border-red-100 cursor-pointer hover:border-red-300 transition-colors"
                onClick={() => navigate(`/fallecidos/${d.id}`)}
              >
                <p className="font-medium text-slate-800 text-sm">
                  {d.fullName}
                </p>
                <p className="text-red-600 text-xs mt-0.5">{d.urgencies}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
