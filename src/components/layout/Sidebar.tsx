import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/progreso", icon: ClipboardList, label: "Progreso" },
  { to: "/fallecidos", icon: Users, label: "Fichas de Fallecidos" },
  { to: "/admin", icon: Settings, label: "Administrador" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Funeraria</p>
            <p className="text-slate-400 text-xs">Admin System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight
                  size={14}
                  className={`transition-opacity ${isActive ? "opacity-70" : "opacity-0 group-hover:opacity-40"}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">v1.0.0 · 2026</p>
      </div>
    </aside>
  );
}
