import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SERVICE_LABELS } from "../utils/mockData";
import type { FuneralService } from "../types";
import ServiceModal from "../components/calendar/ServiceModal";

type ViewMode = "month" | "week" | "day";

export default function Calendar() {
  const { services, deceased } = useApp();
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [selected, setSelected] = useState<FuneralService | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  const prev = () => {
    if (view === "month") setCurrent(subMonths(current, 1));
    else if (view === "week") setCurrent(subWeeks(current, 1));
    else setCurrent(addDays(current, -1));
  };
  const next = () => {
    if (view === "month") setCurrent(addMonths(current, 1));
    else if (view === "week") setCurrent(addWeeks(current, 1));
    else setCurrent(addDays(current, 1));
  };

  const getTitle = () => {
    if (view === "month") return format(current, "MMMM yyyy", { locale: es });
    if (view === "week") {
      const ws = startOfWeek(current, { weekStartsOn: 1 });
      const we = endOfWeek(current, { weekStartsOn: 1 });
      return `${format(ws, "d MMM", { locale: es })} – ${format(we, "d MMM yyyy", { locale: es })}`;
    }
    return format(current, "EEEE d 'de' MMMM yyyy", { locale: es });
  };

  const servicesForDay = (day: Date) =>
    services.filter((s) => isSameDay(parseISO(s.startDate), day));

  const serviceColor = (s: FuneralService) =>
    s.color ||
    {
      inhumacion: "#64748b",
      cremacion: "#ec4899",
      traslado: "#f59e0b",
      velatorio: "#6366f1",
      servicio_completo: "#10b981",
      otro: "#94a3b8",
    }[s.serviceType] ||
    "#6366f1";

  const handleDayClick = (day: Date) => {
    setClickedDate(day);
    setSelected(null);
    setShowModal(true);
  };

  const handleServiceClick = (e: React.MouseEvent, s: FuneralService) => {
    e.stopPropagation();
    setSelected(s);
    setShowModal(true);
  };

  // --- Month view ---
  const renderMonth = () => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return (
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map((wd) => (
            <div
              key={wd}
              className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide"
            >
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100">
          {days.map((day) => {
            const dayServices = servicesForDay(day);
            const isToday = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, current);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 p-1.5 cursor-pointer hover:bg-indigo-50 transition-colors ${!inMonth ? "bg-slate-50" : "bg-white"}`}
                onClick={() => handleDayClick(day)}
              >
                <span
                  className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : inMonth
                        ? "text-slate-700"
                        : "text-slate-300"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="space-y-0.5">
                  {dayServices.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="text-xs px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer"
                      style={{ backgroundColor: serviceColor(s) }}
                      onClick={(e) => handleServiceClick(e, s)}
                      title={`${s.deceasedName} · ${SERVICE_LABELS[s.serviceType]}`}
                    >
                      {format(parseISO(s.startDate), "HH:mm")}{" "}
                      {s.deceasedName.split(" ")[0]}
                    </div>
                  ))}
                  {dayServices.length > 3 && (
                    <p className="text-xs text-slate-400 pl-1">
                      +{dayServices.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Week view ---
  const renderWeek = () => {
    const ws = startOfWeek(current, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="w-14" />
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className="py-2 text-center border-l border-slate-100"
              >
                <p className="text-xs text-slate-500 uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <span
                  className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-semibold mx-auto mt-0.5 ${isToday ? "bg-indigo-600 text-white" : "text-slate-700"}`}
                >
                  {format(day, "d")}
                </span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-8">
          <div className="border-r border-slate-100">
            {hours.map((h) => (
              <div
                key={h}
                className="h-14 border-b border-slate-50 flex items-start justify-end pr-2 pt-1"
              >
                <span className="text-xs text-slate-400">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="border-r border-slate-100 relative"
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-14 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer"
                  onClick={() => handleDayClick(day)}
                />
              ))}
              {servicesForDay(day).map((s) => {
                const startH = parseISO(s.startDate).getHours();
                const startM = parseISO(s.startDate).getMinutes();
                const endH = parseISO(s.endDate).getHours();
                const endM = parseISO(s.endDate).getMinutes();
                const top = (startH + startM / 60) * 56;
                const height = Math.max(
                  (endH + endM / 60 - (startH + startM / 60)) * 56,
                  28,
                );
                return (
                  <div
                    key={s.id}
                    className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-white text-xs overflow-hidden cursor-pointer z-10 shadow-sm"
                    style={{ top, height, backgroundColor: serviceColor(s) }}
                    onClick={(e) => handleServiceClick(e, s)}
                  >
                    <p className="font-semibold truncate">
                      {s.deceasedName.split(" ")[0]}
                    </p>
                    <p className="opacity-80 truncate">
                      {SERVICE_LABELS[s.serviceType]}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Day view ---
  const renderDay = () => {
    const dayServices = servicesForDay(current);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return (
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {hours.map((h) => (
            <div key={h} className="flex border-b border-slate-100 h-14">
              <div className="w-16 shrink-0 text-right pr-3 pt-1 text-xs text-slate-400 border-r border-slate-100">
                {String(h).padStart(2, "0")}:00
              </div>
              <div
                className="flex-1 hover:bg-indigo-50 cursor-pointer"
                onClick={() => handleDayClick(current)}
              />
            </div>
          ))}
          {dayServices.map((s) => {
            const startH = parseISO(s.startDate).getHours();
            const startM = parseISO(s.startDate).getMinutes();
            const endH = parseISO(s.endDate).getHours();
            const endM = parseISO(s.endDate).getMinutes();
            const top = (startH + startM / 60) * 56;
            const height = Math.max(
              (endH + endM / 60 - (startH + startM / 60)) * 56,
              36,
            );
            return (
              <div
                key={s.id}
                className="absolute left-20 right-4 rounded-lg px-3 py-1 text-white text-sm cursor-pointer shadow"
                style={{ top, height, backgroundColor: serviceColor(s) }}
                onClick={(e) => handleServiceClick(e, s)}
              >
                <p className="font-semibold">{s.deceasedName}</p>
                <p className="text-xs opacity-80">
                  {SERVICE_LABELS[s.serviceType]} · {s.location}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen p-6 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Calendario de Servicios
          </h1>
          <p className="text-slate-500 text-sm">
            Gestión de servicios funerarios programados
          </p>
        </div>
        <button
          onClick={() => {
            setSelected(null);
            setClickedDate(new Date());
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Nuevo Servicio
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <h2 className="font-semibold text-slate-800 capitalize min-w-52 text-center">
              {getTitle()}
            </h2>
            <button
              onClick={next}
              className="p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
            <button
              onClick={() => setCurrent(new Date())}
              className="ml-2 text-xs px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Hoy
            </button>
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["day", "week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === v ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>

        {view === "month" && renderMonth()}
        {view === "week" && renderWeek()}
        {view === "day" && renderDay()}
      </div>

      {showModal && (
        <ServiceModal
          service={selected}
          defaultDate={clickedDate}
          deceased={deceased}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
