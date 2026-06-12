import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useCollection } from "../hooks/useCollection";
import type { Vehicle } from "../types";
import { MOCK_VEHICLES } from "./Flota";
import {
  ChevronLeft,
  Edit,
  Trash2,
  AlertTriangle,
  Phone,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Banknote,
  CreditCard,
  CircleDollarSign,
  Check,
  Printer,
  ChevronDown,
  Mail,
  ArrowLeft,
  Download,
  Users,
  Truck,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrdenServicioPDF from "../components/pdf/OrdenServicioPDF";
import { ContractSection } from "../components/deceased/ContractDocument";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_LABELS,
  RELIGIOUS_LABELS,
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_COLORS,
  VENDEDORES,
} from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type {
  Document,
  PaymentRecord,
  BudgetItem,
  DeceasedBudget,
} from "../types";

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    n,
  );

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";

const DOC_TYPES = [
  { value: "defuncion", label: "Certificado de Defunción", required: true },
  { value: "identidad", label: "Documento de Identidad", required: true },
  { value: "autopsia", label: "Informe de Autopsia", required: false },
  { value: "cremacion", label: "Autorización de Cremación", required: false },
  { value: "traslado", label: "Permiso de Traslado", required: false },
  { value: "otro", label: "Otro Documento", required: false },
];

const PROCESS_STEPS = [
  { key: "recepcion", label: "Recepción" },
  { key: "preparacion", label: "Preparación" },
  { key: "velatorio", label: "Velatorio" },
  { key: "traslado", label: "Traslado" },
  { key: "ceremonia", label: "Ceremonia" },
  { key: "inhumacion_cremacion", label: "Inhumación /\nCremación" },
  { key: "completado", label: "Completado" },
];

const PAYMENT_METHODS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  debito: "Débito",
  credito: "Crédito",
  cheque: "Cheque",
};
const PAYMENT_ICONS: Record<string, React.ElementType> = {
  efectivo: Banknote,
  transferencia: CircleDollarSign,
  debito: CreditCard,
  credito: CreditCard,
  cheque: FileText,
};

const TABS = [
  { id: "datos", label: "Datos Personales" },
  { id: "documentos", label: "Certificados y Docs." },
  { id: "progreso", label: "Progreso del Servicio" },
  { id: "equipo", label: "Equipo & Flota" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "pagos", label: "Registro de Pagos" },
];

