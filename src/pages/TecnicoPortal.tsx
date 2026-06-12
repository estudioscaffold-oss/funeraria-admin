import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useCollection } from "../hooks/useCollection";
import type { ShiftAssignment, Vehicle, ProcessStatus } from "../types";
import {
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  ArrowRight,
  Truck,
  LogOut,
  MapPin,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
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

/* ─── Types ──────────────────────────────────────── */
interface DeceasedAssignment {
  deceasedId: string;
  technicalIds: string[];
  vehicleIds: string[];
}

/* ─── Constants ──────────────────────────────────── */
const PROCESS_STEPS: {
  key: ProcessStatus | string;
  label: string;
  short: string;
}[] = [
  { key: "recepcion", label: "Recepción", short: "Rec." },
  { key: "preparacion", label: "Preparación", short: "Prep." },
  { key: "velatorio", label: "Velatorio", short: "Vel." },
  { key: "traslado", label: "Traslado", short: "Trsl." },
  { key: "ceremonia", label: "Ceremonia", short: "Cer." },
  {
    key: "inhumacion_cremacion",
    label: "Inhumación / Cremación",
    short: "Inh.",
  },
  { key: "completado", label: "Completado", short: "Comp." },
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

/* ─── CaseCard ───────────────────────────────────── */
function CaseCard({
  d,
  myVehicles,
  onAdvance,
  updating,
}: {
  d: ReturnType<typeof useApp>["deceased"][0];
  myVehicles: Vehicle[];
  onAdvance: () => void;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const currentIdx = PROCESS_STEPS.findIndex((s) => s.key === d.status);
  const canAdvance = currentIdx >= 0 && currentIdx < PROCESS_STEPS.length - 1;
  const nextStep = canAdvance ? PROCESS_STEPS[currentIdx + 1] : null;
  const progress =
    currentIdx >= 0 ? (currentIdx / (PROCESS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Status accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, #4F46E5 0%, #818CF8 ${progress}%, #E2E8F0 ${progress}%)`,
        }}
      />

      {/* Card header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-base leading-tight truncate">
              {d.fullName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {SERVICE_LABELS[d.serviceType] ?? d.serviceType}
              {d.deathDate && (
                <>
                  {" "}
                  ·{" "}
                  {format(parseISO(d.deathDate), "d MMM yyyy", { locale: es })}
                </>
              )}
            </p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[d.status] ?? "bg-slate-100 text-slate-600"}`}
          >
            {STATUS_LABELS[d.status] ?? d.status}
          </span>
        </div>

        {/* Progress stepper */}
        <div className="mt-3">
          <div className="flex items-center gap-0.5">
            {PROCESS_STEPS.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div
                    title={step.label}
                    className={`h-2 w-full rounded-full transition-all ${
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
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-medium text-indigo-600">
              {PROCESS_STEPS[currentIdx]?.label ?? "—"}
            </span>
            {canAdvance && nextStep && (
              <span className="text-xs text-slate-400">
                Siguiente: {nextStep.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles */}
      {myVehicles.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {myVehicles.map((v) => (
            <span
              key={v.id}
              className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 font-medium"
            >
              <Truck size={11} className="text-slate-400" />
              {v.brand} {v.model}
              <span className="text-slate-400 font-normal">· {v.plate}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expandable details */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1.5 text-xs text-slate-400 py-1 hover:text-slate-600 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Ocultar detalles" : "Ver detalles"}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1.5 pb-1">
            {d.velatorio && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium">Velatorio:</span> {d.velatorio}
                {d.velatorioAddress && ` — ${d.velatorioAddress}`}
              </div>
            )}
            {d.cemetery && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium">Cementerio:</span> {d.cemetery}
              </div>
            )}
            {d.crematorium && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium">Crematorio:</span> {d.crematorium}
              </div>
            )}
            {d.familyContact?.name && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium">Contacto:</span>{" "}
                {d.familyContact.name}
                {d.familyContact.phone && ` · ${d.familyContact.phone}`}
              </div>
            )}
            {/* All steps */}
            <div className="mt-2 pt-2 border-t border-slate-50">
              <p className="text-xs font-semibold text-slate-500 mb-1.5">
                Línea de progreso
              </p>
              <div className="space-y-1">
                {PROCESS_STEPS.map((step, idx) => {
                  const done = idx < currentIdx;
                  const active = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          done
                            ? "bg-indigo-500"
                            : active
                              ? "bg-indigo-300 ring-2 ring-indigo-100"
                              : "bg-slate-200"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          active
                            ? "font-bold text-indigo-600"
                            : done
                              ? "text-slate-400 line-through"
                              : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                      {active && (
                        <span className="text-xs text-indigo-400 ml-auto">
                          ← actual
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advance button */}
      {canAdvance && nextStep && (
        <div className="px-4 pb-4">
          <button
            onClick={onAdvance}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
            style={{
              background: updating
                ? "#ECFDF5"
                : "linear-gradient(135deg,#0A1628 0%,#1a2f4a 100%)",
              color: updating ? "#10B981" : "white",
              boxShadow: updating ? "none" : "0 4px 14px rgba(10,22,40,0.25)",
            }}
          >
            {updating ? (
              <>
                <CheckCircle2 size={16} /> ¡Etapa actualizada!
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                Avanzar a &ldquo;{nextStep.label}&rdquo;
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
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function TecnicoPortal() {
  const { authUser, logout } = useAuth();
  const { deceased, updateDeceased } = useApp();
  const [vehicles] = useCollection<Vehicle>("veladesk-flota", []);
  const [shiftAssignments] = useCollection<ShiftAssignment>(
    "veladesk-turnos",
    [],
  );
  const [deceasedAssignments] = useCollection<DeceasedAssignment>(
    "veladesk-asignaciones",
    [],
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"casos" | "turnos">("casos");

  if (!authUser) return null;

  /* ── Casos: busco en veladesk-asignaciones ── */
  const myAssignedIds = deceasedAssignments
    .filter((a) => a.technicalIds.includes(authUser.id))
    .map((a) => a.deceasedId);

  const myCases = deceased.filter(
    (d) => myAssignedIds.includes(d.id) && d.status !== "completado",
  );
  const completedCases = deceased.filter(
    (d) => myAssignedIds.includes(d.id) && d.status === "completado",
  );

  /* ── Vehículos por caso ── */
  const getVehiclesForCase = (deceasedId: string): Vehicle[] => {
    const assignment = deceasedAssignments.find(
      (a) => a.deceasedId === deceasedId,
    );
    if (!assignment) return [];
    return vehicles.filter((v) => assignment.vehicleIds.includes(v.id));
  };

  /* ── Turnos próximos (7 días) ── */
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const myShifts = shiftAssignments
    .filter((a) => a.userId === authUser.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingShifts = weekDays.flatMap((day) => {
    const dk = format(day, "yyyy-MM-dd");
    return myShifts.filter((a) => a.date === dk).map((a) => ({ ...a, day }));
  });

  /* ── Avanzar etapa ── */
  const advanceStatus = (deceasedId: string, currentStatus: string) => {
    const idx = PROCESS_STEPS.findIndex((s) => s.key === currentStatus);
    if (idx < 0 || idx >= PROCESS_STEPS.length - 1) return;
    const next = PROCESS_STEPS[idx + 1];
    setUpdatingId(deceasedId);
    updateDeceased(deceasedId, { status: next.key as ProcessStatus });
    setTimeout(() => setUpdatingId(null), 1200);
  };

  const shiftInfo = (key: string) =>
    SHIFTS.find((s) => s.key === key) ?? SHIFTS[0];

  const dayLabel = (date: Date) => {
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "EEEE d MMM", { locale: es });
  };

  /* ── Total vehículos asignados a mis casos ── */
  const totalVehicles = myAssignedIds.reduce(
    (acc, id) => acc + getVehiclesForCase(id).length,
    0,
  );

  const todayShift = upcomingShifts.find((s) => isToday(s.day));
  const todayShiftInfo = todayShift ? shiftInfo(todayShift.shift) : null;

  return (
    <div className="min-h-screen" style={{ background: "#F1F5F9" }}>
      {/* ── Header ── */}
      <div
        className="px-5 pt-safe-top pt-6 pb-5"
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
              {authUser.fullName.split(" ").slice(0, 2).join(" ")}
            </h1>
            {todayShiftInfo && (
              <div className="flex items-center gap-1.5 mt-1">
                <todayShiftInfo.Icon
                  size={11}
                  style={{ color: todayShiftInfo.color }}
                />
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#D4AF70",
                  }}
                >
                  Turno {todayShiftInfo.label} · {todayShiftInfo.hours}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", color: "#8FA3B8" }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            {
              label: "Casos activos",
              value: myCases.length,
              icon: <User size={13} />,
            },
            {
              label: "Turnos / semana",
              value: upcomingShifts.length,
              icon: <Clock size={13} />,
            },
            {
              label: "Vehículos asig.",
              value: totalVehicles,
              icon: <Truck size={13} />,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-xl px-2 py-2.5 text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              <div
                className="flex items-center justify-center gap-1 mb-0.5"
                style={{ color: "#D4AF70" }}
              >
                {icon}
                <p className="text-xl font-bold">{value}</p>
              </div>
              <p
                className="text-xs leading-tight"
                style={{ color: "rgba(143,163,184,0.7)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Tab selector */}
        <div
          className="grid grid-cols-2 gap-1 mt-4 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {(["casos", "turnos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="py-2 rounded-lg text-xs font-semibold capitalize transition-all"
              style={
                activeTab === tab
                  ? { background: "#C9A96E", color: "#0A1628" }
                  : { color: "rgba(143,163,184,0.7)" }
              }
            >
              {tab === "casos"
                ? `Mis Casos ${myCases.length > 0 ? `(${myCases.length})` : ""}`
                : `Mis Turnos ${upcomingShifts.length > 0 ? `(${upcomingShifts.length})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto pb-safe-bottom pb-8">
        {/* ══ TAB: CASOS ══ */}
        {activeTab === "casos" && (
          <>
            {myCases.length === 0 && completedCases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#F1F5F9" }}
                >
                  <User size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Sin casos asignados
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Cuando te asignen un servicio aparecerá aquí
                </p>
              </div>
            ) : (
              <>
                {myCases.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                      Activos ({myCases.length})
                    </h2>
                    {myCases.map((d) => (
                      <CaseCard
                        key={d.id}
                        d={d}
                        myVehicles={getVehiclesForCase(d.id)}
                        onAdvance={() => advanceStatus(d.id, d.status)}
                        updating={updatingId === d.id}
                      />
                    ))}
                  </div>
                )}

                {completedCases.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mt-2">
                      Completados ({completedCases.length})
                    </h2>
                    {completedCases.map((d) => (
                      <CaseCard
                        key={d.id}
                        d={d}
                        myVehicles={getVehiclesForCase(d.id)}
                        onAdvance={() => {}}
                        updating={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══ TAB: TURNOS ══ */}
        {activeTab === "turnos" && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
              Esta Semana
            </h2>

            {upcomingShifts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#F1F5F9" }}
                >
                  <Calendar size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Sin turnos asignados esta semana
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Consulta con tu administrador
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Group by day */}
                {weekDays.map((day) => {
                  const dk = format(day, "yyyy-MM-dd");
                  const dayShifts = upcomingShifts.filter((a) => a.date === dk);
                  if (dayShifts.length === 0) return null;
                  const today = isToday(day);

                  return (
                    <div key={dk}>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide mb-1.5 px-1 capitalize"
                        style={{ color: today ? "#4F46E5" : "#94A3B8" }}
                      >
                        {dayLabel(day)}
                        {today && (
                          <span className="ml-2 text-xs normal-case bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                            Hoy
                          </span>
                        )}
                      </p>
                      <div className="space-y-2">
                        {dayShifts.map((a) => {
                          const s = shiftInfo(a.shift);
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
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: today ? "white" : s.bg }}
                              >
                                <s.Icon size={20} style={{ color: s.color }} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-slate-800 capitalize">
                                  Turno {s.label}
                                </p>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{ color: s.color }}
                                >
                                  {s.hours}
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
                                  Activo
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
