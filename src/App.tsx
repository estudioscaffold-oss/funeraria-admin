import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import DeceasedList from "./pages/DeceasedList";
import DeceasedDetail from "./pages/DeceasedDetail";
import DeceasedForm from "./pages/DeceasedForm";
import Admin from "./pages/Admin";
import Personal from "./pages/Personal";

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "linear-gradient(160deg,#060E1A 0%,#0A1628 50%,#0D1E35 100%)",
      }}
    >
      {/* Logo SVG */}
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

      {/* Loading bar */}
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

function AppRoutes() {
  const { loading } = useApp();
  if (loading) return <LoadingScreen />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/progreso" element={<Progress />} />
          <Route path="/fallecidos" element={<DeceasedList />} />
          <Route path="/fallecidos/nuevo" element={<DeceasedForm />} />
          <Route path="/fallecidos/:id" element={<DeceasedDetail />} />
          <Route path="/fallecidos/:id/editar" element={<DeceasedForm />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
