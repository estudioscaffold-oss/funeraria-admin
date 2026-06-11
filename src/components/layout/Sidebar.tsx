import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  ChevronRight,
  Truck,
  DollarSign,
  UserCheck,
  Lock,
  Package,
  ContactRound,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", mock: false },
  { to: "/progreso", icon: Activity, label: "Progreso", mock: false },
  { to: "/clientes", icon: ContactRound, label: "Ficha Clientes", mock: true },
  {
    to: "/fallecidos",
    icon: Users,
    label: "Fichas de Fallecidos",
    mock: false,
  },
  { to: "/flota", icon: Truck, label: "Gestión de Flota", mock: false },
  {
    to: "/finanzas",
    icon: DollarSign,
    label: "Gestión Financiera",
    mock: false,
  },
  { to: "/inventario", icon: Package, label: "Inventario", mock: false },
  { to: "/personal", icon: UserCheck, label: "Personal", mock: false },
  { to: "/admin", icon: Settings, label: "Administrador", mock: false },
];

function VelodeskLogo() {
  return (
    <svg
      viewBox="0 0 220 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        <linearGradient id="vGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8D5B0" />
          <stop offset="45%" stopColor="#D4AF70" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="vGoldD" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2E8CB" />
          <stop offset="100%" stopColor="#C9A96E" />
        </linearGradient>
        <filter id="vGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M6 6 L24 52 L32 34 L20 6 Z"
        fill="url(#vGold)"
        filter="url(#vGlow)"
      />
      <path
        d="M44 6 L26 52 L32 34 L46 6 Z"
        fill="url(#vGold)"
        filter="url(#vGlow)"
      />
      <rect
        x="27"
        y="1"
        width="10"
        height="10"
        rx="1.5"
        transform="rotate(45 32 6)"
        fill="url(#vGoldD)"
        filter="url(#vGlow)"
      />
      <text
        x="60"
        y="36"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="24"
        fontWeight="400"
        letterSpacing="0.5"
        fill="#F0EDE8"
      >
        Veladesk
      </text>
      <text
        x="60"
        y="52"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="6.5"
        fontWeight="600"
        letterSpacing="2.2"
        fill="#C9A96E"
      >
        EL CETRO DE CONTROL
      </text>
    </svg>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Lee el logo y nombre guardados en localStorage desde Admin > Perfil
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem("veladesk-profile");
        if (raw) {
          const p = JSON.parse(raw);
          setCompanyLogo(p.logo ?? "");
          setCompanyName(p.name ?? "");
        }
      } catch {
        /* noop */
      }
    };
    refresh();
    window.addEventListener("storage", refresh);
    // polling ligero para detectar cambios en la misma pestaña
    const t = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", refresh);
      clearInterval(t);
    };
  }, []);

  return (
    <aside
      className="w-64 flex flex-col h-full border-r"
      style={{
        background:
          "linear-gradient(180deg, var(--brand-dark) 0%, var(--brand) 50%, var(--brand-mid) 100%)",
        borderColor: "rgba(201,169,110,0.15)",
      }}
    >
      {/* Logo empresa (si está configurado) o logo Veladesk */}
      <div className="px-5 pt-6 pb-5">
        {companyLogo ? (
          <div
            className="rounded-xl px-4 py-3 flex flex-col items-center gap-2"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            }}
          >
            <img
              src={companyLogo}
              alt={companyName || "Logo empresa"}
              className="max-h-14 max-w-full object-contain"
            />
            {companyName && (
              <p
                className="text-xs text-center font-semibold tracking-wide truncate w-full"
                style={{ color: "#0A1628" }}
              >
                {companyName}
              </p>
            )}
          </div>
        ) : (
          <div className="px-1">
            <VelodeskLogo />
          </div>
        )}
        <div
          className="mt-6 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(201,169,110,0.4),transparent)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {NAV.map(({ to, icon: Icon, label, mock }) => {
          const isActive =
            !mock &&
            (to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to));

          /* ── Mock / Próximamente ── */
          if (mock) {
            return (
              <div
                key={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-not-allowed select-none group"
                style={{ opacity: 0.45 }}
                title="Próximamente"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(201,169,110,0.2)",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.5}
                    style={{ color: "#8FA3B8" }}
                  />
                </div>
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: "#8FA3B8" }}
                >
                  {label}
                </span>
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: "rgba(201,169,110,0.08)",
                    color: "#C9A96E",
                    border: "1px solid rgba(201,169,110,0.2)",
                  }}
                >
                  <Lock size={9} /> Pronto
                </span>
              </div>
            );
          }

          /* ── Active nav item ── */
          return (
            <NavLink
              key={to}
              to={to}
              className="nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium group rounded-xl"
              style={
                isActive
                  ? {
                      background: "rgba(201,169,110,0.12)",
                      borderLeft: "3px solid #C9A96E",
                    }
                  : { borderLeft: "3px solid transparent" }
              }
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive ? "shadow-gold-sm" : ""}`}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg,#D4AF70,#A07840)"
                    : "rgba(255,255,255,0.07)",
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? "#060E1A" : undefined }}
                  className={
                    isActive ? "" : "text-cream-500 group-hover:text-gold-400"
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className="flex-1 transition-colors duration-200"
                style={{ color: isActive ? "#D4AF70" : "#8FA3B8" }}
              >
                {label}
              </span>
              <ChevronRight
                size={13}
                style={{ color: "#C9A96E" }}
                className={`transition-all duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pb-5">
        <div
          className="h-px mb-4"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)",
          }}
        />
        {/* Si hay logo empresa, mostrar Veladesk pequeño aquí */}
        {companyLogo && (
          <div className="mb-3 opacity-40 hover:opacity-70 transition-opacity">
            <VelodeskLogo />
          </div>
        )}
        <div className="flex items-center gap-2 px-2">
          <div
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }}
          />
          <span className="text-xs" style={{ color: "rgba(143,163,184,0.7)" }}>
            Sistema activo
          </span>
        </div>
        <p
          className="text-xs mt-1 px-2"
          style={{ color: "rgba(143,163,184,0.3)" }}
        >
          v1.0.0 · 2026
        </p>
      </div>
    </aside>
  );
}
