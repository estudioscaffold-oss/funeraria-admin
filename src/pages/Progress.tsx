import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import type { ProcessTask, TaskResource } from "../types";
import {
  generateDefaultTasks,
  SERVICE_LABELS,
  VENDEDORES,
} from "../utils/mockData";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  ChevronDown,
  Check,
  Clock,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Package,
  Users as UsersIcon,
  ExternalLink,
  User,
  X,
} from "lucide-react";

/* ─── Task color palette ─────────────────────────── */
const TASK_COLORS = [
  {
    bg: "bg-indigo-500",
    light: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-300",
    hex: "#6366f1",
  },
  {
    bg: "bg-sky-500",
    light: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-300",
    hex: "#0ea5e9",
  },
  {
    bg: "bg-emerald-500",
    light: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
    hex: "#10b981",
  },
  {
    bg: "bg-amber-500",
    light: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    hex: "#f59e0b",
  },
  {
    bg: "bg-purple-500",
    light: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
    hex: "#a855f7",
  },
  {
    bg: "bg-rose-500",
    light: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-300",
    hex: "#f43f5e",
  },
  {
    bg: "bg-orange-500",
    light: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    hex: "#f97316",
  },
  {
    bg: "bg-teal-500",
    light: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-300",
    hex: "#14b8a6",
  },
  {
    bg: "bg-pink-500",
    light: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-300",
    hex: "#ec4899",
  },
  {
    bg: "bg-cyan-500",
    light: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-300",
    hex: "#06b6d4",
  },
];
const tc = (idx: number) => TASK_COLORS[idx % TASK_COLORS.length];

/* ─── constants ─────────────────────────────────── */
const LEGAL_HOURS = 48;

const TASK_STATUS_META = {
  pendiente: {
    label: "Pendiente",
    badgeBg: "bg-slate-100",
    badgeTxt: "text-slate-500",
  },
  en_curso: {
    label: "En curso",
    badgeBg: "bg-blue-100",
    badgeTxt: "text-blue-700",
  },
  completado: {
    label: "Completado",
    badgeBg: "bg-emerald-100",
    badgeTxt: "text-emerald-700",
  },
  cancelado: {
    label: "Cancelado",
    badgeBg: "bg-slate-100",
    badgeTxt: "text-slate-400",
  },
} as const;

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";

