import { useState, useMemo } from "react";
import type { InventoryItem, InventoryCategory } from "../types";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  TrendingDown,
} from "lucide-react";

/* ─── Config ─────────────────────────────────── */
const CATEGORY_CFG: Record<
  InventoryCategory,
  { label: string; color: string; bg: string }
> = {
  ataudes_urnas: {
    label: "Ataúdes y Urnas",
    color: "#A07840",
    bg: "rgba(201,169,110,0.1)",
  },
  preparacion: {
    label: "Preparación",
    color: "#6D28D9",
    bg: "rgba(139,92,246,0.1)",
  },
  velatorio: {
    label: "Velatorio",
    color: "#0369A1",
    bg: "rgba(14,165,233,0.1)",
  },
  traslado: { label: "Traslado", color: "#0F766E", bg: "rgba(20,184,166,0.1)" },
  ceremonia: {
    label: "Ceremonia",
    color: "#B45309",
    bg: "rgba(245,158,11,0.1)",
  },
  documentacion: {
    label: "Documentación",
    color: "#1D4ED8",
    bg: "rgba(59,130,246,0.1)",
  },
  limpieza: { label: "Limpieza", color: "#047857", bg: "rgba(16,185,129,0.1)" },
  oficina: { label: "Oficina", color: "#374151", bg: "rgba(107,114,128,0.1)" },
  otro: { label: "Otro", color: "#64748B", bg: "rgba(100,116,139,0.1)" },
};

const UNITS = [
  "unidad",
  "caja",
  "kg",
  "litros",
  "metros",
  "pares",
  "set",
  "rollo",
  "bolsa",
  "frasco",
];

const fmt$ = (n: number) =>
  `$${n.toLocaleString("es-CL", { minimumFractionDigits: 0 })}`;

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm input-veladesk";
const labelCls =
  "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

