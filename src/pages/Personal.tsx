import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import type { AppUser, ShiftAssignment, ShiftType } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Phone,
  Mail,
  MapPin,
  X,
  GripVertical,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

/* ─── Palette ───────────────────────────────────── */
const PALETTE = [
  { bg: "#6366F1", light: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  { bg: "#10B981", light: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  { bg: "#F59E0B", light: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  { bg: "#EF4444", light: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
  { bg: "#8B5CF6", light: "#F5F3FF", text: "#5B21B6", dot: "#8B5CF6" },
  { bg: "#06B6D4", light: "#ECFEFF", text: "#164E63", dot: "#06B6D4" },
  { bg: "#EC4899", light: "#FDF2F8", text: "#9D174D", dot: "#EC4899" },
  { bg: "#14B8A6", light: "#F0FDFA", text: "#134E4A", dot: "#14B8A6" },
  { bg: "#F97316", light: "#FFF7ED", text: "#7C2D12", dot: "#F97316" },
  { bg: "#A855F7", light: "#FAF5FF", text: "#6B21A8", dot: "#A855F7" },
];
const palOf = (i: number) => PALETTE[i % PALETTE.length];

/* ─── Shifts ────────────────────────────────────── */
const SHIFTS: {
  key: ShiftType;
  label: string;
  hours: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
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
];

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  vendedor: "Vendedor/a",
  equipo_tecnico: "Equipo Técnico",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  administrador: { bg: "#EFF6FF", text: "#1D4ED8" },
  vendedor: { bg: "#F0FDF4", text: "#15803D" },
  equipo_tecnico: { bg: "#FFF7ED", text: "#C2410C" },
};

const dateKey = (d: Date) => format(d, "yyyy-MM-dd");
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/* ─── Staff card ─────────────────────────────────── */
function StaffCard({
  user,
  colorIdx,
  onDragStart,
}: {
  user: AppUser;
  colorIdx: number;
  onDragStart: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pal = palOf(colorIdx);
  const role = ROLE_COLORS[user.role] ?? { bg: "#F8FAFC", text: "#475569" };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(user.id)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden cursor-grab active:cursor-grabbing select-none hover:shadow-md hover:border-slate-200 transition-all duration-200"
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        onClick={() => setOpen((p) => !p)}
      >
        {/* color dot + avatar */}
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: pal.light, color: pal.text }}
          >
            {user.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: pal.dot }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
            {user.fullName}
          </p>
          <span
            className="inline-block text-xs font-medium px-1.5 py-0.5 rounded-md mt-0.5"
            style={{ background: role.bg, color: role.text }}
          >
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <GripVertical size={14} className="text-slate-300" />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-50 space-y-1.5">
          {user.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone size={11} className="text-slate-400" /> {user.phone}
            </div>
          )}
          {user.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail size={11} className="text-slate-400" /> {user.email}
            </div>
          )}
          {user.sucursal && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={11} className="text-slate-400" /> {user.sucursal}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Shift chip (calendar) ─────────────────────── */
function ShiftChip({
  user,
  colorIdx,
  onRemove,
}: {
  user: AppUser;
  colorIdx: number;
  onRemove: () => void;
}) {
  const pal = palOf(colorIdx);
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium group/chip"
      style={{ background: pal.light, color: pal.text }}
    >
      <span className="truncate max-w-[70px]">
        {user.fullName.split(" ")[0]}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover/chip:opacity-100 transition-opacity shrink-0 hover:text-red-500"
      >
        <X size={9} />
      </button>
    </div>
  );
}

/* ─── Drop cell ─────────────────────────────────── */
function DropCell({
  date,
  shift,
  assignments,
  users,
  onDrop,
  onRemove,
  colorMap,
}: {
  date: Date;
  shift: (typeof SHIFTS)[0];
  assignments: ShiftAssignment[];
  users: AppUser[];
  onDrop: (date: string, shift: ShiftType) => void;
  onRemove: (id: string) => void;
  colorMap: Map<string, number>;
}) {
  const [over, setOver] = useState(false);
  const dk = dateKey(date);
  const cell = assignments.filter(
    (a) => a.date === dk && a.shift === shift.key,
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop(dk, shift.key);
      }}
      className="min-h-[52px] rounded-xl p-1.5 flex flex-wrap gap-1 items-start transition-all duration-150"
      style={{
        background: over ? shift.bg : "transparent",
        border: over
          ? `1.5px dashed ${shift.border}`
          : "1.5px dashed transparent",
      }}
    >
      {cell.map((a) => {
        const u = users.find((u) => u.id === a.userId);
        if (!u) return null;
        return (
          <ShiftChip
            key={a.id}
            user={u}
            colorIdx={colorMap.get(u.id) ?? 0}
            onRemove={() => onRemove(a.id)}
          />
        );
      })}
      {over && cell.length === 0 && (
        <span className="text-xs" style={{ color: shift.color }}>
          + soltar
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function Personal() {
  const { users } = useApp();
  const [view, setView] = useState<"semana" | "mes">("semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const dragUserId = useRef<string | null>(null);

  const colorMap = new Map(users.map((u, i) => [u.id, i]));

  const activeUsers = users.filter(
    (u) =>
      u.active &&
      ["administrador", "vendedor", "equipo_tecnico"].includes(u.role) &&
      (searchQ === "" ||
        u.fullName.toLowerCase().includes(searchQ.toLowerCase())),
  );

  const handleDragStart = (uid: string) => {
    dragUserId.current = uid;
  };

  const handleDrop = (date: string, shift: ShiftType) => {
    const uid = dragUserId.current;
    if (!uid) return;
    if (
      assignments.find(
        (a) => a.userId === uid && a.date === date && a.shift === shift,
      )
    )
      return;
    setAssignments((p) => [
      ...p,
      { id: crypto.randomUUID(), userId: uid, date, shift },
    ]);
    dragUserId.current = null;
  };

  const handleRemove = (id: string) =>
    setAssignments((p) => p.filter((a) => a.id !== id));

  /* nav */
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const prev = () =>
    view === "semana"
      ? setCurrentDate((d) => subWeeks(d, 1))
      : setCurrentDate((d) => subMonths(d, 1));
  const next = () =>
    view === "semana"
      ? setCurrentDate((d) => addWeeks(d, 1))
      : setCurrentDate((d) => addMonths(d, 1));

  const navLabel =
    view === "semana"
      ? `${format(weekDays[0], "d MMM", { locale: es })} – ${format(weekDays[6], "d MMM yyyy", { locale: es })}`
      : format(currentDate, "MMMM yyyy", { locale: es });

  const totalAssignments = assignments.length;
  const todayAssignments = assignments.filter(
    (a) => a.date === dateKey(new Date()),
  ).length;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* ══ LEFT PANEL ══ */}
      <div className="w-72 shrink-0 flex flex-col h-full bg-white border-r border-slate-100 overflow-hidden">
        {/* header */}
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-base font-bold text-slate-800 mb-1">Personal</h2>
          <p className="text-xs text-slate-400 mb-4">
            Arrastra una persona al calendario para asignar turno
          </p>

          {/* search */}
          <div className="relative">
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full text-sm rounded-xl border border-slate-200 pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* role groups */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {(["administrador", "vendedor", "equipo_tecnico"] as const).map(
            (role) => {
              const group = activeUsers.filter((u) => u.role === role);
              if (group.length === 0) return null;
              const rc = ROLE_COLORS[role];
              return (
                <div key={role}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: rc.text }}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: rc.bg, color: rc.text }}
                    >
                      {group.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.map((user, i) => (
                      <StaffCard
                        key={user.id}
                        user={user}
                        colorIdx={colorMap.get(user.id) ?? i}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                </div>
              );
            },
          )}

          {activeUsers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400">Sin personal activo</p>
              <p className="text-xs text-slate-300 mt-1">
                Agrega usuarios en la pestaña Usuarios
              </p>
            </div>
          )}
        </div>

        {/* stats footer */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-slate-800">
                {todayAssignments}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Hoy</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-slate-800">
                {totalAssignments}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Esta semana</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {SHIFTS.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <s.Icon size={12} style={{ color: s.color }} />
                <span className="text-xs text-slate-500 flex-1">{s.label}</span>
                <span className="text-xs text-slate-400">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL — Calendar ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-slate-700 capitalize min-w-[200px] text-center">
              {navLabel}
            </span>
            <button
              onClick={next}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
            >
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors ml-1"
            >
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(["semana", "mes"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={
                  view === v
                    ? {
                        background: "white",
                        color: "#0A1628",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }
                    : { color: "#94A3B8" }
                }
              >
                {v === "semana" ? (
                  <CalendarDays size={13} />
                ) : (
                  <LayoutGrid size={13} />
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── WEEKLY VIEW ── */}
        {view === "semana" && (
          <div className="flex-1 overflow-auto p-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* day headers */}
              <div
                className="grid border-b border-slate-100"
                style={{ gridTemplateColumns: "120px repeat(7, 1fr)" }}
              >
                <div className="px-4 py-3" />
                {weekDays.map((d) => {
                  const today = isToday(d);
                  return (
                    <div
                      key={d.toISOString()}
                      className="px-2 py-3 text-center border-l border-slate-100"
                    >
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                        {format(d, "EEE", { locale: es })}
                      </p>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto transition-all"
                        style={
                          today
                            ? {
                                background:
                                  "linear-gradient(135deg,#D4AF70,#A07840)",
                                color: "#fff",
                              }
                            : { color: "#1E293B" }
                        }
                      >
                        {format(d, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* shift rows */}
              {SHIFTS.map((shift, si) => (
                <div
                  key={shift.key}
                  className={`grid ${si < SHIFTS.length - 1 ? "border-b border-slate-100" : ""}`}
                  style={{ gridTemplateColumns: "120px repeat(7, 1fr)" }}
                >
                  {/* shift label */}
                  <div
                    className="flex items-center gap-2.5 px-4 py-4 border-r border-slate-100"
                    style={{ background: shift.bg }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "white" }}
                    >
                      <shift.Icon size={14} style={{ color: shift.color }} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold"
                        style={{ color: shift.color }}
                      >
                        {shift.label}
                      </p>
                      <p className="text-xs text-slate-400">{shift.hours}</p>
                    </div>
                  </div>

                  {weekDays.map((d) => (
                    <div
                      key={d.toISOString()}
                      className="px-2 py-2 border-l border-slate-100"
                      style={{
                        background: isToday(d)
                          ? "rgba(201,169,110,0.03)"
                          : undefined,
                      }}
                    >
                      <DropCell
                        date={d}
                        shift={shift}
                        assignments={assignments}
                        users={users}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        colorMap={colorMap}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MONTHLY VIEW ── */}
        {view === "mes" && (
          <div className="flex-1 overflow-auto p-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
              {/* DOW headers */}
              <div className="grid grid-cols-7 mb-2">
                {DOW.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map((d) => {
                  const inMonth = isSameMonth(d, currentDate);
                  const today = isToday(d);
                  const dayAssign = assignments.filter(
                    (a) => a.date === dateKey(d),
                  );
                  const count = dayAssign.length;

                  return (
                    <div
                      key={d.toISOString()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const uid = dragUserId.current;
                        if (!uid) return;
                        const dk = dateKey(d);
                        const next = (
                          ["mañana", "tarde", "noche"] as ShiftType[]
                        ).find(
                          (s) =>
                            !assignments.find(
                              (a) =>
                                a.userId === uid &&
                                a.date === dk &&
                                a.shift === s,
                            ),
                        );
                        if (!next) return;
                        setAssignments((p) => [
                          ...p,
                          {
                            id: crypto.randomUUID(),
                            userId: uid,
                            date: dk,
                            shift: next,
                          },
                        ]);
                        dragUserId.current = null;
                      }}
                      className="rounded-xl p-2 min-h-[80px] border transition-all duration-150"
                      style={{
                        opacity: inMonth ? 1 : 0.35,
                        background: today ? "#FEFCE8" : "white",
                        border: today
                          ? "1.5px solid #FDE68A"
                          : "1px solid #F1F5F9",
                      }}
                    >
                      {/* day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold ${
                            today ? "text-yellow-700" : "text-slate-600"
                          }`}
                        >
                          {format(d, "d")}
                        </span>
                        {count > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded-full font-medium">
                            {count}
                          </span>
                        )}
                      </div>

                      {/* shift chips per shift */}
                      <div className="space-y-0.5">
                        {SHIFTS.map((shift) => {
                          const sa = dayAssign.filter(
                            (a) => a.shift === shift.key,
                          );
                          if (sa.length === 0) return null;
                          return (
                            <div
                              key={shift.key}
                              className="flex items-center gap-1 flex-wrap"
                            >
                              <shift.Icon
                                size={9}
                                style={{ color: shift.color }}
                                className="shrink-0"
                              />
                              {sa.slice(0, 2).map((a) => {
                                const u = users.find((x) => x.id === a.userId);
                                if (!u) return null;
                                const pal = palOf(colorMap.get(u.id) ?? 0);
                                return (
                                  <span
                                    key={a.id}
                                    className="text-xs px-1 rounded font-medium truncate max-w-[50px]"
                                    style={{
                                      background: pal.light,
                                      color: pal.text,
                                    }}
                                  >
                                    {u.fullName.split(" ")[0]}
                                  </span>
                                );
                              })}
                              {sa.length > 2 && (
                                <span className="text-xs text-slate-400">
                                  +{sa.length - 2}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
