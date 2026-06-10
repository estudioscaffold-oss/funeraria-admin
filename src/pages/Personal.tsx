import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import type { AppUser, ShiftAssignment, ShiftType } from "../types";
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  X,
  Calendar,
  CalendarDays,
  Sun,
  Sunset,
  Moon,
  UserCheck,
  Plus,
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

/* ─── palette — one color per staff member ───── */
const PALETTE = [
  {
    bg: "#6366F1",
    light: "rgba(99,102,241,0.18)",
    text: "#A5B4FC",
    border: "rgba(99,102,241,0.4)",
  },
  {
    bg: "#10B981",
    light: "rgba(16,185,129,0.18)",
    text: "#6EE7B7",
    border: "rgba(16,185,129,0.4)",
  },
  {
    bg: "#F59E0B",
    light: "rgba(245,158,11,0.18)",
    text: "#FCD34D",
    border: "rgba(245,158,11,0.4)",
  },
  {
    bg: "#EF4444",
    light: "rgba(239,68,68,0.18)",
    text: "#FCA5A5",
    border: "rgba(239,68,68,0.4)",
  },
  {
    bg: "#8B5CF6",
    light: "rgba(139,92,246,0.18)",
    text: "#C4B5FD",
    border: "rgba(139,92,246,0.4)",
  },
  {
    bg: "#06B6D4",
    light: "rgba(6,182,212,0.18)",
    text: "#67E8F9",
    border: "rgba(6,182,212,0.4)",
  },
  {
    bg: "#EC4899",
    light: "rgba(236,72,153,0.18)",
    text: "#F9A8D4",
    border: "rgba(236,72,153,0.4)",
  },
  {
    bg: "#14B8A6",
    light: "rgba(20,184,166,0.18)",
    text: "#5EEAD4",
    border: "rgba(20,184,166,0.4)",
  },
  {
    bg: "#F97316",
    light: "rgba(249,115,22,0.18)",
    text: "#FDBA74",
    border: "rgba(249,115,22,0.4)",
  },
  {
    bg: "#A855F7",
    light: "rgba(168,85,247,0.18)",
    text: "#D8B4FE",
    border: "rgba(168,85,247,0.4)",
  },
];
const palOf = (idx: number) => PALETTE[idx % PALETTE.length];

/* ─── shift config ───────────────────────────── */
const SHIFTS: {
  key: ShiftType;
  label: string;
  hours: string;
  Icon: React.ElementType;
}[] = [
  { key: "mañana", label: "Mañana", hours: "07:00–15:00", Icon: Sun },
  { key: "tarde", label: "Tarde", hours: "15:00–23:00", Icon: Sunset },
  { key: "noche", label: "Noche", hours: "23:00–07:00", Icon: Moon },
];

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  vendedor: "Vendedor/a",
  operario: "Operario/a",
  recepcion: "Recepción",
};

const dateKey = (d: Date) => format(d, "yyyy-MM-dd");