/* ─── TAB: Datos ──────────────────────────────────── */
function TabDatos({ d }: { d: ReturnType<typeof useApp>["deceased"][0] }) {
  const InfoRow = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-slate-800 text-sm mt-0.5">{value}</p>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      {(d.urgencies || d.restrictions) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-red-800 flex items-center gap-2 text-sm">
            <AlertTriangle size={15} /> Alertas Activas
          </p>
          {d.urgencies && <p className="text-red-700 text-sm">{d.urgencies}</p>}
          {d.restrictions && (
            <p className="text-red-700 text-sm">
              Restricción: {d.restrictions}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2">
            Datos del Fallecimiento
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow
              label="Fecha"
              value={format(new Date(d.deathDate), "d 'de' MMMM yyyy", {
                locale: es,
              })}
            />
            <InfoRow label="Hora" value={d.deathTime} />
            <InfoRow label="Lugar" value={d.deathPlace} />
            <InfoRow label="Causa" value={d.deathCause} />
            <InfoRow
              label="Fecha de nacimiento"
              value={
                d.birthDate
                  ? format(new Date(d.birthDate), "d MMM yyyy", { locale: es })
                  : undefined
              }
            />
            <InfoRow label="Nacionalidad" value={d.nationality} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2">
            Servicio Contratado
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Tipo" value={SERVICE_LABELS[d.serviceType]} />
            <InfoRow label="Personal asignado" value={d.assignedStaff} />
            <InfoRow
              label="Preferencia religiosa"
              value={RELIGIOUS_LABELS[d.religiousPreference]}
            />
            <InfoRow label="Notas religiosas" value={d.religiousNotes} />
          </div>

          {/* Velatorio */}
          {(d.velatorio || d.velatorioAddress) && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Lugar de Velatorio
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Nombre" value={d.velatorio} />
                <InfoRow label="Dirección" value={d.velatorioAddress} />
              </div>
            </div>
          )}

          {/* Cementerio */}
          {(d.cemetery || d.cemeteryAddress) && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Cementerio
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Nombre" value={d.cemetery} />
                <InfoRow label="Dirección" value={d.cemeteryAddress} />
              </div>
            </div>
          )}

          {/* Crematorio */}
          {(d.crematorium || d.crematoriumAddress) && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Crematorio
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Nombre" value={d.crematorium} />
                <InfoRow label="Dirección" value={d.crematoriumAddress} />
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Phone size={13} className="text-indigo-500" /> Contacto Familiar
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Nombre" value={d.familyContact.name} />
            <InfoRow label="Parentesco" value={d.familyContact.relationship} />
            <InfoRow label="RUT" value={d.familyContact.rut} />
            <InfoRow label="Teléfono" value={d.familyContact.phone} />
            <InfoRow label="Correo" value={d.familyContact.email} />
            <InfoRow label="Dirección" value={d.familyContact.address} />
          </div>
        </div>
        {d.sensitiveObservations && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-semibold text-amber-800 text-sm mb-2">
              Observaciones Sensibles
            </h3>
            <p className="text-amber-900 text-sm">{d.sensitiveObservations}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TAB: Documentos ─────────────────────────────── */
function TabDocumentos({ d }: { d: ReturnType<typeof useApp>["deceased"][0] }) {
  const { updateDeceased } = useApp();
  const REQUIRED = ["defuncion", "identidad"];
  const handleAdd = (type: string) => {
    const name = prompt("Nombre del documento:");
    if (!name) return;
    const doc: Document = {
      id: crypto.randomUUID(),
      name,
      type: type as Document["type"],
      url: "#",
      uploadedAt: new Date().toISOString(),
    };
    updateDeceased(d.id, { documents: [...d.documents, doc] });
  };
  const handleRemove = (id: string) =>
    updateDeceased(d.id, { documents: d.documents.filter((x) => x.id !== id) });
  const done = REQUIRED.filter((t) =>
    d.documents.some((x) => x.type === t),
  ).length;
  const pct = Math.round((done / REQUIRED.length) * 100);

  return (
    <div className="space-y-4">
      {/* ── Contrato de servicio ── */}
      <ContractSection record={d} compact />

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-slate-700">
              Documentos obligatorios completados
            </p>
            <span className="text-sm font-bold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pct === 100 ? "bg-emerald-100" : "bg-indigo-100"}`}
        >
          {pct === 100 ? (
            <Check size={18} className="text-emerald-600" />
          ) : (
            <span className="text-xs font-bold text-indigo-600">
              {done}/{REQUIRED.length}
            </span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {DOC_TYPES.map((dt) => {
          const existing = d.documents.filter((x) => x.type === dt.value);
          return (
            <div key={dt.value} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {existing.length > 0 ? (
                    <CheckCircle size={15} className="text-emerald-500" />
                  ) : dt.required ? (
                    <AlertCircle size={15} className="text-red-400" />
                  ) : (
                    <Clock size={15} className="text-slate-300" />
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
                  onClick={() => handleAdd(dt.value)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg font-medium"
                >
                  <Upload size={11} /> Adjuntar
                </button>
              </div>
              {existing.map((doc) => (
                <div
                  key={doc.id}
                  className="ml-5 mt-1 flex items-center justify-between bg-slate-50 rounded px-3 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-700">{doc.name}</span>
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
          );
        })}
      </div>
    </div>
  );
}

/* ─── TAB: Progreso ───────────────────────────────── */
function TabProgreso({ d }: { d: ReturnType<typeof useApp>["deceased"][0] }) {
  const { updateDeceased } = useApp();
  const currentIdx = PROCESS_STEPS.findIndex((s) => s.key === d.status);
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-700 text-sm mb-8">
          Estado actual:{" "}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[d.status]}`}
          >
            {STATUS_LABELS[d.status]}
          </span>
        </h3>
        <div className="relative">
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-indigo-500 transition-all"
            style={{
              width: `${(currentIdx / (PROCESS_STEPS.length - 1)) * 88}%`,
            }}
          />
          <div className="relative flex justify-between">
            {PROCESS_STEPS.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              return (
                <button
                  key={step.key}
                  onClick={() =>
                    updateDeceased(d.id, {
                      status: step.key as typeof d.status,
                    })
                  }
                  className="flex flex-col items-center gap-2 group w-16"
                  title={`Marcar: ${step.label}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all ${done ? "bg-indigo-600 border-indigo-600 text-white" : active ? "bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100" : "bg-white border-slate-200 text-slate-300 group-hover:border-indigo-300"}`}
                  >
                    {done ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight whitespace-pre-line ${active ? "text-indigo-700 font-semibold" : done ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 text-sm mb-3">
          Cambiar estado rápidamente
        </h3>
        <div className="flex flex-wrap gap-2">
          {PROCESS_STEPS.map((step) => (
            <button
              key={step.key}
              onClick={() =>
                updateDeceased(d.id, { status: step.key as typeof d.status })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${d.status === step.key ? `${STATUS_COLORS[step.key]} border-transparent` : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              {step.label.replace("\n", " ")}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 text-sm mb-3">
          Responsable del Caso
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
            {(d.assignedStaff ?? "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {d.assignedStaff ?? "Sin asignar"}
            </p>
            <p className="text-xs text-slate-400">
              Última actualización:{" "}
              {format(new Date(d.updatedAt), "d MMM yyyy, HH:mm", {
                locale: es,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Budget form (create / edit) ─────────────────── */
function BudgetForm({
  deceasedId: _deceasedId,
  initial,
  existingCount,
  onSave,
  onCancel,
}: {
  deceasedId: string;
  initial?: DeceasedBudget;
  existingCount: number;
  onSave: (b: DeceasedBudget) => void;
  onCancel: () => void;
}) {
  const { catalog, convenios, sucursales, inventory } = useApp();
  const isNew = !initial;
  const pad = String(existingCount + 1).padStart(3, "0");
  const year = new Date().getFullYear();

  const [form, setForm] = useState<DeceasedBudget>(
    initial ?? {
      id: crypto.randomUUID(),
      number: `PPTO-${year}-${pad}`,
      title: "",
      sucursal: sucursales.find((s) => s.active)?.name ?? "",
      vendedor: VENDEDORES[0],
      date: new Date().toISOString().split("T")[0],
      items: [],
      discount: 0,
      tax: 0,
      notes: "",
      status: "borrador",
    },
  );

  // per-row state for cascading dropdowns
  const [rowCat, setRowCat] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (initial?.items ?? []).forEach((i) => {
      init[i.id] = i.category;
    });
    return init;
  });

  // convenio + IVA state
  const [convenioId, setConvenioId] = useState("");
  const [taxPct, setTaxPct] = useState(19);

  const selectedConvenio = convenios.find((c) => c.id === convenioId) ?? null;
  const discountPct = selectedConvenio ? selectedConvenio.discountPct : 0;

  const categories = catalog.map((c) => c.name);

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const baseImponible = subtotal - discountAmount;
  const taxAmount = Math.round((baseImponible * taxPct) / 100);
  const total = baseImponible + taxAmount;

  const addRow = () => {
    const id = crypto.randomUUID();
    const firstCat = categories[0];
    setRowCat((p) => ({ ...p, [id]: firstCat }));
    setForm((p) => ({
      ...p,
      items: [
        ...p.items,
        { id, category: firstCat, description: "", quantity: 1, unitPrice: 0 },
      ],
    }));
  };

  const setRowCategory = (id: string, cat: string) => {
    setRowCat((p) => ({ ...p, [id]: cat }));
    setForm((p) => ({
      ...p,
      items: p.items.map((i) =>
        i.id === id
          ? { ...i, category: cat, description: "", unitPrice: 0 }
          : i,
      ),
    }));
  };

  const setRowItem = (id: string, itemName: string) => {
    const cat = rowCat[id];
    const catObj = catalog.find((c) => c.name === cat);
    const found = catObj?.items.find((x) => x.name === itemName);
    setForm((p) => ({
      ...p,
      items: p.items.map((i) =>
        i.id === id
          ? {
              ...i,
              description: itemName,
              unitPrice: found?.price ?? i.unitPrice,
            }
          : i,
      ),
    }));
  };

  const updateRow = (id: string, key: keyof BudgetItem, val: string | number) =>
    setForm((p) => ({
      ...p,
      items: p.items.map((i) => (i.id === id ? { ...i, [key]: val } : i)),
    }));

  const removeRow = (id: string) => {
    setRowCat((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    setForm((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            {isNew ? "Nuevo Presupuesto" : `Editando ${form.number}`}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete los datos del presupuesto
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* meta row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              N° Presupuesto
            </label>
            <input
              className={inputCls + " bg-slate-50 text-slate-500"}
              value={form.number}
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Título *
            </label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Ej: Servicio completo inhumación"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Fecha
            </label>
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Sucursal *
            </label>
            <select
              className={inputCls}
              value={form.sucursal}
              onChange={(e) =>
                setForm((p) => ({ ...p, sucursal: e.target.value }))
              }
            >
              <option value="">Seleccionar sucursal</option>
              {sucursales
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Vendedor *
            </label>
            <select
              className={inputCls}
              value={form.vendedor}
              onChange={(e) =>
                setForm((p) => ({ ...p, vendedor: e.target.value }))
              }
            >
              {VENDEDORES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Estado
            </label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as DeceasedBudget["status"],
                }))
              }
            >
              <option value="borrador">Borrador</option>
              <option value="aprobado">
                ✓ Aprobado — descuenta inventario
              </option>
              <option value="facturado">Facturado</option>
            </select>
          </div>
        </div>

        {/* aviso de descuento de inventario */}
        {(() => {
          // calcular qué ítems del presupuesto tienen match en inventario
          const matchedItems = form.items
            .filter(
              (bi) =>
                bi.description &&
                bi.description !== "__custom__" &&
                bi.quantity > 0,
            )
            .map((bi) => {
              const inv = inventory.find(
                (i) =>
                  i.name.trim().toLowerCase() ===
                  bi.description.trim().toLowerCase(),
              );
              return inv
                ? {
                    name: inv.name,
                    qty: bi.quantity,
                    unit: inv.unit,
                    stockActual: inv.quantity,
                    stockFinal: Math.max(0, inv.quantity - bi.quantity),
                    sinStock: inv.quantity - bi.quantity < 0,
                  }
                : null;
            })
            .filter(Boolean) as {
            name: string;
            qty: number;
            unit: string;
            stockActual: number;
            stockFinal: number;
            sinStock: boolean;
          }[];

          if (matchedItems.length === 0) return null;

          const isAlreadyApproved = initial?.status === "aprobado";
          const willDeduct = form.status === "aprobado" && !isAlreadyApproved;
          const hasWarning = matchedItems.some((i) => i.sinStock);

          return (
            <div
              className="rounded-xl p-4 border text-sm space-y-3"
              style={{
                background: willDeduct
                  ? hasWarning
                    ? "#FFF7ED"
                    : "#F0FDF4"
                  : "#F8FAFC",
                borderColor: willDeduct
                  ? hasWarning
                    ? "#FED7AA"
                    : "#BBF7D0"
                  : "#E2E8F0",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: willDeduct
                      ? hasWarning
                        ? "#C2410C"
                        : "#15803D"
                      : "#64748B",
                  }}
                >
                  {willDeduct
                    ? hasWarning
                      ? "⚠ Aprobación afectará inventario — stock insuficiente en algún ítem"
                      : "✓ Al aprobar se descontará del inventario"
                    : isAlreadyApproved
                      ? "✓ Inventario ya fue descontado al aprobar este presupuesto"
                      : "ℹ El inventario se descontará automáticamente al marcar como Aprobado"}
                </span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500">
                    <th className="text-left pb-1 font-semibold">
                      Ítem en inventario
                    </th>
                    <th className="text-center pb-1 font-semibold">
                      A descontar
                    </th>
                    <th className="text-center pb-1 font-semibold">
                      Stock actual
                    </th>
                    <th className="text-center pb-1 font-semibold">
                      Stock resultante
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matchedItems.map((item) => (
                    <tr key={item.name}>
                      <td className="py-1 font-medium text-slate-700">
                        {item.name}
                      </td>
                      <td className="py-1 text-center text-slate-600">
                        -{item.qty} {item.unit}
                      </td>
                      <td className="py-1 text-center text-slate-600">
                        {item.stockActual} {item.unit}
                      </td>
                      <td
                        className="py-1 text-center font-bold"
                        style={{
                          color: item.sinStock ? "#DC2626" : "#15803D",
                        }}
                      >
                        {item.stockFinal} {item.unit}
                        {item.sinStock && (
                          <span className="ml-1 text-red-500">⚠</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matchedItems.length <
                form.items.filter(
                  (i) => i.description && i.description !== "__custom__",
                ).length && (
                <p className="text-xs text-slate-400">
                  * Los ítems sin coincidencia en inventario no se descuentan.
                </p>
              )}
            </div>
          );
        })()}

        {/* items table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Ítems del presupuesto
            </p>
            <button
              onClick={addRow}
              disabled={catalog.length === 0}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={12} /> Agregar ítem
            </button>
          </div>

          {catalog.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-3 flex items-start gap-2.5">
              <AlertTriangle
                size={15}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  No hay categorías ni servicios configurados
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Ve a{" "}
                  <span className="font-semibold">
                    Administrador → Servicios
                  </span>{" "}
                  para agregar categorías e ítems. Una vez creados, aparecerán
                  aquí automáticamente.
                </p>
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-500 text-xs w-44">
                    Categoría
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold text-slate-500 text-xs">
                    Ítem / Descripción
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-slate-500 text-xs w-20">
                    Cant.
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 text-xs w-36">
                    Precio Unit.
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-slate-500 text-xs w-32">
                    Total
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {form.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-300 text-sm"
                    >
                      Haz clic en "Agregar ítem" para comenzar
                    </td>
                  </tr>
                )}
                {form.items.map((item) => {
                  const cat = rowCat[item.id] ?? categories[0];
                  const catItems =
                    catalog.find((c) => c.name === cat)?.items ?? [];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      {/* category dropdown */}
                      <td className="px-2 py-2">
                        <div className="relative">
                          <select
                            className="w-full border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none bg-white text-slate-700"
                            value={cat}
                            onChange={(e) =>
                              setRowCategory(item.id, e.target.value)
                            }
                          >
                            {categories.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                      </td>
                      {/* item dropdown or free text */}
                      <td className="px-2 py-2">
                        <div className="relative">
                          <select
                            className="w-full border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none bg-white text-slate-700"
                            value={item.description}
                            onChange={(e) =>
                              setRowItem(item.id, e.target.value)
                            }
                          >
                            <option value="">— Seleccionar ítem —</option>
                            {catItems.map((ci) => (
                              <option key={ci.name} value={ci.name}>
                                {ci.name} ({fmt(ci.price)})
                              </option>
                            ))}
                            <option value="__custom__">
                              ✏️ Descripción personalizada…
                            </option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                        {/* free text if custom */}
                        {item.description === "__custom__" ||
                        (!catItems.find((x) => x.name === item.description) &&
                          item.description !== "") ? (
                          <input
                            className="mt-1 w-full border border-indigo-200 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={
                              item.description === "__custom__"
                                ? ""
                                : item.description
                            }
                            onChange={(e) =>
                              updateRow(item.id, "description", e.target.value)
                            }
                            placeholder="Descripción del ítem…"
                          />
                        ) : null}
                      </td>
                      {/* qty */}
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={item.quantity}
                          onChange={(e) =>
                            updateRow(item.id, "quantity", +e.target.value)
                          }
                        />
                      </td>
                      {/* unit price */}
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateRow(item.id, "unitPrice", +e.target.value)
                          }
                        />
                      </td>
                      {/* total */}
                      <td className="px-3 py-2 text-right font-semibold text-slate-700 text-sm">
                        {fmt(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => removeRow(item.id)}
                          className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* convenio + totals + notes */}
        <div className="flex gap-6 items-start">
          {/* left: notes */}
          <div className="flex-1 space-y-4">
            {/* convenio selector */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Convenio aplicado
              </label>
              <select
                className={inputCls}
                value={convenioId}
                onChange={(e) => setConvenioId(e.target.value)}
              >
                <option value="">— Sin convenio —</option>
                {convenios
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.entity} ({c.discountPct}% dto.)
                    </option>
                  ))}
              </select>
              {selectedConvenio && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  ✓ Descuento del {selectedConvenio.discountPct}% aplicado (
                  {selectedConvenio.entity})
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Notas / Condiciones
              </label>
              <textarea
                rows={3}
                className={inputCls + " resize-none"}
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Condiciones de pago, observaciones…"
              />
            </div>
          </div>

          {/* right: totals */}
          <div className="w-72 shrink-0">
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              {/* subtotal */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
                <span className="text-sm text-slate-500">Subtotal neto</span>
                <span className="text-sm font-medium text-slate-700 tabular-nums">
                  {fmt(subtotal)}
                </span>
              </div>

              {/* descuento */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Descuento</span>
                  {discountPct > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {discountPct}%
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium tabular-nums ${discountAmount > 0 ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {discountAmount > 0 ? `−${fmt(discountAmount)}` : fmt(0)}
                </span>
              </div>

              {/* base imponible */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 bg-white">
                <span className="text-sm font-semibold text-slate-700">
                  Base imponible
                </span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  {fmt(baseImponible)}
                </span>
              </div>

              {/* IVA */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">IVA</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-14 text-center border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                      value={taxPct}
                      onChange={(e) => setTaxPct(Math.max(0, +e.target.value))}
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600 tabular-nums">
                  +{fmt(taxAmount)}
                </span>
              </div>

              {/* total */}
              <div className="flex justify-between items-center px-4 py-4 bg-white">
                <span className="text-base font-bold text-slate-800">
                  Total con IVA
                </span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: "#4F46E5" }}
                >
                  {fmt(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() =>
            onSave({
              ...form,
              discount: discountAmount,
              tax: taxAmount,
              items: form.items.map((i) => ({
                ...i,
                category: rowCat[i.id] ?? i.category,
              })),
            })
          }
          className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          {isNew ? "Crear Presupuesto" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}

/* ─── TAB: Presupuesto ────────────────────────────── */
function TabPresupuesto({
  d,
}: {
  d: ReturnType<typeof useApp>["deceased"][0];
}) {
  const {
    addBudget,
    updateBudget,
    deleteBudget,
    stockWarnings,
    clearStockWarnings,
  } = useApp();

  // null = lista, "new" = crear, DeceasedBudget = editar
  const [editing, setEditing] = useState<DeceasedBudget | "new" | null>(null);

  const budgets = d.budgets;

  const totalOf = (b: DeceasedBudget) =>
    b.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) -
    b.discount +
    b.tax;

  const abonosOf = (b: DeceasedBudget) =>
    d.payments
      .filter((p) => p.budgetId === b.id)
      .reduce((s, p) => s + p.amount, 0);

  const handleSave = (b: DeceasedBudget) => {
    if (editing === "new") addBudget(d.id, b);
    else updateBudget(d.id, b);
    setEditing(null);
  };

  const handleDelete = (b: DeceasedBudget) => {
    if (confirm(`¿Eliminar ${b.number}?`)) deleteBudget(d.id, b.id);
  };

  const handleEmail = (b: DeceasedBudget) => {
    const subject = encodeURIComponent(
      `Presupuesto ${b.number} — ${d.fullName}`,
    );
    const body = encodeURIComponent(
      `Estimado/a,\n\nAdjuntamos el presupuesto ${b.number}: "${b.title}"\nTotal: ${fmt(totalOf(b))}\n\nQuedamos a su disposición.`,
    );
    window.open(
      `mailto:${d.familyContact.email}?subject=${subject}&body=${body}`,
    );
  };

  /* ── vista formulario ── */
  if (editing !== null) {
    return (
      <div className="space-y-4">
        {/* breadcrumb */}
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Volver a lista de presupuestos
        </button>

        <BudgetForm
          deceasedId={d.id}
          initial={editing === "new" ? undefined : editing}
          existingCount={budgets.length}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  /* ── vista lista ── */
  return (
    <div className="space-y-4">
      {/* C3 — aviso de items sin coincidencia en inventario */}
      {stockWarnings.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 text-base mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Stock no descontado — items sin coincidencia en inventario
            </p>
            <ul className="mt-1 space-y-0.5">
              {stockWarnings.map((name) => (
                <li key={name} className="text-xs text-amber-700">
                  · {name}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-1">
              Verifica que el nombre coincida exactamente con el ítem en
              inventario.
            </p>
          </div>
          <button
            onClick={clearStockWarnings}
            className="text-amber-400 hover:text-amber-600 text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {budgets.length} presupuesto{budgets.length !== 1 ? "s" : ""}{" "}
          registrado{budgets.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={15} /> Nuevo Presupuesto
        </button>
      </div>

      {/* tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">
                N° Ppto.
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Sucursal
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Vendedor
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Título
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Fecha
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">
                Total Servicio
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">
                Total Abonos
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">
                Saldo Pend.
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Estado
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide min-w-[180px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {budgets.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={36} className="text-slate-200" />
                    <p className="text-slate-400">
                      Sin presupuestos registrados
                    </p>
                    <button
                      onClick={() => setEditing("new")}
                      className="flex items-center gap-1.5 text-indigo-600 text-sm hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={14} /> Crear el primero
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {budgets.map((b) => {
              const total = totalOf(b);
              const abonos = abonosOf(b);
              const saldo = total - abonos;
              return (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-bold whitespace-nowrap">
                    {b.number}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                    {b.sucursal}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                    {b.vendedor}
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium">
                    {b.title || (
                      <span className="text-slate-300 italic text-xs">
                        Sin título
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {format(new Date(b.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                    {fmt(total)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                    {fmt(abonos)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold whitespace-nowrap ${saldo > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {fmt(saldo)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${BUDGET_STATUS_COLORS[b.status]}`}
                    >
                      {BUDGET_STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  {/* ── 3 botones con etiqueta ── */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEmail(b)}
                        title="Enviar por correo"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap"
                      >
                        <Mail size={12} /> Correo
                      </button>
                      <button
                        onClick={() => window.print()}
                        title="Imprimir"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition-all whitespace-nowrap"
                      >
                        <Printer size={12} /> Imprimir
                      </button>
                      <button
                        onClick={() => setEditing(b)}
                        title="Editar presupuesto"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap"
                      >
                        <Edit size={12} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        title="Eliminar"
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── TAB: Pagos ──────────────────────────────────── */
function TabPagos({ d }: { d: ReturnType<typeof useApp>["deceased"][0] }) {
  const { addPayment, deletePayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<PaymentRecord>>({
    budgetId: d.budgets[0]?.id ?? "",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    method: "transferencia",
    reference: "",
    notes: "",
    receivedBy: "",
  });

  const totalBudgets = d.budgets.reduce(
    (s, b) =>
      s +
      b.items.reduce((ss, i) => ss + i.quantity * i.unitPrice, 0) -
      b.discount +
      b.tax,
    0,
  );
  const totalPaid = d.payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalBudgets - totalPaid;
  const paidPct =
    totalBudgets > 0
      ? Math.min(100, Math.round((totalPaid / totalBudgets) * 100))
      : 0;

  const handleAdd = () => {
    if (!form.amount || form.amount <= 0) return;
    addPayment(d.id, {
      ...form,
      id: crypto.randomUUID(),
      date: form.date ?? new Date().toISOString(),
    } as PaymentRecord);
    setForm({
      budgetId: d.budgets[0]?.id ?? "",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      method: "transferencia",
      reference: "",
      notes: "",
      receivedBy: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Presupuestado",
            value: totalBudgets,
            cls: "text-slate-700",
          },
          { label: "Total Pagado", value: totalPaid, cls: "text-emerald-600" },
          {
            label: "Saldo Pendiente",
            value: balance,
            cls: balance > 0 ? "text-red-600" : "text-emerald-600",
          },
        ].map(({ label, value, cls }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${cls}`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {totalBudgets > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-slate-700">
              Progreso de pago
            </p>
            <span
              className={`text-sm font-bold ${paidPct >= 100 ? "text-emerald-600" : "text-indigo-600"}`}
            >
              {paidPct}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${paidPct >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700 text-sm">
            Pagos Registrados{" "}
            <span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full ml-1">
              {d.payments.length}
            </span>
          </h3>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={13} /> Registrar Pago
          </button>
        </div>

        {showForm && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-3">
              Nuevo Pago
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {d.budgets.length > 0 && (
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Presupuesto asociado
                  </label>
                  <select
                    className={inputCls}
                    value={form.budgetId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, budgetId: e.target.value }))
                    }
                  >
                    <option value="">Sin asociar</option>
                    {d.budgets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.number} – {b.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: +e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Método
                </label>
                <select
                  className={inputCls}
                  value={form.method}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      method: e.target.value as PaymentRecord["method"],
                    }))
                  }
                >
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  N° Referencia
                </label>
                <input
                  className={inputCls}
                  value={form.reference}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reference: e.target.value }))
                  }
                  placeholder="Comprobante, transferencia…"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Recibido por
                </label>
                <input
                  className={inputCls}
                  value={form.receivedBy}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, receivedBy: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Notas
                </label>
                <input
                  className={inputCls}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Abono, cuota…"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Guardar Pago
              </button>
            </div>
          </div>
        )}

        {d.payments.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">
            Sin pagos registrados
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {[...d.payments].reverse().map((p) => {
              const Icon = PAYMENT_ICONS[p.method] ?? Banknote;
              const budget = d.budgets.find((b) => b.id === p.budgetId);
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        {fmt(p.amount)}
                      </p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {PAYMENT_METHODS[p.method]}
                      </span>
                      {p.reference && (
                        <span className="text-xs text-slate-400">
                          Ref: {p.reference}
                        </span>
                      )}
                      {budget && (
                        <span className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {budget.number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(p.date), "d 'de' MMM yyyy", {
                        locale: es,
                      })}
                      {p.receivedBy && ` · ${p.receivedBy}`}
                      {p.notes && ` · ${p.notes}`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      confirm("¿Eliminar este pago?") &&
                      deletePayment(d.id, p.id)
                    }
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Shared assignment collection ─────────────────── */
interface DeceasedAssignment {
  deceasedId: string;
  technicalIds: string[];
  vehicleIds: string[];
}

export function useDeceasedAssignment(deceasedId: string) {
  const [all, setAll, synced] = useCollection<DeceasedAssignment>(
    "veladesk-asignaciones",
    [],
  );
  const mine = all.find((a) => a.deceasedId === deceasedId) ?? {
    deceasedId,
    technicalIds: [],
    vehicleIds: [],
  };

  /* usa el updater funcional de setAll para evitar race conditions
     entre escrituras concurrentes del mismo caso */
  const setMine = (patch: Partial<Omit<DeceasedAssignment, "deceasedId">>) => {
    setAll((prev) => {
      const current = prev.find((a) => a.deceasedId === deceasedId) ?? {
        deceasedId,
        technicalIds: [],
        vehicleIds: [],
      };
      const updated = { ...current, ...patch };
      const exists = prev.some((a) => a.deceasedId === deceasedId);
      return exists
        ? prev.map((a) => (a.deceasedId === deceasedId ? updated : a))
        : [...prev, updated];
    });
  };

  return { assignment: mine, setMine, synced };
}

/* ─── TAB: Equipo & Flota ─────────────────────────── */
function TabEquipo({ d }: { d: ReturnType<typeof useApp>["deceased"][0] }) {
  const { users } = useApp();
  const [vehicles] = useCollection<Vehicle>("veladesk-flota", MOCK_VEHICLES);
  const { assignment, setMine, synced } = useDeceasedAssignment(d.id);

  const tecnicos = users.filter((u) => u.role === "equipo_tecnico" && u.active);
  const assigned = assignment.technicalIds;
  const assignedVeh = assignment.vehicleIds;

  /* M1 — mientras llegan datos de Supabase mostrar skeleton */
  if (!synced) {
    return (
      <div className="space-y-4 max-w-2xl animate-pulse">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-slate-50 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const toggleTecnico = (uid: string) => {
    setMine({
      technicalIds: assigned.includes(uid)
        ? assigned.filter((x) => x !== uid)
        : [...assigned, uid],
    });
  };

  const toggleVehicle = (vid: string) => {
    setMine({
      vehicleIds: assignedVeh.includes(vid)
        ? assignedVeh.filter((x) => x !== vid)
        : [...assignedVeh, vid],
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Personal técnico */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5"
          style={{
            background:
              "linear-gradient(90deg,rgba(201,169,110,0.06) 0%,transparent 100%)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(201,169,110,0.12)" }}
          >
            <Users size={14} style={{ color: "#A07840" }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "#0A1628" }}>
              Personal Técnico Asignado
            </h3>
            <p className="text-xs text-slate-400">
              {assigned.length} técnico{assigned.length !== 1 ? "s" : ""}{" "}
              asignado{assigned.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="p-5">
          {tecnicos.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No hay personal técnico activo. Agrégalos en Administrador →
              Usuarios.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {tecnicos.map((u) => {
                const checked = assigned.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTecnico(u.id)}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {u.sucursal || "Sin sucursal"}
                      </p>
                    </div>
                    {checked && (
                      <Check size={14} className="text-emerald-600 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Flota */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5"
          style={{
            background:
              "linear-gradient(90deg,rgba(201,169,110,0.06) 0%,transparent 100%)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(201,169,110,0.12)" }}
          >
            <Truck size={14} style={{ color: "#A07840" }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "#0A1628" }}>
              Vehículos Asignados
            </h3>
            <p className="text-xs text-slate-400">
              {assignedVeh.length} vehículo{assignedVeh.length !== 1 ? "s" : ""}{" "}
              asignado{assignedVeh.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="p-5">
          {vehicles.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No hay vehículos registrados. Agrégalos en Gestión de Flota.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {vehicles
                .filter((v) => v.status === "activo")
                .map((v) => {
                  const checked = assignedVeh.includes(v.id);
                  return (
                    <label
                      key={v.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        checked
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVehicle(v.id)}
                        className="accent-indigo-600 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-slate-400">
                          {v.plate} · {v.type.replace(/_/g, " ")}
                        </p>
                      </div>
                      {checked && (
                        <Check size={14} className="text-indigo-600 shrink-0" />
                      )}
                    </label>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────── */
export default function DeceasedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deceased, deleteDeceased, users } = useApp();
  const [vehicles] = useCollection<Vehicle>("veladesk-flota", MOCK_VEHICLES);
  const [activeTab, setActiveTab] = useState("datos");
  // Assignment hook — must be called before any conditional return
  const { assignment } = useDeceasedAssignment(id ?? "");

  const d = deceased.find((x) => x.id === id);
  if (!d)
    return (
      <div className="p-6">
        <p className="text-slate-500">Registro no encontrado.</p>
        <button
          onClick={() => navigate("/fallecidos")}
          className="text-indigo-600 text-sm mt-2 hover:underline"
        >
          Volver
        </button>
      </div>
    );

  const handleDelete = () => {
    if (confirm(`¿Eliminar la ficha de ${d.fullName}?`)) {
      deleteDeceased(d.id);
      navigate("/fallecidos");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* sticky header */}
      <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/fallecidos")}
              className="p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800">
                  {d.fullName}
                </h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[d.status]}`}
                >
                  {STATUS_LABELS[d.status]}
                </span>
                {d.urgencies && (
                  <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                    <AlertTriangle size={12} /> Urgencia
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                RUT {d.rut} ·{" "}
                {format(new Date(d.createdAt), "d 'de' MMM yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PDFDownloadLink
              document={
                <OrdenServicioPDF
                  record={d}
                  teamStaff={
                    assignment.technicalIds
                      .map((uid) => users.find((u) => u.id === uid)?.fullName)
                      .filter(Boolean) as string[]
                  }
                  teamVehicles={
                    assignment.vehicleIds
                      .map((vid) => {
                        const v = vehicles.find((x) => x.id === vid);
                        return v ? `${v.brand} ${v.model} · ${v.plate}` : null;
                      })
                      .filter(Boolean) as string[]
                  }
                />
              }
              fileName={`orden-servicio-${d.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: "linear-gradient(135deg,#D4AF70,#A07840)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Download size={14} /> Generando…
                  </>
                ) : (
                  <>
                    <Download size={14} /> Orden de Servicio PDF
                  </>
                )
              }
            </PDFDownloadLink>
            <button
              onClick={() => navigate(`/fallecidos/${d.id}/editar`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Edit size={14} /> Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "datos" && <TabDatos d={d} />}
        {activeTab === "documentos" && <TabDocumentos d={d} />}
        {activeTab === "progreso" && <TabProgreso d={d} />}
        {activeTab === "equipo" && <TabEquipo d={d} />}
        {activeTab === "presupuesto" && <TabPresupuesto d={d} />}
        {activeTab === "pagos" && <TabPagos d={d} />}
      </div>
    </div>
  );
}
