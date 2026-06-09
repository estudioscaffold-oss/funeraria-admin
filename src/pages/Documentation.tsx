import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Document } from "../types";

const DOC_TYPES = [
  { value: "defuncion", label: "Certificado de Defunción", required: true },
  { value: "identidad", label: "Documento de Identidad", required: true },
  { value: "autopsia", label: "Informe de Autopsia", required: false },
  { value: "cremacion", label: "Autorización de Cremación", required: false },
  { value: "traslado", label: "Permiso de Traslado", required: false },
  { value: "otro", label: "Otro Documento", required: false },
];

const REQUIRED_DOC_TYPES = ["defuncion", "identidad"];

export default function Documentation() {
  const { deceased, updateDeceased } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>(deceased[0]?.id ?? "");

  const current = deceased.find((d) => d.id === selected);

  const filtered = deceased.filter(
    (d) =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.rut.includes(search),
  );

  const completeness = (docs: Document[]) => {
    const found = REQUIRED_DOC_TYPES.filter((t) =>
      docs.some((d) => d.type === t),
    ).length;
    return Math.round((found / REQUIRED_DOC_TYPES.length) * 100);
  };

  const handleAddDoc = (type: string) => {
    if (!current) return;
    const name = prompt("Nombre del documento:");
    if (!name) return;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      name,
      type: type as Document["type"],
      url: "#",
      uploadedAt: new Date().toISOString(),
      notes: "",
    };
    updateDeceased(current.id, { documents: [...current.documents, newDoc] });
  };

  const handleRemove = (docId: string) => {
    if (!current) return;
    updateDeceased(current.id, {
      documents: current.documents.filter((d) => d.id !== docId),
    });
  };

  return (
    <div className="p-6 space-y-5 h-screen flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Gestión de Documentación
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Control de documentos por caso
        </p>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: case list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar caso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-auto divide-y divide-slate-50">
            {filtered.length === 0 && (
              <p className="p-4 text-slate-400 text-sm text-center">
                Sin resultados
              </p>
            )}
            {filtered.map((d) => {
              const pct = completeness(d.documents);
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors ${selected === d.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""}`}
                >
                  <p className="font-medium text-slate-800 text-sm truncate">
                    {d.fullName}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{d.rut}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: document panel */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-auto">
          {!current ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center flex-1">
              <p className="text-slate-400">Selecciona un caso de la lista</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    {current.fullName}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    RUT {current.rut} ·{" "}
                    {format(new Date(current.deathDate), "d MMM yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/fallecidos/${current.id}`)}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} /> Ver ficha
                </button>
              </div>

              {/* Required documents checklist */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700 text-sm">
                    Documentos Requeridos
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {DOC_TYPES.map((dt) => {
                    const existing = current.documents.filter(
                      (d) => d.type === dt.value,
                    );
                    const hasDoc = existing.length > 0;
                    return (
                      <div key={dt.value} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {hasDoc ? (
                              <CheckCircle
                                size={15}
                                className="text-emerald-500 shrink-0"
                              />
                            ) : dt.required ? (
                              <AlertCircle
                                size={15}
                                className="text-red-400 shrink-0"
                              />
                            ) : (
                              <Clock
                                size={15}
                                className="text-slate-300 shrink-0"
                              />
                            )}
                            <span className="text-sm font-medium text-slate-700">
                              {dt.label}
                            </span>
                            {dt.required && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                                Requerido
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddDoc(dt.value)}
                            className="text-xs text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1"
                          >
                            <Upload size={11} /> Adjuntar
                          </button>
                        </div>
                        {existing.length > 0 && (
                          <div className="ml-5 space-y-1 mt-1">
                            {existing.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between bg-slate-50 rounded px-3 py-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText
                                    size={12}
                                    className="text-slate-400"
                                  />
                                  <span className="text-xs text-slate-700">
                                    {doc.name}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    ·{" "}
                                    {format(new Date(doc.uploadedAt), "d MMM", {
                                      locale: es,
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={doc.url}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                  <button
                                    onClick={() => handleRemove(doc.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-800">
                      {current.documents.length} documento
                      {current.documents.length !== 1 ? "s" : ""} adjunto
                      {current.documents.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                      {
                        REQUIRED_DOC_TYPES.filter((t) =>
                          current.documents.some((d) => d.type === t),
                        ).length
                      }{" "}
                      de {REQUIRED_DOC_TYPES.length} requeridos completados
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {completeness(current.documents)}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
