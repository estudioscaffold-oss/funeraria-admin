import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, FileText, ChevronDown } from "lucide-react";
import type { Quote, QuoteItem } from "../types";
import { defaultQuoteItems } from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

const STATUS_BADGE: Record<string, string> = {
  borrador: "bg-slate-100 text-slate-600",
  enviada: "bg-blue-100 text-blue-700",
  aceptada: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    n,
  );

function QuoteForm({
  onSave,
  onCancel,
}: {
  onSave: (q: Quote) => void;
  onCancel: () => void;
}) {
  const { deceased } = useApp();
  const [form, setForm] = useState<Partial<Quote>>({
    deceasedId: "",
    deceasedName: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    items: [],
    discount: 0,
    tax: 0,
    notes: "",
    status: "borrador",
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });
  const [catalog, setCatalog] = useState(false);

  const items: QuoteItem[] = form.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal - (form.discount ?? 0) + (form.tax ?? 0);

  const setF = (k: keyof Quote, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setDeceasedId = (id: string) => {
    const d = deceased.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      deceasedId: id,
      deceasedName: d?.fullName ?? "",
      clientName: d?.familyContact.name ?? f.clientName,
      clientPhone: d?.familyContact.phone ?? f.clientPhone,
      clientEmail: d?.familyContact.email ?? f.clientEmail,
    }));
  };

  const addItem = (desc?: string, price?: number) => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      description: desc ?? "",
      quantity: 1,
      unitPrice: price ?? 0,
    };
    setF("items", [...items, newItem]);
    setCatalog(false);
  };

  const updateItem = (id: string, key: keyof QuoteItem, val: string | number) =>
    setF(
      "items",
      items.map((i) => (i.id === id ? { ...i, [key]: val } : i)),
    );

  const removeItem = (id: string) =>
    setF(
      "items",
      items.filter((i) => i.id !== id),
    );

  const handleSave = () => {
    if (!form.clientName || items.length === 0) return;
    onSave({
      ...form,
      id: crypto.randomUUID(),
      subtotal,
      total,
      createdAt: new Date().toISOString(),
    } as Quote);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Nueva Cotización</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Client info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Caso asociado (opcional)
            </label>
            <select
              className={inputClass}
              value={form.deceasedId}
              onChange={(e) => setDeceasedId(e.target.value)}
            >
              <option value="">Sin asociar a caso</option>
              {deceased.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Cliente / Familiar *
            </label>
            <input
              className={inputClass}
              value={form.clientName}
              onChange={(e) => setF("clientName", e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Teléfono
            </label>
            <input
              className={inputClass}
              value={form.clientPhone}
              onChange={(e) => setF("clientPhone", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Correo
            </label>
            <input
              type="email"
              className={inputClass}
              value={form.clientEmail}
              onChange={(e) => setF("clientEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Válida hasta
            </label>
            <input
              type="date"
              className={inputClass}
              value={form.validUntil}
              onChange={(e) => setF("validUntil", e.target.value)}
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600">
              Ítems *
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setCatalog((p) => !p)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 font-medium"
                >
                  Catálogo <ChevronDown size={12} />
                </button>
                {catalog && (
                  <div className="absolute right-0 top-8 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-auto max-h-60">
                    {defaultQuoteItems.map((ci) => (
                      <button
                        key={ci.description}
                        onClick={() => addItem(ci.description, ci.unitPrice)}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex items-center justify-between"
                      >
                        <span className="text-slate-700">{ci.description}</span>
                        <span className="text-slate-400 text-xs">
                          {fmt(ci.unitPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => addItem()}
                className="flex items-center gap-1 text-xs text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200"
              >
                <Plus size={12} /> Personalizado
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600 text-xs">
                    Descripción
                  </th>
                  <th className="text-center px-3 py-2 font-medium text-slate-600 text-xs w-20">
                    Cant.
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600 text-xs w-36">
                    Precio Unit.
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600 text-xs w-32">
                    Total
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-5 text-center text-slate-300 text-xs"
                    >
                      Agrega ítems desde el catálogo o de forma manual
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-1.5">
                      <input
                        className="w-full px-2 py-1 text-sm border border-transparent focus:border-indigo-300 rounded focus:outline-none"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Descripción..."
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={1}
                        className="w-full px-2 py-1 text-sm text-center border border-transparent focus:border-indigo-300 rounded focus:outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", +e.target.value)
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        className="w-full px-2 py-1 text-sm text-right border border-transparent focus:border-indigo-300 rounded focus:outline-none"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", +e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right text-slate-700 font-medium text-sm">
                      {fmt(item.quantity * item.unitPrice)}
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-300 hover:text-red-400 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Descuento</span>
              <input
                type="number"
                min={0}
                className="w-32 text-right border border-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                value={form.discount}
                onChange={(e) => setF("discount", +e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>IVA / Impuestos</span>
              <input
                type="number"
                min={0}
                className="w-32 text-right border border-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                value={form.tax}
                onChange={(e) => setF("tax", +e.target.value)}
              />
            </div>
            <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-2">
              <span>Total</span>
              <span className="text-indigo-700">{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            Notas / Condiciones
          </label>
          <textarea
            rows={2}
            className={inputClass + " resize-none"}
            value={form.notes}
            onChange={(e) => setF("notes", e.target.value)}
            placeholder="Condiciones de pago, validez, etc."
          />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FileText size={14} /> Guardar Cotización
        </button>
      </div>
    </div>
  );
}

export default function Quoter() {
  const { quotes, addQuote, updateQuote, deleteQuote } = useApp();
  const [showForm, setShowForm] = useState(false);

  const handleSave = (q: Quote) => {
    addQuote(q);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cotizador</h1>
          <p className="text-slate-500 text-sm mt-1">
            {quotes.length} cotizaciones registradas
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Nueva Cotización
          </button>
        )}
      </div>

      {showForm && (
        <QuoteForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Quotes list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Cliente
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Caso
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Fecha
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Válida hasta
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">
                Total
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">
                Estado
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Sin cotizaciones
                </td>
              </tr>
            )}
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{q.clientName}</p>
                  <p className="text-slate-400 text-xs">{q.clientPhone}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {q.deceasedName || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {format(new Date(q.createdAt), "d MMM yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {format(new Date(q.validUntil), "d MMM yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {fmt(q.total)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={q.status}
                    onChange={(e) =>
                      updateQuote(q.id, {
                        status: e.target.value as Quote["status"],
                      })
                    }
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 ${STATUS_BADGE[q.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar cotización?")) deleteQuote(q.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