/* ─── hooks ─────────────────────────────────────── */
function useNow(ms = 15000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/* ─── time helpers ───────────────────────────────── */
function getDeadline(deathDate: string, deathTime: string) {
  return new Date(
    new Date(`${deathDate}T${deathTime || "00:00"}:00`).getTime() +
      LEGAL_HOURS * 3_600_000,
  );
}

function urgencyStyle(remainingH: number, expired: boolean) {
  if (expired)
    return {
      stripe: "from-slate-700 to-slate-800",
      badge: "bg-slate-700 text-slate-200",
      label: "Vencido",
      dot: "bg-slate-400",
    };
  if (remainingH <= 6)
    return {
      stripe: "from-red-600 to-red-700",
      badge: "bg-red-600 text-white",
      label: "⚠ Crítico",
      dot: "bg-red-500 animate-pulse",
    };
  if (remainingH <= 12)
    return {
      stripe: "from-orange-500 to-orange-600",
      badge: "bg-orange-500 text-white",
      label: "Urgente",
      dot: "bg-orange-400 animate-pulse",
    };
  if (remainingH <= 24)
    return {
      stripe: "from-amber-400 to-amber-500",
      badge: "bg-amber-400 text-amber-900",
      label: "Atención",
      dot: "bg-amber-400",
    };
  return {
    stripe: "from-emerald-500 to-emerald-600",
    badge: "bg-emerald-500 text-white",
    label: "En tiempo",
    dot: "bg-emerald-400",
  };
}

/* ─── Mini Gantt ─────────────────────────────────── */
function MiniGantt({
  tasks,
  deathDate,
  deathTime,
  now,
}: {
  tasks: ProcessTask[];
  deathDate: string;
  deathTime: string;
  now: Date;
}) {
  const origin = new Date(`${deathDate}T${deathTime || "00:00"}:00`).getTime();
  const totalMs = LEGAL_HOURS * 3_600_000;
  const pct = (dt: string) =>
    Math.min(
      100,
      Math.max(0, ((new Date(dt).getTime() - origin) / totalMs) * 100),
    );
  const wid = (s: string, e: string) =>
    Math.max(
      0.8,
      Math.min(
        100 - pct(s),
        ((new Date(e).getTime() - new Date(s).getTime()) / totalMs) * 100,
      ),
    );
  const nowPct = Math.min(
    100,
    Math.max(0, ((now.getTime() - origin) / totalMs) * 100),
  );
  const visible = tasks.filter((t) => t.plannedStart && t.plannedEnd);

  return (
    <div className="px-4 pt-1 pb-3">
      {/* hour ruler */}
      <div className="relative flex justify-between mb-1.5">
        {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((h) => (
          <span
            key={h}
            className="text-xs text-slate-400"
            style={{ width: 0, display: "inline-block", textAlign: "center" }}
          >
            {h}h
          </span>
        ))}
      </div>

      {/* rows */}
      <div
        className="relative bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
        style={{ height: `${Math.max(visible.length, 1) * 30 + 12}px` }}
      >
        {/* grid */}
        {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200/70"
            style={{ left: `${(h / LEGAL_HOURS) * 100}%` }}
          />
        ))}

        {visible.map((task, i) => {
          const color = tc(task.order);
          const left = pct(task.plannedStart!);
          const width = wid(task.plannedStart!, task.plannedEnd!);
          const actualLeft = task.actualStart ? pct(task.actualStart) : null;
          const actualEnd =
            task.actualEnd ??
            (task.status === "en_curso" ? now.toISOString() : null);
          const actualWidth =
            actualLeft !== null && actualEnd
              ? Math.max(0.8, wid(task.actualStart!, actualEnd))
              : null;

          return (
            <div
              key={task.id}
              className="absolute"
              style={{ top: `${i * 30 + 6}px`, height: 22, left: 0, right: 0 }}
            >
              {/* planned ghost */}
              <div
                className="absolute h-full rounded-lg opacity-20"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: color.hex,
                }}
              />
              {/* actual */}
              {actualLeft !== null && actualWidth !== null && (
                <div
                  className={`absolute h-full rounded-lg ${color.bg} opacity-90 flex items-center px-1.5 overflow-hidden`}
                  style={{ left: `${actualLeft}%`, width: `${actualWidth}%` }}
                >
                  {width > 5 && (
                    <span className="text-white text-xs font-medium truncate leading-none">
                      {task.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              )}
              {/* label on planned if no actual */}
              {actualLeft === null && (
                <div
                  className="absolute h-full rounded-lg border-2 border-dashed flex items-center px-1.5 overflow-hidden"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    borderColor: color.hex,
                  }}
                >
                  {width > 5 && (
                    <span
                      className="text-xs font-medium truncate leading-none"
                      style={{ color: color.hex }}
                    >
                      {task.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* now line */}
        {nowPct >= 0 && nowPct <= 100 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-20"
            style={{ left: `${nowPct}%` }}
          >
            <div className="absolute -top-0 left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>

      {/* micro legend */}
      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-4 h-2 rounded border-2 border-dashed border-slate-400 inline-block" />{" "}
          Planificado
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-4 h-2 rounded bg-emerald-500 inline-block" /> Real
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-px h-3 bg-red-500 inline-block" /> Ahora
        </span>
      </div>
    </div>
  );
}

/* ─── Task detail panel ─────────────────────────── */
function TaskDetail({
  task,
  onUpdate,
  onDelete,
  onStatus,
}: {
  task: ProcessTask;
  deceasedId: string;
  onUpdate: (t: ProcessTask) => void;
  onDelete: () => void;
  onStatus: (s: ProcessTask["status"]) => void;
}) {
  const { users } = useApp();
  const staff =
    task.assignedStaff ?? (task.assignedTo ? [task.assignedTo] : []);
  const resources: TaskResource[] = task.resources ?? [];

  const toggleStaff = (name: string) => {
    const next = staff.includes(name)
      ? staff.filter((s) => s !== name)
      : [...staff, name];
    onUpdate({ ...task, assignedStaff: next, assignedTo: next[0] ?? "" });
  };

  const addResource = () =>
    onUpdate({
      ...task,
      resources: [
        ...resources,
        { id: crypto.randomUUID(), name: "", quantity: 1, unit: "unidad" },
      ],
    });

  const updateResource = (id: string, patch: Partial<TaskResource>) =>
    onUpdate({
      ...task,
      resources: resources.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });

  const removeResource = (id: string) =>
    onUpdate({ ...task, resources: resources.filter((r) => r.id !== id) });

  // All available staff: from users + VENDEDORES fallback
  const allStaff = users.length
    ? users.filter((u) => u.active).map((u) => u.fullName)
    : VENDEDORES;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* ── Nombre + Estado + Tiempos ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Nombre de la etapa
          </label>
          <input
            className={inputCls}
            value={task.name}
            onChange={(e) => onUpdate({ ...task, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Estado
          </label>
          <select
            className={inputCls}
            value={task.status}
            onChange={(e) => onStatus(e.target.value as ProcessTask["status"])}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Inicio planificado
          </label>
          <input
            type="datetime-local"
            className={inputCls}
            value={task.plannedStart?.slice(0, 16) ?? ""}
            onChange={(e) =>
              onUpdate({ ...task, plannedStart: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Término planificado
          </label>
          <input
            type="datetime-local"
            className={inputCls}
            value={task.plannedEnd?.slice(0, 16) ?? ""}
            onChange={(e) => onUpdate({ ...task, plannedEnd: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Notas
          </label>
          <input
            className={inputCls}
            value={task.notes ?? ""}
            onChange={(e) => onUpdate({ ...task, notes: e.target.value })}
            placeholder="Observaciones de la etapa…"
          />
        </div>
      </div>

      {/* ── Personal asignado ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <UsersIcon size={13} className="text-slate-400" />
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Personal asignado
          </label>
          {staff.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {staff.length} asignado{staff.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white border border-slate-200">
          {allStaff.map((name) => {
            const sel = staff.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggleStaff(name)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all duration-150 ${
                  sel
                    ? "bg-navy-900 text-white border-navy-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={
                  sel
                    ? {
                        background: "#0A1628",
                        borderColor: "#0A1628",
                        color: "#fff",
                      }
                    : {}
                }
              >
                {sel && <Check size={10} />}
                {name.split(" ")[0]} {name.split(" ")[1]?.charAt(0)}.
              </button>
            );
          })}
          {allStaff.length === 0 && (
            <p className="text-xs text-slate-400">
              Sin personal disponible. Agrega en Administrador.
            </p>
          )}
        </div>
        {/* selected chips */}
        {staff.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {staff.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "#0A1628", color: "#D4AF70" }}
              >
                {s}
                <button
                  onClick={() => toggleStaff(s)}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Insumos / Recursos ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package size={13} className="text-slate-400" />
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Insumos y Recursos
            </label>
            {resources.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                {resources.length} ítem{resources.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={addResource}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            <Plus size={11} /> Agregar
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400">Sin insumos asignados</p>
            <button
              onClick={addResource}
              className="mt-1 text-xs text-indigo-500 hover:underline"
            >
              + Agregar insumo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200"
              >
                <input
                  className="flex-1 text-xs border-0 outline-none bg-transparent font-medium text-slate-700"
                  value={r.name}
                  placeholder="Nombre del insumo / recurso…"
                  onChange={(e) =>
                    updateResource(r.id, { name: e.target.value })
                  }
                />
                <input
                  type="number"
                  min={1}
                  className="w-14 text-xs text-center border border-slate-200 rounded-lg px-1.5 py-1 outline-none focus:border-slate-400"
                  value={r.quantity ?? 1}
                  onChange={(e) =>
                    updateResource(r.id, { quantity: Number(e.target.value) })
                  }
                />
                <select
                  className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 outline-none bg-white text-slate-600 focus:border-slate-400"
                  value={r.unit ?? "unidad"}
                  onChange={(e) =>
                    updateResource(r.id, { unit: e.target.value })
                  }
                >
                  {[
                    "unidad",
                    "litros",
                    "kg",
                    "metros",
                    "horas",
                    "caja",
                    "set",
                  ].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeResource(r.id)}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> Eliminar etapa
        </button>
      </div>
    </div>
  );
}

/* ─── Task row ───────────────────────────────────── */
function TaskRow({
  task,
  deceasedId,
  colorIdx,
}: {
  task: ProcessTask;
  deceasedId: string;
  colorIdx: number;
}) {
  const { setTaskStatus, updateTask, deleteTask } = useApp();
  const [open, setOpen] = useState(false);
  const color = tc(colorIdx);
  const meta = TASK_STATUS_META[task.status];
  const isDone = task.status === "completado";
  const isCancelled = task.status === "cancelado";

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${open ? "shadow-sm" : ""} ${isDone ? "border-emerald-200 bg-emerald-50/40" : isCancelled ? "border-slate-100 bg-slate-50/40" : `border-slate-200 bg-white`}`}
    >
      {/* main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setOpen((p) => !p)}
      >
        {/* color pill */}
        <div
          className={`w-2 self-stretch rounded-full shrink-0 ${isDone ? "bg-emerald-400" : isCancelled ? "bg-slate-200" : color.bg}`}
        />

        {/* number badge */}
        <span
          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-100 text-emerald-600" : color.light + " " + color.text}`}
        >
          {task.order + 1}
        </span>

        {/* name */}
        <span
          className={`flex-1 text-sm font-semibold ${isCancelled ? "line-through text-slate-400" : isDone ? "text-slate-500" : "text-slate-800"}`}
        >
          {task.name}
        </span>

        {/* planned time */}
        {task.plannedStart && (
          <span className="text-xs text-slate-400 hidden sm:block tabular-nums">
            {format(new Date(task.plannedStart), "HH:mm")}
            {task.plannedEnd &&
              `–${format(new Date(task.plannedEnd), "HH:mm")}`}
          </span>
        )}

        {/* assignee */}
        {task.assignedTo && (
          <span className="hidden md:flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            <User size={10} /> {task.assignedTo.split(" ")[0]}
          </span>
        )}

        {/* status badge */}
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${meta.badgeBg} ${meta.badgeTxt}`}
        >
          {isDone ? (
            <span className="flex items-center gap-1">
              <Check size={10} /> {meta.label}
            </span>
          ) : (
            meta.label
          )}
        </span>

        {/* quick action buttons */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {task.status === "pendiente" && (
            <button
              onClick={() => setTaskStatus(deceasedId, task.id, "en_curso")}
              className={`p-1.5 rounded-lg transition-colors ${color.light} ${color.text} hover:opacity-80`}
              title="Iniciar tarea"
            >
              <Play size={12} />
            </button>
          )}
          {task.status === "en_curso" && (
            <button
              onClick={() => setTaskStatus(deceasedId, task.id, "completado")}
              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
              title="Marcar completada"
            >
              <Check size={12} />
            </button>
          )}
          {(task.status === "completado" || task.status === "en_curso") && (
            <button
              onClick={() => setTaskStatus(deceasedId, task.id, "pendiente")}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              title="Revertir"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* expanded detail */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/40">
          <TaskDetail
            task={task}
            deceasedId={deceasedId}
            onUpdate={(t) => updateTask(deceasedId, t)}
            onDelete={() => {
              if (confirm(`¿Eliminar tarea "${task.name}"?`))
                deleteTask(deceasedId, task.id);
            }}
            onStatus={(s) => setTaskStatus(deceasedId, task.id, s)}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Deceased card ─────────────────────────────── */
function DeceasedCard({
  d,
  now,
}: {
  d: ReturnType<typeof useApp>["deceased"][0];
  now: Date;
}) {
  const navigate = useNavigate();
  const { addTask } = useApp();
  const [open, setOpen] = useState(false);

  const origin = new Date(`${d.deathDate}T${d.deathTime || "00:00"}:00`);
  const deadline = getDeadline(d.deathDate, d.deathTime);
  const remainingMs = deadline.getTime() - now.getTime();
  const remainingH = remainingMs / 3_600_000;
  const elapsedPct = Math.min(
    100,
    Math.max(
      0,
      ((now.getTime() - origin.getTime()) / (LEGAL_HOURS * 3_600_000)) * 100,
    ),
  );
  const expired = remainingMs <= 0;
  const urg = urgencyStyle(remainingH, expired);

  const tasks = [...d.tasks].sort((a, b) => a.order - b.order);
  const done = tasks.filter((t) => t.status === "completado").length;
  const inCourse = tasks.filter((t) => t.status === "en_curso").length;

  const countdownLabel = expired
    ? `Venció hace ${differenceInHours(now, deadline)}h ${differenceInMinutes(now, deadline) % 60}m`
    : differenceInHours(deadline, now) >= 1
      ? `${differenceInHours(deadline, now)}h ${differenceInMinutes(deadline, now) % 60}m restantes`
      : `${differenceInMinutes(deadline, now)}m restantes`;

  const handleAddDefaultTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateDefaultTasks(d.deathDate, d.deathTime).forEach((t, i) =>
      addTask(d.id, { ...t, id: crypto.randomUUID(), order: tasks.length + i }),
    );
  };

  const handleAddTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("Nombre de la tarea:");
    if (!name) return;
    addTask(d.id, {
      id: crypto.randomUUID(),
      name,
      status: "pendiente",
      order: tasks.length,
      description: "",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── clickable header row ── */}
      <div
        className="flex items-stretch cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        {/* urgency stripe */}
        <div className={`w-1.5 shrink-0 bg-gradient-to-b ${urg.stripe}`} />

        {/* main info */}
        <div className="flex-1 flex items-center gap-4 px-5 py-4">
          {/* avatar */}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${urg.stripe} flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {d.fullName.charAt(0)}
          </div>

          {/* name + meta */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-base truncate">
              {d.fullName}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {d.rut} · {SERVICE_LABELS[d.serviceType]} ·{" "}
              <span className="text-slate-500">
                Fallecimiento:{" "}
                {format(origin, "d MMM yyyy HH:mm", { locale: es })}
              </span>
            </p>
          </div>

          {/* task progress chips */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {tasks.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1">
                  {tasks.slice(0, 8).map((t) => (
                    <div
                      key={t.id}
                      className={`w-2.5 h-2.5 rounded-full ${t.status === "completado" ? tc(t.order).bg : t.status === "en_curso" ? tc(t.order).bg + " opacity-60 animate-pulse" : "bg-slate-300"}`}
                      title={t.name}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {done}/{tasks.length}
                </span>
              </>
            )}
          </div>

          {/* urgency badge + countdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${urg.badge}`}
              >
                {urg.label}
              </span>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                {countdownLabel}
              </p>
            </div>
            {!expired && remainingH <= 12 && (
              <AlertTriangle
                size={16}
                className="text-red-500 animate-pulse shrink-0"
              />
            )}
          </div>

          {/* go to ficha */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fallecidos/${d.id}`);
            }}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
            title="Ver ficha"
          >
            <ExternalLink size={15} />
          </button>

          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* ── expanded content ── */}
      {open && (
        <div className="border-t border-slate-100">
          {/* 48h timeline bar */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">
                  Límite legal 48h
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>
                  Fallecimiento:{" "}
                  <b>{format(origin, "d MMM HH:mm", { locale: es })}</b>
                </span>
                <span>→</span>
                <span>
                  Límite:{" "}
                  <b>{format(deadline, "d MMM HH:mm", { locale: es })}</b>
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-xs ${urg.badge}`}
                >
                  {Math.round(elapsedPct)}%
                </span>
              </div>
            </div>

            {/* bar */}
            <div className="relative h-5 rounded-full overflow-hidden bg-slate-100">
              {/* color zones */}
              <div className="absolute inset-0 flex rounded-full overflow-hidden">
                <div className="bg-emerald-200" style={{ width: "50%" }} />
                <div className="bg-amber-200" style={{ width: "25%" }} />
                <div className="bg-red-200" style={{ width: "25%" }} />
              </div>
              {/* fill */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${expired ? "bg-slate-500" : elapsedPct > 75 ? "bg-red-500" : elapsedPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${elapsedPct}%` }}
              />
              {/* task markers */}
              {tasks
                .filter((t) => t.plannedStart)
                .map((t) => {
                  const pct = Math.min(
                    98,
                    Math.max(
                      1,
                      ((new Date(t.plannedStart!).getTime() -
                        origin.getTime()) /
                        (LEGAL_HOURS * 3_600_000)) *
                        100,
                    ),
                  );
                  return (
                    <div
                      key={t.id}
                      className={`absolute top-1 bottom-1 w-1.5 rounded-full ${tc(t.order).bg} opacity-80 ring-1 ring-white`}
                      style={{ left: `${pct}%` }}
                      title={t.name}
                    />
                  );
                })}
            </div>
            <div className="flex justify-between mt-1">
              {[0, 12, 24, 36, 48].map((h) => (
                <span key={h} className="text-xs text-slate-300">
                  {h}h
                </span>
              ))}
            </div>
          </div>

          {/* Gantt */}
          {tasks.length > 0 && (
            <MiniGantt
              tasks={tasks}
              deathDate={d.deathDate}
              deathTime={d.deathTime}
              now={now}
            />
          )}

          {/* ── task list ── */}
          <div className="px-5 pb-5">
            {/* task list header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-700">
                  Tareas del proceso
                </p>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  {done}/{tasks.length} completadas
                </span>
                {inCourse > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    {inCourse} en curso
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {tasks.length === 0 && (
                  <button
                    onClick={handleAddDefaultTasks}
                    className="text-xs text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors border border-indigo-200"
                  >
                    Cargar predeterminadas
                  </button>
                )}
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors border border-slate-200"
                >
                  <Plus size={12} /> Agregar
                </button>
              </div>
            </div>

            {/* color legend for this card */}
            {tasks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-slate-50 rounded-xl">
                {tasks.map((t) => (
                  <span
                    key={t.id}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${tc(t.order).light} ${tc(t.order).text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tc(t.order).bg}`}
                    />
                    {t.order + 1}. {t.name}
                  </span>
                ))}
              </div>
            )}

            {/* task rows */}
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Sin tareas asignadas</p>
                <button
                  onClick={handleAddDefaultTasks}
                  className="mt-2 text-indigo-600 text-sm hover:underline font-medium"
                >
                  Cargar tareas predeterminadas del proceso
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    deceasedId={d.id}
                    colorIdx={task.order}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────── */
export default function Progress() {
  const { deceased } = useApp();
  const now = useNow();
  const [filter, setFilter] = useState<"activos" | "todos">("activos");

  const list = (
    filter === "activos"
      ? deceased.filter((d) => d.status !== "completado")
      : deceased
  ).sort(
    (a, b) =>
      getDeadline(a.deathDate, a.deathTime).getTime() -
      getDeadline(b.deathDate, b.deathTime).getTime(),
  );

  const criticalCount = list.filter((d) => {
    const h =
      (getDeadline(d.deathDate, d.deathTime).getTime() - now.getTime()) /
      3_600_000;
    return h <= 12 && h > 0;
  }).length;

  return (
    <div className="p-6 space-y-5">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Progreso</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Seguimiento de tareas · límite legal de <b>48h</b> entre
            fallecimiento e inhumación
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse">
              <AlertTriangle size={13} /> {criticalCount} caso
              {criticalCount > 1 ? "s" : ""} urgente
              {criticalCount > 1 ? "s" : ""}
            </span>
          )}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            {(["activos", "todos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium transition-colors ${filter === f ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {f === "activos"
                  ? `Activos (${deceased.filter((d) => d.status !== "completado").length})`
                  : `Todos (${deceased.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* urgency legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { color: "bg-emerald-500", label: "En tiempo  › 24h" },
          { color: "bg-amber-400", label: "Atención  12–24h" },
          { color: "bg-orange-500", label: "Urgente  6–12h" },
          { color: "bg-red-600", label: "Crítico  ‹ 6h" },
          { color: "bg-slate-600", label: "Vencido" },
        ].map(({ color, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full"
          >
            <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
          </span>
        ))}
      </div>

      {/* cards */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <p className="text-base font-medium">
            Sin casos {filter === "activos" ? "activos" : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <DeceasedCard key={d.id} d={d} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
