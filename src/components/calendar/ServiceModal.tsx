import { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { useApp } from "../../context/AppContext";
import type { FuneralService, DeceasedRecord } from "../../types";
import { SERVICE_LABELS } from "../../utils/mockData";

interface Props {
  service: FuneralService | null;
  defaultDate: Date | null;
  deceased: DeceasedRecord[];
  onClose: () => void;
}

const emptyForm = (date: Date | null): Partial<FuneralService> => ({
  deceasedId: "",
  deceasedName: "",
  serviceType: "velatorio",
  startDate: date ? format(date, "yyyy-MM-dd'T'09:00") : "",
  endDate: date ? format(date, "yyyy-MM-dd'T'11:00") : "",
  location: "",
  notes: "",
  status: "programado",
});

export default function ServiceModal({
  service,
  defaultDate,
  deceased,
  onClose,
}: Props) {
  const { addService, updateService, deleteService } = useApp();
  const [form, setForm] = useState<Partial<FuneralService>>(
    service ?? emptyForm(defaultDate),
  );
  const isNew = !service;

  const set = (key: keyof FuneralService, value: string) => {
    if (key === "deceasedId") {
      const d = deceased.find((d) => d.id === value);
      setForm((f) => ({
        ...f,
        deceasedId: value,
        deceasedName: d?.fullName ?? "",
      }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  };

  const handleSave = () => {
    if (!form.deceasedId || !form.startDate || !form.endDate || !form.location)
      return;
    if (isNew) {
      addService({ ...form, id: crypto.randomUUID() } as FuneralService);
    } else {
      updateService(service!.id, form);
    }
    onClose();
  };

  const handleDelete = () => {
    if (service && confirm("¿Eliminar este servicio?")) {
      deleteService(service.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {isNew ? "Nuevo Servicio" : "Editar Servicio"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Fallecido *
            </label>
            <select
              value={form.deceasedId}
              onChange={(e) => set("deceasedId", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Seleccionar fallecido...</option>
              {deceased.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Tipo de Servicio *
            </label>
            <select
              value={form.serviceType}
              onChange={(e) => set("serviceType", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Inicio *
              </label>
              <input
                type="datetime-local"
                value={form.startDate?.slice(0, 16)}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Término *
              </label>
              <input
                type="datetime-local"
                value={form.endDate?.slice(0, 16)}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Lugar *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Sala, cementerio, crematorio..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="programado">Programado</option>
              <option value="en_curso">En curso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Notas
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {!isNew ? (
            <button
              onClick={handleDelete}
              className="text-red-500 text-sm hover:underline"
            >
              Eliminar
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isNew ? "Crear" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
