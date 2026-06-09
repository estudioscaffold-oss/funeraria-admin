import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import DeceasedList from "./pages/DeceasedList";
import DeceasedDetail from "./pages/DeceasedDetail";
import DeceasedForm from "./pages/DeceasedForm";
import Admin from "./pages/Admin";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl animate-pulse">
        F
      </div>
      <p className="text-slate-400 text-sm">Cargando sistema...</p>
      <div className="w-40 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>
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
