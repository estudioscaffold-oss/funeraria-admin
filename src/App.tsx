import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import { loadTheme } from "./lib/theme";

loadTheme();
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import DeceasedList from "./pages/DeceasedList";
import DeceasedDetail from "./pages/DeceasedDetail";
import DeceasedForm from "./pages/DeceasedForm";
import Admin from "./pages/Admin";
import Clientes from "./pages/Clientes";
import Finanzas from "./pages/Finanzas";
import Flota from "./pages/Flota";
import Inventario from "./pages/Inventario";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import FamiliaPortal from "./pages/FamiliaPortal";
import TecnicoPortal from "./pages/TecnicoPortal";
import { getAllowedRoutes, type NavRoute } from "./lib/permissions";
import { Navigate } from "react-router-dom";

/* ── Pantalla de carga ───────────────────────────── */
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "linear-gradient(160deg,#060E1A 0%,#0A1628 50%,#0D1E35 100%)",
      }}
    >
      <div className="animate-fade-in">
        <svg
          viewBox="0 0 220 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-56 h-auto"
        >
          <defs>
            <linearGradient id="lgGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8D5B0" />
              <stop offset="45%" stopColor="#D4AF70" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <linearGradient id="lgDiamond" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2E8CB" />
              <stop offset="100%" stopColor="#C9A96E" />
            </linearGradient>
            <filter id="lgGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M6 6 L24 54 L32 36 L20 6 Z"
            fill="url(#lgGold)"
            filter="url(#lgGlow)"
          />
          <path
            d="M44 6 L26 54 L32 36 L46 6 Z"
            fill="url(#lgGold)"
            filter="url(#lgGlow)"
          />
          <rect
            x="27"
            y="1"
            width="10"
            height="10"
            rx="1.5"
            transform="rotate(45 32 6)"
            fill="url(#lgDiamond)"
            filter="url(#lgGlow)"
          />
          <text
            x="60"
            y="38"
            fontFamily="Georgia,serif"
            fontSize="26"
            fontWeight="400"
            letterSpacing="0.5"
            fill="#F0EDE8"
          >
            Veladesk
          </text>
          <text
            x="60"
            y="55"
            fontFamily="Inter,Arial,sans-serif"
            fontSize="7"
            fontWeight="600"
            letterSpacing="2.5"
            fill="#C9A96E"
          >
            EL CETRO DE CONTROL
          </text>
        </svg>
      </div>
      <div
        className="w-48 h-0.5 rounded-full overflow-hidden"
        style={{ background: "rgba(201,169,110,0.1)" }}
      >
        <div
          className="h-full rounded-full animate-[loading_1.4s_ease-in-out_infinite]"
          style={{
            background:
              "linear-gradient(90deg,#A07840,#D4AF70,#F2E8CB,#D4AF70,#A07840)",
          }}
        />
      </div>
      <p
        className="text-xs tracking-widest uppercase animate-pulse"
        style={{ color: "rgba(201,169,110,0.5)" }}
      >
        Cargando sistema…
      </p>
    </div>
  );
}

/* ── Guard + rutas ───────────────────────────────── */
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* públicas */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login isFirstTime={false} />} />

        {/* protegidas */}
        <Route path="*" element={<PrivateRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ── Rutas privadas (requieren sesión) ──────────── */
function PrivateRoutes() {
  const { loading: appLoading } = useApp();
  const { session, loading: authLoading, authUser } = useAuth();

  if (authLoading || appLoading) return <LoadingScreen />;

  // Sin sesión → login (con link a /registro)
  if (!session) return <Navigate to="/login" replace />;

  // Rol familia → portal independiente
  if (authUser?.role === "familia") return <FamiliaPortal />;

  // Rol equipo_tecnico → portal móvil
  if (authUser?.role === "equipo_tecnico") return <TecnicoPortal />;

  // Sesión sin perfil → aún no completó el registro (RPC pendiente)
  if (!authUser) return <NoPerfil onLogout={() => supabase.auth.signOut()} />;

  const allowed = new Set<string>(getAllowedRoutes(authUser.role));
  const allow = (route: NavRoute, el: React.ReactElement) =>
    allowed.has(route) ? el : <Navigate to="/" replace />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/progreso" element={allow("/progreso", <Progress />)} />
        <Route
          path="/fallecidos"
          element={allow("/fallecidos", <DeceasedList />)}
        />
        <Route
          path="/fallecidos/nuevo"
          element={allow("/fallecidos", <DeceasedForm />)}
        />
        <Route
          path="/fallecidos/:id"
          element={allow("/fallecidos", <DeceasedDetail />)}
        />
        <Route
          path="/fallecidos/:id/editar"
          element={allow("/fallecidos", <DeceasedForm />)}
        />
        <Route path="/clientes" element={allow("/clientes", <Clientes />)} />
        <Route path="/finanzas" element={allow("/finanzas", <Finanzas />)} />
        <Route path="/flota" element={allow("/flota", <Flota />)} />
        <Route
          path="/inventario"
          element={allow("/inventario", <Inventario />)}
        />
        <Route path="/admin" element={allow("/admin", <Admin />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

/* ── Sin perfil / cuenta eliminada ──────────────── */
function NoPerfil({ onLogout }: { onLogout: () => void }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#0D1E35 100%)",
      }}
    >
      <div className="text-center max-w-xs space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "rgba(201,169,110,0.1)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8"
            fill="none"
            stroke="#C9A96E"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-lg">
            Acceso no autorizado
          </p>
          <p className="text-white/40 text-sm mt-2">
            Esta cuenta no tiene un perfil activo en el sistema. Puede que haya
            sido eliminada o que no haya sido configurada aún.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
            color: "#0A1628",
          }}
        >
          Cerrar sesión e intentar con otra cuenta
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  );
}
