import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Plus, Search, AlertTriangle, FileText } from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_LABELS,
} from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DeceasedList() {
  const { deceased } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = deceased.filter((d) => {
    const matchSearch =
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.rut.includes(search) ||
      d.familyContact.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? d.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Fichas de Fallecidos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {deceased.length} registros totales
          </p>
        </div>
        <button
          onClick={() => navigate("/fallecidos/nuevo")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Nueva Ficha
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o familiar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-600"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Fallecido
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                RUT
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Fallecimiento
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Servicio
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Estado
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Familiar
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No se encontraron registros
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/fallecidos/${d.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      {d.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{d.fullName}</p>
                      {d.urgencies && (
                        <p className="text-red-500 text-xs flex items-center gap-0.5">
                          <AlertTriangle size={10} /> Urgencia
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{d.rut}</td>
                <td className="px-4 py-3 text-slate-500">
                  {format(new Date(d.deathDate), "d MMM yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {SERVICE_LABELS[d.serviceType]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[d.status]}`}
                  >
                    {STATUS_LABELS[d.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {d.familyContact.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <FileText size={14} />
                    <span className="text-xs">{d.documents.length}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