/* ══════════════════════════════════════════════
   Staff card (draggable)
══════════════════════════════════════════════ */
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

  return (
    <div
      draggable
      onDragStart={() => onDragStart(user.id)}
      className="rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.01] select-none"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${pal.border}`,
      }}
    >
      {/* header row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        onClick={() => setOpen((p) => !p)}
      >
        {/* avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: pal.light,
            color: pal.text,
            border: `1.5px solid ${pal.border}`,
          }}
        >
          {user.fullName.charAt(0)}
        </div>
        {/* info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "#1E293B" }}
          >
            {user.fullName}
          </p>
          <p className="text-xs truncate" style={{ color: pal.text }}>
            {ROLE_LABELS[user.role] ?? user.role}
          </p>
        </div>
        {/* drag hint + chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-xs hidden group-hover:block"
            style={{ color: "rgba(201,169,110,0.5)" }}
          >
            ⠿
          </span>
          <ChevronDown
            size={13}
            style={{ color: "#64748B" }}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* expanded details */}
      {open && (
        <div
          className="px-4 pb-4 pt-1 space-y-2 text-xs"
          style={{ borderTop: `1px solid ${pal.border}30` }}
        >
          {user.phone && (
            <div
              className="flex items-center gap-2"
              style={{ color: "#64748B" }}
            >
              <Phone size={11} style={{ color: pal.text }} />
              {user.phone}
            </div>
          )}
          {user.email && (
            <div
              className="flex items-center gap-2"
              style={{ color: "#64748B" }}
            >
              <Mail size={11} style={{ color: pal.text }} />
              {user.email}
            </div>
          )}
          {user.sucursal && (
            <div
              className="flex items-center gap-2"
              style={{ color: "#64748B" }}
            >
              <MapPin size={11} style={{ color: pal.text }} />
              {user.sucursal}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full font-medium"
              style={{
                background: user.active
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(107,114,128,0.12)",
                color: user.active ? "#6EE7B7" : "#9CA3AF",
              }}
            >
              {user.active ? "● Activo" : "○ Inactivo"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Shift chip (in calendar)
══════════════════════════════════════════════ */
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
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium group/chip"
      style={{
        background: pal.light,
        color: pal.text,
        border: `1px solid ${pal.border}`,
      }}
    >
      <span className="truncate max-w-[60px]">
        {user.fullName.split(" ")[0]}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover/chip:opacity-100 transition-opacity ml-0.5"
        style={{ color: pal.text }}
      >
        <X size={9} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Drop cell
══════════════════════════════════════════════ */
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
  shift: ShiftType;
  assignments: ShiftAssignment[];
  users: AppUser[];
  onDrop: (date: string, shift: ShiftType) => void;
  onRemove: (id: string) => void;
  colorMap: Map<string, number>;
}) {
  const [over, setOver] = useState(false);
  const dk = dateKey(date);
  const cellAssignments = assignments.filter(
    (a) => a.date === dk && a.shift === shift,
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
        onDrop(dk, shift);
      }}
      className="min-h-[44px] rounded-lg p-1.5 flex flex-wrap gap-1 items-start transition-all duration-150"
      style={{
        background: over ? "rgba(201,169,110,0.12)" : "rgba(6,14,26,0.3)",
        border: over
          ? "1.5px dashed rgba(201,169,110,0.6)"
          : "1px dashed rgba(201,169,110,0.1)",
      }}
    >
      {cellAssignments.map((a) => {
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
      {over && cellAssignments.length === 0 && (
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "rgba(201,169,110,0.6)" }}
        >
          <Plus size={10} /> Soltar aquí
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Personal() {
  const { users } = useApp();
  const [view, setView] = useState<"semana" | "mes">("semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const dragUserId = useRef<string | null>(null);

  /* color map: userId → palette index */
  const colorMap = new Map(users.map((u, i) => [u.id, i]));

  const activeUsers = users.filter(
    (u) =>
      u.active &&
      (searchQ === "" ||
        u.fullName.toLowerCase().includes(searchQ.toLowerCase())),
  );

  /* ── drag ── */
  const handleDragStart = (userId: string) => {
    dragUserId.current = userId;
  };

  /* ── drop ── */
  const handleDrop = (date: string, shift: ShiftType) => {
    const uid = dragUserId.current;
    if (!uid) return;
    // avoid duplicate
    const exists = assignments.find(
      (a) => a.userId === uid && a.date === date && a.shift === shift,
    );
    if (exists) return;
    setAssignments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId: uid,
        date,
        shift,
      },
    ]);
    dragUserId.current = null;
  };

  const handleRemove = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  /* ── week days ── */
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  /* ── month days ── */
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd });

  /* ── nav ── */
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

  /* ── month shift count per day ── */
  const dayShiftCount = (date: Date) =>
    assignments.filter((a) => a.date === dateKey(date)).length;

  return (
    <div className="flex h-full overflow-hidden" style={{ color: "#1E293B" }}>
      {/* ══ LEFT PANEL — Staff list ══ */}
      <div
        className="w-64 shrink-0 flex flex-col h-full border-r overflow-hidden"
        style={{
          background: "#F8FAFC",
          borderColor: "rgba(201,169,110,0.12)",
        }}
      >
        {/* header */}
        <div
          className="px-4 pt-6 pb-4"
          style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <UserCheck size={16} style={{ color: "#C9A96E" }} />
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "#C9A96E" }}
            >
              Personal
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(201,169,110,0.1)", color: "#C9A96E" }}
            >
              {users.filter((u) => u.active).length}
            </span>
          </div>
          {/* search */}
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Buscar…"
            className="w-full text-xs rounded-lg px-3 py-2 input-veladesk"
          />
          <p
            className="text-xs mt-3"
            style={{ color: "rgba(201,169,110,0.5)" }}
          >
            ⠿ Arrastra al calendario para asignar turno
          </p>
        </div>

        {/* staff list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {activeUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#64748B" }}>
                Sin personal activo
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "#94A3B8" }}
              >
                Agrega personal en Administrador
              </p>
            </div>
          ) : (
            activeUsers.map((user, i) => (
              <StaffCard
                key={user.id}
                user={user}
                colorIdx={colorMap.get(user.id) ?? i}
                onDragStart={handleDragStart}
              />
            ))
          )}
        </div>

        {/* legend */}
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
        >
          {SHIFTS.map((s) => (
            <div key={s.key} className="flex items-center gap-2 py-1">
              <s.Icon size={11} style={{ color: "#C9A96E" }} />
              <span className="text-xs" style={{ color: "#64748B" }}>
                {s.label}{" "}
                <span style={{ color: "#94A3B8" }}>
                  {s.hours}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL — Calendar ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* toolbar */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(201,169,110,0.08)",
                color: "#C9A96E",
                border: "1px solid rgba(201,169,110,0.2)",
              }}
            >
              ‹
            </button>
            <span
              className="text-base font-semibold capitalize min-w-[200px] text-center"
              style={{ color: "#1E293B" }}
            >
              {navLabel}
            </span>
            <button
              onClick={next}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(201,169,110,0.08)",
                color: "#C9A96E",
                border: "1px solid rgba(201,169,110,0.2)",
              }}
            >
              ›
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                background: "rgba(201,169,110,0.08)",
                color: "#C9A96E",
                border: "1px solid rgba(201,169,110,0.2)",
              }}
            >
              Hoy
            </button>
          </div>

          {/* view toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(201,169,110,0.2)" }}
          >
            {(["semana", "mes"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all duration-200"
                style={
                  view === v
                    ? {
                        background: "linear-gradient(135deg,#D4AF70,#A07840)",
                        color: "#060E1A",
                      }
                    : { color: "#64748B", background: "transparent" }
                }
              >
                {v === "semana" ? (
                  <Calendar size={13} />
                ) : (
                  <CalendarDays size={13} />
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── WEEKLY VIEW ── */}
        {view === "semana" && (
          <div className="flex-1 overflow-auto px-4 pb-4">
            <table
              className="w-full border-separate"
              style={{ borderSpacing: "4px" }}
            >
              <thead>
                <tr>
                  <th className="w-24 text-left pb-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(201,169,110,0.5)" }}
                    >
                      Turno
                    </span>
                  </th>
                  {weekDays.map((d) => (
                    <th key={d.toISOString()} className="pb-2">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: "#94A3B8" }}
                        >
                          {format(d, "EEE", { locale: es })}
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
                          style={
                            isToday(d)
                              ? {
                                  background:
                                    "linear-gradient(135deg,#D4AF70,#A07840)",
                                  color: "#060E1A",
                                }
                              : { color: "#1E293B" }
                          }
                        >
                          {format(d, "d")}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map((shift) => (
                  <tr key={shift.key}>
                    {/* shift label */}
                    <td className="pr-2 align-top pt-1">
                      <div className="flex items-center gap-1.5 py-1">
                        <shift.Icon size={13} style={{ color: "#C9A96E" }} />
                        <div>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "#C9A96E" }}
                          >
                            {shift.label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "#94A3B8" }}
                          >
                            {shift.hours}
                          </p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((d) => (
                      <td key={d.toISOString()} className="align-top">
                        <DropCell
                          date={d}
                          shift={shift.key}
                          assignments={assignments}
                          users={users}
                          onDrop={handleDrop}
                          onRemove={handleRemove}
                          colorMap={colorMap}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── MONTHLY VIEW ── */}
        {view === "mes" && (
          <div className="flex-1 overflow-auto px-4 pb-4">
            {/* day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div
                  key={d}
                  className="text-center py-2 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(201,169,110,0.5)" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* day grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d) => {
                const inMonth = isSameMonth(d, currentDate);
                const today = isToday(d);
                const count = dayShiftCount(d);
                const dayAssign = assignments.filter(
                  (a) => a.date === dateKey(d),
                );

                return (
                  <div
                    key={d.toISOString()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      // For monthly view: drop assigns to first available shift
                      const uid = dragUserId.current;
                      if (!uid) return;
                      const dk = dateKey(d);
                      const shiftOrder: ShiftType[] = [
                        "mañana",
                        "tarde",
                        "noche",
                      ];
                      // Add to mañana by default if not already there
                      const nextShift = shiftOrder.find(
                        (s) =>
                          !assignments.find(
                            (a) =>
                              a.userId === uid &&
                              a.date === dk &&
                              a.shift === s,
                          ),
                      );
                      if (!nextShift) return;
                      setAssignments((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          userId: uid,
                          date: dk,
                          shift: nextShift,
                        },
                      ]);
                      dragUserId.current = null;
                    }}
                    className="rounded-xl p-2 min-h-[90px] transition-all duration-150 cursor-pointer"
                    style={{
                      background: today
                        ? "rgba(201,169,110,0.08)"
                        : inMonth
                          ? "rgba(13,30,53,0.6)"
                          : "rgba(6,14,26,0.3)",
                      border: today
                        ? "1.5px solid rgba(201,169,110,0.4)"
                        : "1px solid rgba(201,169,110,0.08)",
                      opacity: inMonth ? 1 : 0.35,
                    }}
                  >
                    {/* day number */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: today
                            ? "#D4AF70"
                            : inMonth
                              ? "#F0EDE8"
                              : "#8FA3B8",
                        }}
                      >
                        {format(d, "d")}
                      </span>
                      {count > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(201,169,110,0.12)",
                            color: "#C9A96E",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </div>

                    {/* shift rows per day in month */}
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
                              style={{ color: "rgba(201,169,110,0.5)" }}
                            />
                            {sa.map((a) => {
                              const u = users.find((u) => u.id === a.userId);
                              if (!u) return null;
                              const pal = palOf(colorMap.get(u.id) ?? 0);
                              return (
                                <span
                                  key={a.id}
                                  className="text-xs px-1 rounded font-medium"
                                  style={{
                                    background: pal.light,
                                    color: pal.text,
                                  }}
                                >
                                  {u.fullName.split(" ")[0]}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* drop hint */}
                    {count === 0 && inMonth && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: "rgba(201,169,110,0.2)" }}
                      >
                        + soltar
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