/* ─── Mock data ──────────────────────────────── */
const MOCK_ITEMS: InventoryItem[] = [
  {
    id: "inv1",
    name: "Ataúd madera MDF estándar",
    category: "ataudes_urnas",
    sku: "AT-001",
    quantity: 8,
    unit: "unidad",
    unitPrice: 180000,
    minStock: 3,
    location: "Bodega A - Estante 1",
    supplier: "Maderas del Sur",
    description: "Tapizado interior blanco, herrajes dorados",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "inv2",
    name: "Ataúd madera pino",
    category: "ataudes_urnas",
    sku: "AT-002",
    quantity: 4,
    unit: "unidad",
    unitPrice: 280000,
    minStock: 2,
    location: "Bodega A - Estante 2",
    supplier: "Maderas del Sur",
    description: "Barniz natural, herrajes plateados",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "inv3",
    name: "Urna cremación estándar",
    category: "ataudes_urnas",
    sku: "UR-001",
    quantity: 12,
    unit: "unidad",
    unitPrice: 85000,
    minStock: 5,
    location: "Bodega A - Estante 3",
    supplier: "Cerámicas Arte",
    description: "Cerámica blanca, tapa a rosca",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-15T00:00:00Z",
  },
  {
    id: "inv4",
    name: "Urna cremación mármol",
    category: "ataudes_urnas",
    sku: "UR-002",
    quantity: 3,
    unit: "unidad",
    unitPrice: 220000,
    minStock: 2,
    location: "Bodega A - Estante 3",
    supplier: "Cerámicas Arte",
    description: "Mármol blanco veteado, grabado incluido",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "inv5",
    name: "Formol al 10%",
    category: "preparacion",
    sku: "PR-001",
    quantity: 20,
    unit: "litros",
    unitPrice: 8500,
    minStock: 8,
    location: "Bodega B - Refrigerado",
    supplier: "Química Ltda.",
    description: "Para tanatopraxia, mantener a 4°C",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-05T00:00:00Z",
  },
  {
    id: "inv6",
    name: "Traje hombre talla M",
    category: "preparacion",
    sku: "PR-010",
    quantity: 5,
    unit: "unidad",
    unitPrice: 25000,
    minStock: 3,
    location: "Bodega B - Armario 1",
    supplier: "Textiles SA",
    description: "Negro, tela poliéster, incluye corbata",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "inv7",
    name: "Flores artificiales corona",
    category: "velatorio",
    sku: "VL-001",
    quantity: 15,
    unit: "unidad",
    unitPrice: 18000,
    minStock: 4,
    location: "Bodega C - Estante 1",
    supplier: "Flores Díaz",
    description: "Corona 60cm diámetro, mix blanco/lila",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "inv8",
    name: "Velas cirio 40cm",
    category: "velatorio",
    sku: "VL-002",
    quantity: 2,
    unit: "caja",
    unitPrice: 12000,
    minStock: 3,
    location: "Bodega C - Estante 2",
    supplier: "Cirios Chile",
    description: "Caja x24 unidades, blancas",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-10T00:00:00Z",
  },
  {
    id: "inv9",
    name: "Combustible (diesel)",
    category: "traslado",
    sku: "TR-001",
    quantity: 80,
    unit: "litros",
    unitPrice: 1150,
    minStock: 40,
    location: "Tanque exterior",
    supplier: "COPEC",
    description: "Para flota de vehículos",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-08T00:00:00Z",
  },
  {
    id: "inv10",
    name: "Papel membretado A4",
    category: "documentacion",
    sku: "DC-001",
    quantity: 3,
    unit: "caja",
    unitPrice: 9500,
    minStock: 2,
    location: "Oficina - Estante",
    supplier: "Comercial ABC",
    description: "500 hojas por caja, logo impreso",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
];

/* ─── KPI card ───────────────────────────────── */
function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-0.5" style={{ color: "#64748B" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Row ────────────────────────────────────── */
function ItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = CATEGORY_CFG[item.category];
  const total = item.quantity * item.unitPrice;
  const isLow = item.minStock !== undefined && item.quantity <= item.minStock;

  return (
    <tr className="table-row-veladesk group">
      {/* nombre + SKU */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          {isLow && (
            <AlertTriangle size={13} className="shrink-0 text-amber-500" />
          )}
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>
              {item.name}
            </p>
            {item.sku && (
              <p
                className="text-xs font-mono mt-0.5"
                style={{ color: "#94A3B8" }}
              >
                {item.sku}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* categoría */}
      <td className="px-4 py-3.5">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: cat.bg, color: cat.color }}
        >
          {cat.label}
        </span>
      </td>

      {/* cantidad */}
      <td className="px-4 py-3.5 text-center">
        <span
          className={`text-sm font-bold ${isLow ? "text-amber-600" : ""}`}
          style={isLow ? {} : { color: "#1E293B" }}
        >
          {item.quantity.toLocaleString()}
        </span>
        <span className="text-xs ml-1" style={{ color: "#94A3B8" }}>
          {item.unit}
        </span>
        {isLow && (
          <p className="text-xs text-amber-500 mt-0.5">mín. {item.minStock}</p>
        )}
      </td>

      {/* precio unitario */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm" style={{ color: "#374151" }}>
          {fmt$(item.unitPrice)}
        </span>
        <span className="text-xs block" style={{ color: "#94A3B8" }}>
          / {item.unit}
        </span>
      </td>

      {/* valor total */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-bold" style={{ color: "#A07840" }}>
          {fmt$(total)}
        </span>
      </td>

      {/* ubicación */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-xs" style={{ color: "#64748B" }}>
          {item.location ?? "—"}
        </span>
      </td>

      {/* acciones */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: "rgba(201,169,110,0.1)",
              color: "#A07840",
              border: "1px solid rgba(201,169,110,0.2)",
            }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: "rgba(239,68,68,0.08)",
              color: "#B91C1C",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Form panel ─────────────────────────────── */
function ItemForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: InventoryItem;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}) {
  const empty: InventoryItem = {
    id: crypto.randomUUID(),
    name: "",
    category: "ataudes_urnas",
    sku: "",
    quantity: 1,
    unit: "unidad",
    unitPrice: 0,
    description: "",
    minStock: undefined,
    location: "",
    supplier: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [form, setForm] = useState<InventoryItem>(initial ?? empty);
  const set = <K extends keyof InventoryItem>(k: K, v: InventoryItem[K]) =>
    setForm((p) => ({ ...p, [k]: v, updatedAt: new Date().toISOString() }));

  const total = form.quantity * form.unitPrice;
  const isValid =
    form.name.trim() !== "" && form.quantity >= 0 && form.unitPrice >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="h-full w-full max-w-lg flex flex-col bg-white shadow-2xl overflow-hidden animate-slide-in"
        style={{ borderLeft: "1px solid #E2E8F0" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#0A1628" }}>
              {initial ? "Editar insumo" : "Nuevo insumo"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              Complete los datos del ítem de inventario
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* valor calculado en tiempo real */}
          {form.quantity > 0 && form.unitPrice > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: "rgba(201,169,110,0.06)",
                border: "1px solid rgba(201,169,110,0.2)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(201,169,110,0.15)" }}
              >
                <DollarSign size={18} style={{ color: "#A07840" }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#64748B" }}>
                  Valor en stock ({form.quantity} {form.unit} ×{" "}
                  {fmt$(form.unitPrice)})
                </p>
                <p className="text-2xl font-bold" style={{ color: "#A07840" }}>
                  {fmt$(total)}
                </p>
              </div>
            </div>
          )}

          {/* identificación */}
          <section>
            <div className="section-header mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Identificación
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>
                  Nombre del insumo / producto *
                </label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej: Ataúd madera MDF estándar"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) =>
                      set("category", e.target.value as InventoryCategory)
                    }
                  >
                    {(
                      Object.entries(CATEGORY_CFG) as [
                        InventoryCategory,
                        (typeof CATEGORY_CFG)[InventoryCategory],
                      ][]
                    ).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Código / SKU</label>
                  <input
                    className={inputCls}
                    value={form.sku ?? ""}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="Ej: AT-001"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Características / Descripción
                </label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Color, material, dimensiones, especificaciones…"
                />
              </div>
            </div>
          </section>

          {/* stock */}
          <section>
            <div className="section-header mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Stock y Valor
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Cantidad *</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.quantity}
                  onChange={(e) => set("quantity", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelCls}>Unidad de medida</label>
                <select
                  className={inputCls}
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Valor por unidad ($) *</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.unitPrice}
                  onChange={(e) => set("unitPrice", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelCls}>Stock mínimo (alerta)</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.minStock ?? ""}
                  onChange={(e) =>
                    set(
                      "minStock",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  placeholder="Ej: 3"
                />
              </div>
            </div>

            {/* total display */}
            <div
              className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <span className="text-sm" style={{ color: "#64748B" }}>
                Valor total en stock
                <span className="text-xs ml-2" style={{ color: "#94A3B8" }}>
                  ({form.quantity} × {fmt$(form.unitPrice)})
                </span>
              </span>
              <span className="text-lg font-bold" style={{ color: "#A07840" }}>
                {fmt$(total)}
              </span>
            </div>
          </section>

          {/* logística */}
          <section>
            <div className="section-header mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Logística
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Ubicación en bodega</label>
                <input
                  className={inputCls}
                  value={form.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Ej: Bodega A - Estante 2"
                />
              </div>
              <div>
                <label className={labelCls}>Proveedor</label>
                <input
                  className={inputCls}
                  value={form.supplier ?? ""}
                  onChange={(e) => set("supplier", e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium btn-navy"
          >
            Cancelar
          </button>
          <button
            onClick={() => isValid && onSave(form)}
            disabled={!isValid}
            className="flex-[2] py-3 rounded-xl text-sm font-semibold btn-gold disabled:opacity-40"
          >
            <span className="relative z-10">
              {initial ? "Guardar cambios" : "Agregar insumo"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Inventario() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<InventoryCategory | "todas">(
    "todas",
  );
  const [sortBy, setSortBy] = useState<"name" | "total" | "qty">("name");

  /* ── KPIs ── */
  const kpis = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const lowStock = items.filter(
      (i) => i.minStock !== undefined && i.quantity <= i.minStock,
    );
    const categories = new Set(items.map((i) => i.category)).size;
    return { totalItems, totalValue, lowStock: lowStock.length, categories };
  }, [items]);

  /* ── filtered & sorted list ── */
  const filtered = useMemo(() => {
    return items
      .filter(
        (i) =>
          (filterCat === "todas" || i.category === filterCat) &&
          (search === "" ||
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            (i.sku ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (i.supplier ?? "").toLowerCase().includes(search.toLowerCase())),
      )
      .sort((a, b) => {
        if (sortBy === "total")
          return b.quantity * b.unitPrice - a.quantity * a.unitPrice;
        if (sortBy === "qty") return b.quantity - a.quantity;
        return a.name.localeCompare(b.name);
      });
  }, [items, filterCat, search, sortBy]);

  /* ── CRUD ── */
  const handleSave = (item: InventoryItem) => {
    if (editItem) {
      setItems((p) => p.map((i) => (i.id === item.id ? item : i)));
    } else {
      setItems((p) => [...p, item]);
    }
    setFormOpen(false);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteId) setItems((p) => p.filter((i) => i.id !== deleteId));
    setDeleteId(null);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  /* ── total visible ── */
  const visibleTotal = filtered.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );

  return (
    <div className="p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 animate-fade-in">
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#C9A96E" }}
          >
            Gestión de Inventario
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#0A1628" }}>
            Inventario
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            {items.length} ítems registrados · {kpis.categories} categorías
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm btn-gold"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={16} /> Nuevo insumo
          </span>
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total de ítems"
          value={String(kpis.totalItems)}
          icon={Package}
          color="#0A1628"
          sub={`${kpis.categories} categorías`}
        />
        <KpiCard
          label="Valor total en stock"
          value={fmt$(kpis.totalValue)}
          icon={DollarSign}
          color="#A07840"
          sub="cantidad × precio"
        />
        <KpiCard
          label="Categorías activas"
          value={String(kpis.categories)}
          icon={Layers}
          color="#1D4ED8"
        />
        <KpiCard
          label="Stock bajo mínimo"
          value={String(kpis.lowStock)}
          icon={TrendingDown}
          color={kpis.lowStock > 0 ? "#B91C1C" : "#047857"}
          sub={kpis.lowStock > 0 ? "requieren reposición" : "todo en orden"}
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o proveedor…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl input-veladesk"
          />
        </div>

        {/* category filter */}
        <select
          value={filterCat}
          onChange={(e) =>
            setFilterCat(e.target.value as InventoryCategory | "todas")
          }
          className="text-sm rounded-xl px-3 py-2.5 input-veladesk min-w-[170px]"
        >
          <option value="todas">Todas las categorías</option>
          {(
            Object.entries(CATEGORY_CFG) as [
              InventoryCategory,
              (typeof CATEGORY_CFG)[InventoryCategory],
            ][]
          ).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>

        {/* sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-sm rounded-xl px-3 py-2.5 input-veladesk"
        >
          <option value="name">Ordenar: Nombre</option>
          <option value="total">Ordenar: Mayor valor</option>
          <option value="qty">Ordenar: Mayor cantidad</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold" style={{ color: "#0A1628" }}>
            {filtered.length} ítem{filtered.length !== 1 ? "s" : ""}
            {search || filterCat !== "todas" ? " (filtrados)" : ""}
          </p>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "#64748B" }}
          >
            <span>Valor visible:</span>
            <span className="font-bold" style={{ color: "#A07840" }}>
              {fmt$(visibleTotal)}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">Sin ítems</p>
            <button
              onClick={openNew}
              className="mt-3 text-sm font-medium px-4 py-2 rounded-xl btn-navy"
            >
              Agregar primer insumo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {[
                    "Insumo / Producto",
                    "Categoría",
                    "Cantidad",
                    "Precio unitario",
                    "Valor en stock",
                    "Ubicación",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#64748B" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onEdit={() => openEdit(item)}
                    onDelete={() => setDeleteId(item.id)}
                  />
                ))}
              </tbody>
              {/* totals row */}
              <tfoot>
                <tr
                  style={{
                    background: "#F8FAFC",
                    borderTop: "2px solid #E2E8F0",
                  }}
                >
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "#0A1628" }}
                  >
                    Total en stock
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-base font-bold"
                      style={{ color: "#A07840" }}
                    >
                      {fmt$(visibleTotal)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Low stock alerts ── */}
      {kpis.lowStock > 0 && (
        <div
          className="rounded-2xl p-5 animate-slide-up"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
          <h2
            className="flex items-center gap-2 text-sm font-bold mb-3"
            style={{ color: "#92400E" }}
          >
            <AlertTriangle size={15} /> Ítems con stock bajo mínimo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {items
              .filter(
                (i) => i.minStock !== undefined && i.quantity <= i.minStock,
              )
              .map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-amber-100 cursor-pointer hover:border-amber-200 transition-colors"
                  onClick={() => openEdit(i)}
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#1E293B" }}
                    >
                      {i.name}
                    </p>
                    <p className="text-xs" style={{ color: "#92400E" }}>
                      {i.quantity} {i.unit} · mín. {i.minStock}
                    </p>
                  </div>
                  <Pencil size={12} style={{ color: "#D97706" }} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl animate-slide-up"
            style={{ border: "1px solid #FECACA" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.1)" }}
              >
                <Trash2 size={18} style={{ color: "#EF4444" }} />
              </div>
              <h3 className="font-bold" style={{ color: "#1E293B" }}>
                ¿Eliminar insumo?
              </h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "#64748B" }}>
              <strong style={{ color: "#1E293B" }}>
                {items.find((i) => i.id === deleteId)?.name}
              </strong>{" "}
              se eliminará permanentemente del inventario.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-navy"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg,#EF4444,#DC2626)",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form panel ── */}
      {formOpen && (
        <ItemForm
          initial={editItem ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}
