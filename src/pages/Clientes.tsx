import { useState, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  Edit,
  Trash2,
  Check,
  X,
  Banknote,
  CreditCard,
  CircleDollarSign,
  FileText,
  UserPlus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCollection } from "../hooks/useCollection";
import { createAuthUser } from "../lib/auth";
import type {
  PreNeedClient,
  PreNeedPayment,
  BudgetItem,
  ServiceType,
} from "../types";
import { SERVICE_LABELS } from "../utils/mockData";

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    n,
  );

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";

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

const SERVICE_TYPES: ServiceType[] = [
  "inhumacion",
  "cremacion",
  "traslado",
  "velatorio",
  "servicio_completo",
  "otro",
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ─── SignaturePad ─────────────────────────────────── */
function SignaturePad({
  onSave,
  onCancel,
}: {
  onSave: (data: string, name: string, rut: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerRut, setSignerRut] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0A1628";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    if (
      !canvasRef.current ||
      isEmpty ||
      !signerName.trim() ||
      !signerRut.trim()
    )
      return;
    onSave(canvasRef.current.toDataURL(), signerName.trim(), signerRut.trim());
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nombre del firmante
          </label>
          <input
            className={inputCls}
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            RUT del firmante
          </label>
          <input
            className={inputCls}
            value={signerRut}
            onChange={(e) => setSignerRut(e.target.value)}
            placeholder="12.345.678-9"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-slate-600">Firma</label>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Limpiar
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 touch-none"
          style={{ cursor: "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {isEmpty && (
          <p className="text-xs text-center text-slate-400 mt-1">
            Dibuje su firma aquí
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty || !signerName.trim() || !signerRut.trim()}
          className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#0A1628,#1a2d4a)" }}
        >
          <Check size={14} className="inline mr-1" />
          Firmar Contrato
        </button>
      </div>
    </div>
  );
}

/* ─── BudgetSection ────────────────────────────────── */
function BudgetSection({
  items,
  status,
  onChange,
}: {
  items: BudgetItem[];
  status: "pendiente" | "aprobado";
  onChange: (items: BudgetItem[], status: "pendiente" | "aprobado") => void;
}) {
  const { catalog } = useApp();
  const [form, setForm] = useState<Partial<BudgetItem>>({
    category: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });
  const [catFilter, setCatFilter] = useState("");

  const catItems = catFilter
    ? (catalog.find((c) => c.id === catFilter)?.items ?? [])
    : [];

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const add = () => {
    if (!form.description || !form.unitPrice) return;
    onChange(
      [
        ...items,
        {
          id: uid(),
          category: form.category ?? "",
          description: form.description ?? "",
          quantity: form.quantity ?? 1,
          unitPrice: form.unitPrice ?? 0,
        },
      ],
      status,
    );
    setForm({ category: "", description: "", quantity: 1, unitPrice: 0 });
    setCatFilter("");
  };

  const remove = (id: string) =>
    onChange(
      items.filter((i) => i.id !== id),
      status,
    );

  return (
    <div className="space-y-4">
      {/* Add item form */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Agregar ítem
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Categoría
            </label>
            <select
              className={inputCls}
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                setForm((f) => ({
                  ...f,
                  category: e.target.value,
                  description: "",
                }));
              }}
            >
              <option value="">— Sin categoría —</option>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Descripción
            </label>
            {catItems.length > 0 ? (
              <select
                className={inputCls}
                value={form.description ?? ""}
                onChange={(e) => {
                  const item = catItems.find((i) => i.name === e.target.value);
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                    unitPrice: item?.price ?? f.unitPrice,
                  }));
                }}
              >
                <option value="">— Seleccionar —</option>
                {catItems.map((i) => (
                  <option key={i.id} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputCls}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Descripción del ítem"
              />
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.quantity ?? 1}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Precio unit. (CLP)
            </label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.unitPrice ?? 0}
              onChange={(e) =>
                setForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))
              }
            />
          </div>
        </div>
        <button
          type="button"
          onClick={add}
          className="text-sm px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: "linear-gradient(135deg,#0A1628,#1a2d4a)" }}
        >
          <Plus size={13} className="inline mr-1" />
          Agregar ítem
        </button>
      </div>

      {/* Items table */}
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                  Descripción
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Cant.
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  P. Unit.
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                  Total
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {fmt(item.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {fmt(item.quantity * item.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right text-sm">
                  Total
                </td>
                <td className="px-3 py-2 text-right text-sm text-indigo-700">
                  {fmt(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Approve */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onChange(items, status === "aprobado" ? "pendiente" : "aprobado")
          }
          className={`px-4 py-2 text-sm rounded-lg font-medium border transition-all ${
            status === "aprobado"
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {status === "aprobado" ? (
            <>
              <Check size={13} className="inline mr-1" />
              Presupuesto aprobado
            </>
          ) : (
            "Marcar como aprobado"
          )}
        </button>
        <span className="text-xs text-slate-400">
          {status === "pendiente" ? "Pendiente de aprobación" : ""}
        </span>
      </div>
    </div>
  );
}

/* ─── PaymentsSection ──────────────────────────────── */
function PaymentsSection({
  payments,
  budgetTotal,
  onChange,
}: {
  payments: PreNeedPayment[];
  budgetTotal: number;
  onChange: (payments: PreNeedPayment[]) => void;
}) {
  const [form, setForm] = useState<Partial<PreNeedPayment>>({
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    method: "transferencia",
    notes: "",
  });

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = budgetTotal - totalPaid;

  const add = () => {
    if (!form.amount || form.amount <= 0) return;
    onChange([
      ...payments,
      {
        id: uid(),
        date: form.date ?? new Date().toISOString().split("T")[0],
        amount: form.amount ?? 0,
        method: (form.method as PreNeedPayment["method"]) ?? "transferencia",
        notes: form.notes ?? "",
      },
    ]);
    setForm({
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      method: "transferencia",
      notes: "",
    });
  };

  const remove = (id: string) => onChange(payments.filter((p) => p.id !== id));

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total presupuesto",
            value: budgetTotal,
            color: "text-slate-700",
          },
          {
            label: "Total pagado",
            value: totalPaid,
            color: "text-emerald-600",
          },
          {
            label: "Saldo pendiente",
            value: balance,
            color: balance > 0 ? "text-amber-600" : "text-emerald-600",
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-base font-bold ${s.color}`}>{fmt(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Registrar abono
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha</label>
            <input
              type="date"
              className={inputCls}
              value={form.date ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Monto (CLP)
            </label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.amount ?? 0}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Método</label>
            <select
              className={inputCls}
              value={form.method ?? "transferencia"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  method: e.target.value as PreNeedPayment["method"],
                }))
              }
            >
              {Object.entries(PAYMENT_METHODS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Notas</label>
            <input
              className={inputCls}
              value={form.notes ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Referencia, comprobante…"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={add}
          className="text-sm px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: "linear-gradient(135deg,#0A1628,#1a2d4a)" }}
        >
          <Plus size={13} className="inline mr-1" />
          Registrar abono
        </button>
      </div>

      {/* Payment list */}
      {payments.length > 0 && (
        <div className="space-y-2">
          {payments
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((p) => {
              const Icon = PAYMENT_ICONS[p.method] ?? Banknote;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {fmt(p.amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {PAYMENT_METHODS[p.method]} · {p.date}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* ─── ClientForm ───────────────────────────────────── */
function ClientForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: PreNeedClient | null;
  onSave: (c: PreNeedClient) => void;
  onCancel: () => void;
}) {
  const { convenios } = useApp();
  const [tab, setTab] = useState<
    "datos" | "presupuesto" | "pagos" | "contrato"
  >("datos");
  const [form, setForm] = useState<Partial<PreNeedClient>>(
    initial ?? {
      fullName: "",
      rut: "",
      phone: "",
      serviceType: "servicio_completo",
      budgetItems: [],
      budgetStatus: "pendiente",
      payments: [],
      status: "activo",
    },
  );
  const [showSigPad, setShowSigPad] = useState(false);

  const set = (k: keyof PreNeedClient, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const budgetTotal = (form.budgetItems ?? []).reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );
  const totalPaid = (form.payments ?? []).reduce((s, p) => s + p.amount, 0);

  const handleSave = () => {
    if (!form.fullName || !form.rut || !form.phone) return;
    const now = new Date().toISOString();
    onSave({
      id: initial?.id ?? uid(),
      fullName: form.fullName!,
      rut: form.rut!,
      birthDate: form.birthDate,
      phone: form.phone!,
      email: form.email,
      address: form.address,
      city: form.city,
      serviceType: form.serviceType ?? "servicio_completo",
      convenioId: form.convenioId,
      notes: form.notes,
      budgetItems: form.budgetItems ?? [],
      budgetStatus: form.budgetStatus ?? "pendiente",
      payments: form.payments ?? [],
      contractSignature: form.contractSignature,
      status: form.status ?? "activo",
      deceasedId: form.deceasedId,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const FORM_TABS = [
    { id: "datos", label: "Datos" },
    {
      id: "presupuesto",
      label: `Presupuesto${budgetTotal > 0 ? ` · ${fmt(budgetTotal)}` : ""}`,
    },
    {
      id: "pagos",
      label: `Pagos${totalPaid > 0 ? ` · ${fmt(totalPaid)}` : ""}`,
    },
    {
      id: "contrato",
      label: form.contractSignature ? "✓ Contrato firmado" : "Contrato",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-semibold text-slate-800">
            {initial
              ? `Editar · ${initial.fullName}`
              : "Nuevo Cliente Pre-Contratado"}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
            color: "#0A1628",
          }}
        >
          Guardar
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex gap-1 overflow-x-auto">
        {FORM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-5">
        {/* ── Tab: Datos ── */}
        {tab === "datos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nombre completo *
                </label>
                <input
                  className={inputCls}
                  value={form.fullName ?? ""}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Juan Pérez González"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  RUT *
                </label>
                <input
                  className={inputCls}
                  value={form.rut ?? ""}
                  onChange={(e) => set("rut", e.target.value)}
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.birthDate ?? ""}
                  onChange={(e) => set("birthDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Teléfono *
                </label>
                <input
                  className={inputCls}
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="correo@ejemplo.cl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Dirección
                </label>
                <input
                  className={inputCls}
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Av. Principal 123"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Ciudad
                </label>
                <input
                  className={inputCls}
                  value={form.city ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Santiago"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tipo de servicio
                </label>
                <select
                  className={inputCls}
                  value={form.serviceType ?? "servicio_completo"}
                  onChange={(e) =>
                    set("serviceType", e.target.value as ServiceType)
                  }
                >
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SERVICE_LABELS[t] ?? t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Convenio
                </label>
                <select
                  className={inputCls}
                  value={form.convenioId ?? ""}
                  onChange={(e) =>
                    set("convenioId", e.target.value || undefined)
                  }
                >
                  <option value="">— Sin convenio —</option>
                  {convenios
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Notas / Instrucciones especiales
                </label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Voluntades, preferencias, observaciones…"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Presupuesto ── */}
        {tab === "presupuesto" && (
          <BudgetSection
            items={form.budgetItems ?? []}
            status={form.budgetStatus ?? "pendiente"}
            onChange={(items, status) => {
              set("budgetItems", items);
              set("budgetStatus", status);
            }}
          />
        )}

        {/* ── Tab: Pagos ── */}
        {tab === "pagos" && (
          <PaymentsSection
            payments={form.payments ?? []}
            budgetTotal={budgetTotal}
            onChange={(payments) => set("payments", payments)}
          />
        )}

        {/* ── Tab: Contrato ── */}
        {tab === "contrato" && (
          <div className="space-y-4">
            {form.contractSignature ? (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.3)",
                  }}
                >
                  <Check size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Contrato firmado
                    </p>
                    <p className="text-xs text-emerald-600">
                      {form.contractSignature.signerName} ·{" "}
                      {form.contractSignature.signerRut} ·{" "}
                      {new Date(
                        form.contractSignature.signedAt,
                      ).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <img
                    src={form.contractSignature.signatureData}
                    alt="Firma"
                    className="w-full max-h-32 object-contain bg-slate-50 p-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => set("contractSignature", undefined)}
                  className="text-sm text-slate-400 hover:text-red-400"
                >
                  <X size={13} className="inline mr-1" />
                  Borrar firma
                </button>
              </div>
            ) : showSigPad ? (
              <SignaturePad
                onSave={(signatureData, signerName, signerRut) => {
                  set("contractSignature", {
                    signerName,
                    signerRut,
                    signatureData,
                    signedAt: new Date().toISOString(),
                  });
                  setShowSigPad(false);
                }}
                onCancel={() => setShowSigPad(false)}
              />
            ) : (
              <div className="text-center py-10 space-y-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "rgba(201,169,110,0.1)" }}
                >
                  <FileText size={28} style={{ color: "#C9A96E" }} />
                </div>
                <p className="text-sm text-slate-500">
                  El contrato aún no ha sido firmado
                </p>
                <button
                  type="button"
                  onClick={() => setShowSigPad(true)}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg,#0A1628,#1a2d4a)",
                  }}
                >
                  Firmar ahora
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ConvertModal ─────────────────────────────────── */
function ConvertModal({
  client,
  onClose,
  onConverted,
}: {
  client: PreNeedClient;
  onClose: () => void;
  onConverted: (deceasedId: string) => void;
}) {
  const { addDeceased, addUser, convenios } = useApp();
  const [deathDate, setDeathDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [deathTime, setDeathTime] = useState("00:00");
  const [deathPlace, setDeathPlace] = useState("");
  const [createFamily, setCreateFamily] = useState(false);
  const [familyEmail, setFamilyEmail] = useState(client.email ?? "");
  const [familyPassword, setFamilyPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convenio = convenios.find((c) => c.id === client.convenioId);

  const handleConvert = async () => {
    if (!deathDate || !deathPlace.trim()) {
      setError("Fecha y lugar de fallecimiento son requeridos");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const deceasedId = uid();

      // Build budget from client's pre-need budget
      const budgets =
        client.budgetItems.length > 0
          ? [
              {
                id: uid(),
                number: `PN-${client.id.slice(-6).toUpperCase()}`,
                title: "Presupuesto pre-contratado",
                sucursal: "",
                vendedor: "",
                date: now.split("T")[0],
                items: client.budgetItems,
                discount: convenio ? convenio.discountPct : 0,
                tax: 19,
                status:
                  client.budgetStatus === "aprobado"
                    ? ("aprobado" as const)
                    : ("borrador" as const),
              },
            ]
          : [];

      // Map payments
      const payments = client.payments.map((p) => ({
        id: p.id,
        date: p.date,
        amount: p.amount,
        method: p.method,
        notes: p.notes,
      }));

      const deceased = {
        id: deceasedId,
        fullName: client.fullName,
        rut: client.rut,
        birthDate: client.birthDate ?? "",
        nationality: "",
        address: client.address,
        deathDate,
        deathTime,
        deathPlace,
        familyContact: {
          name: client.fullName,
          rut: client.rut,
          relationship: "titular",
          phone: client.phone,
          email: client.email ?? "",
          address: client.address ?? "",
        },
        serviceType: client.serviceType,
        status: "recepcion" as const,
        religiousPreference: "ninguna" as const,
        documents: [],
        budgets,
        payments,
        tasks: [],
        contractSignature: client.contractSignature,
        createdAt: now,
        updatedAt: now,
      };

      addDeceased(deceased);

      // Create family user if requested
      if (createFamily && familyEmail && familyPassword) {
        const { userId, error: authErr } = await createAuthUser(
          familyEmail,
          familyPassword,
        );
        if (authErr) throw new Error(authErr);
        addUser({
          id: userId ?? uid(),
          fullName: client.fullName,
          email: familyEmail,
          phone: client.phone,
          role: "familia",
          sucursal: "",
          active: true,
          deceasedId,
          createdAt: now,
        });
      }

      onConverted(deceasedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Registrar Fallecimiento
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Se creará una ficha de fallecido para{" "}
          <strong>{client.fullName}</strong> con todos los datos, presupuesto,
          pagos y contrato del cliente pre-contratado.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Fecha fallecimiento *
              </label>
              <input
                type="date"
                className={inputCls}
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Hora
              </label>
              <input
                type="time"
                className={inputCls}
                value={deathTime}
                onChange={(e) => setDeathTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Lugar de fallecimiento *
            </label>
            <input
              className={inputCls}
              value={deathPlace}
              onChange={(e) => setDeathPlace(e.target.value)}
              placeholder="Hospital, domicilio…"
            />
          </div>

          {/* Family user */}
          <div
            className="rounded-xl p-3 space-y-3"
            style={{
              background: "rgba(201,169,110,0.05)",
              border: "1px solid rgba(201,169,110,0.2)",
            }}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createFamily}
                onChange={(e) => setCreateFamily(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                <UserPlus size={13} className="inline mr-1" />
                Crear usuario familia
              </span>
            </label>
            {createFamily && (
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="email"
                  className={inputCls}
                  value={familyEmail}
                  onChange={(e) => setFamilyEmail(e.target.value)}
                  placeholder="Email para el portal familia"
                />
                <input
                  type="password"
                  className={inputCls}
                  value={familyPassword}
                  onChange={(e) => setFamilyPassword(e.target.value)}
                  placeholder="Contraseña temporal"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConvert}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-xl font-semibold text-white disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
              color: "#0A1628",
            }}
          >
            {saving ? "Procesando…" : "Convertir a Fallecido"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ClientCard ───────────────────────────────────── */
function ClientCard({
  client,
  onEdit,
  onDelete,
  onConvert,
}: {
  client: PreNeedClient;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}) {
  const budgetTotal = client.budgetItems.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );
  const totalPaid = client.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">
            {client.fullName}
          </p>
          <p className="text-xs text-slate-400">{client.rut}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
            client.status === "activo"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {client.status === "activo" ? "Activo" : "Convertido"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
        <span>
          <span className="font-medium">Servicio:</span>{" "}
          {SERVICE_LABELS[client.serviceType] ?? client.serviceType}
        </span>
        <span>
          <span className="font-medium">Presupuesto:</span>{" "}
          {budgetTotal > 0 ? fmt(budgetTotal) : "—"}
        </span>
        <span>
          <span className="font-medium">Pagado:</span>{" "}
          {totalPaid > 0 ? fmt(totalPaid) : "—"}
        </span>
        <span>
          <span className="font-medium">Contrato:</span>{" "}
          {client.contractSignature ? (
            <span className="text-emerald-600">Firmado</span>
          ) : (
            <span className="text-amber-500">Pendiente</span>
          )}
        </span>
      </div>

      {client.phone && <p className="text-xs text-slate-400">{client.phone}</p>}

      <div className="flex gap-2 pt-1">
        {client.status === "activo" && (
          <>
            <button
              onClick={onEdit}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <Edit size={12} className="inline mr-1" />
              Editar
            </button>
            <button
              onClick={onConvert}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
                color: "#0A1628",
              }}
            >
              Registrar fallecimiento
            </button>
          </>
        )}
        {client.status === "convertido" && client.deceasedId && (
          <span className="text-xs text-slate-400 flex-1 py-1.5 text-center">
            Ficha #{client.deceasedId.slice(-6).toUpperCase()}
          </span>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Historial tab ────────────────────────────────── */
function TabHistorial() {
  const { deceased } = useApp();
  const completed = deceased.filter((d) => d.status === "completado");

  if (completed.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">No hay servicios completados aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Fallecido
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              RUT
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Servicio
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Fallecimiento
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
              Total pres.
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
              Total pagado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {completed.map((d) => {
            const budgetTotal = d.budgets.reduce(
              (s, b) =>
                s + b.items.reduce((bs, i) => bs + i.quantity * i.unitPrice, 0),
              0,
            );
            const totalPaid = d.payments.reduce((s, p) => s + p.amount, 0);
            return (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {d.fullName}
                </td>
                <td className="px-4 py-3 text-slate-500">{d.rut}</td>
                <td className="px-4 py-3 text-slate-500">
                  {SERVICE_LABELS[d.serviceType] ?? d.serviceType}
                </td>
                <td className="px-4 py-3 text-slate-500">{d.deathDate}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {fmt(budgetTotal)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                  {fmt(totalPaid)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────── */
export default function Clientes() {
  const [clients, setClients, synced] = useCollection<PreNeedClient>(
    "veladesk-clientes",
    [],
  );
  const [mainTab, setMainTab] = useState<"preneed" | "historial">("preneed");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PreNeedClient | "new" | null>(null);
  const [converting, setConverting] = useState<PreNeedClient | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.rut.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = useCallback(
    (client: PreNeedClient) => {
      setClients(
        clients.some((c) => c.id === client.id)
          ? clients.map((c) => (c.id === client.id ? client : c))
          : [...clients, client],
      );
      setEditing(null);
    },
    [clients, setClients],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer."))
        return;
      setClients(clients.filter((c) => c.id !== id));
    },
    [clients, setClients],
  );

  const handleConverted = useCallback(
    (client: PreNeedClient, deceasedId: string) => {
      setClients(
        clients.map((c) =>
          c.id === client.id
            ? {
                ...c,
                status: "convertido",
                deceasedId,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      setConverting(null);
    },
    [clients, setClients],
  );

  // Show form
  if (editing !== null) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <ClientForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {converting && (
        <ConvertModal
          client={converting}
          onClose={() => setConverting(null)}
          onConverted={(deceasedId) => handleConverted(converting, deceasedId)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ficha de Clientes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pre-contratados y historial de servicios completados
          </p>
        </div>
        {mainTab === "preneed" && (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
              color: "#0A1628",
            }}
          >
            <Plus size={16} />
            Nuevo cliente
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          {
            id: "preneed",
            label: `Pre-contratados (${clients.filter((c) => c.status === "activo").length})`,
          },
          { id: "historial", label: "Historial de servicios" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id as typeof mainTab)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              mainTab === t.id
                ? "border-indigo-500 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === "preneed" && (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              placeholder="Buscar por nombre o RUT…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!synced && (
            <p className="text-xs text-slate-400 animate-pulse">
              Sincronizando…
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(201,169,110,0.1)" }}
              >
                <FileText size={28} style={{ color: "#C9A96E" }} />
              </div>
              <p className="text-slate-500 text-sm">
                {search
                  ? "No se encontraron clientes con ese criterio"
                  : "No hay clientes pre-contratados aún"}
              </p>
              {!search && (
                <button
                  onClick={() => setEditing("new")}
                  className="px-5 py-2 text-sm rounded-xl font-medium text-white"
                  style={{
                    background: "linear-gradient(135deg,#0A1628,#1a2d4a)",
                  }}
                >
                  Agregar primer cliente
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={() => setEditing(client)}
                  onDelete={() => handleDelete(client.id)}
                  onConvert={() => setConverting(client)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {mainTab === "historial" && <TabHistorial />}
    </div>
  );
}
