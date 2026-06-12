import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useCollection } from "../hooks/useCollection";
import type { ShiftAssignment, Vehicle, ProcessStatus } from "../types";
import {
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Truck,
  LogOut,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_LABELS,
} from "../utils/mockData";

const PROCESS_STEPS = [
  { key: "recepcion", label: "Recepción" },
  { key: "preparacion", label: "Preparación" },
  { key: "velatorio", label: "Velatorio" },
  { key: "traslado", label: "Traslado" },
  { key: "ceremonia", label: "Ceremonia" },
  { key: "inhumacion_cremacion", label: "Inhumación / Cremación" },
  { key: "completado", label: "Completado" },
];

const SHIFTS = [
  {
    key: "mañana",
    label: "Mañana",
    hours: "07:00–15:00",
    Icon: Sun,
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    key: "tarde",
    label: "Tarde",
    hours: "15:00–23:00",
    Icon: Sunset,
    color: "#0369A1",
    bg: "#F0F9FF",
    border: "#BAE6FD",
  },
  {
    key: "noche",
    label: "Noche",
    hours: "23:00–07:00",
    Icon: Moon,
    color: "#5B21B6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
] as const;

export default function TecnicoPortal() {
  const { authUser, logout } = useAuth();
  const { deceased, updateDeceased } = useApp();
  const navigate = useNavigate();
  const [vehicles] = useCollection<Vehicle>("veladesk-flota", []);
  const [assignments] = useCollection<ShiftAssignment>("veladesk-turnos", []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!authUser) return null;

  /* ── Mis casos asignados ── */
  const myCases = deceased.filter(
    (d) =>
      d.status !== "completado" &&
      (d.assignedTechnicalIds ?? []).includes(authUser.id),
  );

  /* ── Mis turnos próximos (7 días) ── */
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const myShifts = assignments
    .filter((a) => a.userId === authUser.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingShifts = weekDays
    .flatMap((day) => {
      const dk = format(day, "yyyy-MM-dd");
      return myShifts.filter((a) => a.date === dk).map((a) => ({ ...a, day }));
    })
    .slice(0, 6);

  /* ── Advance status ── */
  const advanceStatus = (deceasedId: string, currentStatus: string) => {
    const idx = PROCESS_STEPS.findIndex((s) => s.key === currentStatus);
    if (idx < 0 || idx >= PROCESS_STEPS.length - 1) return;
    const next = PROCESS_STEPS[idx + 1];
    setUpdatingId(deceasedId);
    updateDeceased(deceasedId, {
      status: next.key as ProcessStatus,
    });
    setTimeout(() => setUpdatingId(null), 600);
  };

  const shiftInfo = (key: string) =>
    SHIFTS.find((s) => s.key === key) ?? SHIFTS[0];

  const dayLabel = (date: Date) => {
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "EEEE d MMM", { locale: es });
  };

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-5"
        style={{
          background:
            "linear-gradient(160deg,#060E1A 0%,#0A1628 60%,#0D1E35 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#C9A96E" }}
            >
              Panel Técnico
            </p>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {authUser.fullName.split(" ")[0]}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.08)", color: "#8FA3B8" }}
          >
            <LogOut size={12} /> Salir
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Casos activos", value: myCases.length },
            { label: "Turnos esta semana", value: upcomingShifts.length },
            {
              label: "Vehículos",
              value: myCases.reduce(
                (acc, d) => acc + (d.assignedVehicleIds?.length ?? 0),
                0,
              ),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5 text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              <p className="text-2xl font-bold" style={{ color: "#D4AF70" }}>
                {value}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(143,163,184,0.7)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        {/* ── Mis Turnos ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
            Mis Turnos — Esta Semana
          </h2>

          {upcomingShifts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <p className="text-sm text-slate-400">
                Sin turnos asignados esta semana
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Consulta con tu administrador
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingShifts.map((a) => {
                const s = shiftInfo(a.shift);
                const today = isToday(a.day);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all"
                    style={{
                      background: today ? s.bg : "white",
                      borderColor: today ? s.border : "#F1F5F9",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: today ? "white" : s.bg }}
                    >
                      <s.Icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800 capitalize">
                        {dayLabel(a.day)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: s.color }}>
                        {s.label} · {s.hours}
                      </p>
                    </div>
                    {today && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                        }}
                      >
                        Ahora
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Mis Casos ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
            Casos Asignados
          </h2>

          {myCases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
              <p className="text-sm text-slate-400">Sin casos asignados</p>
              <p className="text-xs text-slate-300 mt-1">
                Cuando te asignen un servicio aparecerá aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCases.map((d) => {
                const currentIdx = PROCESS_STEPS.findIndex(
                  (s) => s.key === d.status,
                );
                const canAdvance = currentIdx < PROCESS_STEPS.length - 1;
                const nextStep = PROCESS_STEPS[currentIdx + 1];
                const myVehicles = vehicles.filter((v) =>
                  (d.assignedVehicleIds ?? []).includes(v.id),
                );
                const updating = updatingId === d.id;

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    {/* card header */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {d.fullName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {SERVICE_LABELS[d.serviceType] ?? d.serviceType}
                            {d.deathDate &&
                              ` · ${format(parseISO(d.deathDate), "d MMM yyyy", { locale: es })}`}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/fallecidos/${d.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                        >
                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[d.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {STATUS_LABELS[d.status] ?? d.status}
                        </span>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-1">
                        {PROCESS_STEPS.map((step, idx) => {
                          const done = idx < currentIdx;
                          const active = idx === currentIdx;
                          return (
                            <div
                              key={step.key}
                              className="flex items-center flex-1"
                            >
                              <div
                                className={`h-1.5 w-full rounded-full transition-all ${
                                  done
                                    ? "bg-indigo-500"
                                    : active
                                      ? "bg-indigo-300"
                                      : "bg-slate-100"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-400">
                          Etapa {currentIdx + 1} de {PROCESS_STEPS.length}
                        </span>
                        {canAdvance && nextStep && (
                          <span className="text-xs text-slate-400">
                            Siguiente: {nextStep.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vehicles */}
                    {myVehicles.length > 0 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {myVehicles.map((v) => (
                          <span
                            key={v.id}
                            className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 font-medium"
                          >
                            <Truck size={11} className="text-slate-400" />
                            {v.brand} {v.model} · {v.plate}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Advance status button */}
                    {canAdvance && nextStep && (
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => advanceStatus(d.id, d.status)}
                          disabled={updating}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                          style={{
                            background: updating
                              ? "#ECFDF5"
                              : "linear-gradient(135deg,#0A1628,#1a2f4a)",
                            color: updating ? "#10B981" : "white",
                          }}
                        >
                          {updating ? (
                            <>
                              <CheckCircle2 size={16} /> ¡Actualizado!
                            </>
                          ) : (
                            <>
                              <ArrowRight size={16} />
                              Avanzar a "{nextStep.label}"
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {d.status === "completado" && (
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                          <CheckCircle2 size={16} /> Servicio completado
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
