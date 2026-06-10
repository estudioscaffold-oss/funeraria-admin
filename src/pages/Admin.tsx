import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Handshake,
  Tag,
  Layers,
  Building2,
  Palette,
  Upload,
  Phone,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import type { AppUser, Convenio, CatalogItem, UserRole } from "../types";
import {
  USER_ROLE_LABELS,
  USER_ROLE_COLORS,
  SUCURSALES,
} from "../utils/mockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { applyTheme, THEMES, type ThemeKey } from "../lib/theme";

const TABS = [
  { id: "perfil", label: "Perfil", icon: Building2 },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "convenios", label: "Convenios", icon: Handshake },
  { id: "servicios", label: "Servicios", icon: Tag },
  { id: "categorias", label: "Categorías", icon: Layers },
];

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white";

/* ════════════════════════════════════════════════════
   USUARIOS
   ════════════════════════════════════════════════════ */
function TabUsuarios() {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [editing, setEditing] = useState<AppUser | "new" | null>(null);

  const emptyUser = (): AppUser => ({
    id: crypto.randomUUID(),
    fullName: "",
    email: "",
    phone: "",
    role: "vendedor",
    sucursal: SUCURSALES[0],
    active: true,
    createdAt: new Date().toISOString(),
  });

  const [form, setForm] = useState<AppUser>(emptyUser());

  const openNew = () => {
    setForm(emptyNew());
    setEditing("new");
  };
  const emptyNew = () => ({ ...emptyUser(), id: crypto.randomUUID() });

  const openEdit = (u: AppUser) => {
    setForm({ ...u });
    setEditing(u);
  };

  const handleSave = () => {
    if (!form.fullName || !form.email) return;
    if (editing === "new") addUser(form);
    else updateUser(form.id, form);
    setEditing(null);
  };

  const handleDelete = (u: AppUser) => {
    if (confirm(`¿Eliminar usuario "${u.fullName}"?`)) deleteUser(u.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {users.length} usuarios registrados
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm"
        >
          <Plus size={15} /> Nuevo Usuario
        </button>
      </div>

      {/* Form modal */}
      {editing !== null && (
        <div className="bg-white rounded-xl border border-gold-200 shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">
              {editing === "new"
                ? "Nuevo Usuario"
                : `Editando: ${(editing as AppUser).fullName}`}
            </h3>
            <button
              onClick={() => setEditing(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Nombre completo *
              </label>
              <input
                className={inputCls}
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Nombres y apellidos"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Teléfono
              </label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Rol
              </label>
              <select
                className={inputCls}
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value as UserRole }))
                }
              >
                {Object.entries(USER_ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Sucursal
              </label>
              <select
                className={inputCls}
                value={form.sucursal}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sucursal: e.target.value }))
                }
              >
                {SUCURSALES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, active: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
              <label htmlFor="active" className="text-sm text-slate-600">
                Usuario activo
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-navy-900 hover:bg-navy-800 font-medium"
            >
              <Check size={14} /> Guardar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Nombre
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Correo
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Rol
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Sucursal
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Sin usuarios registrados
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy-800 text-gold-400 flex items-center justify-center font-semibold text-xs shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.fullName}</p>
                      <p className="text-slate-400 text-xs">{u.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${USER_ROLE_COLORS[u.role]}`}
                  >
                    {USER_ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">
                  {u.sucursal}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {u.active ? (
                      <>
                        <Check size={10} /> Activo
                      </>
                    ) : (
                      "Inactivo"
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gold-200 text-navy-900 hover:bg-navy-900 hover:text-white transition-all"
                    >
                      <Edit size={12} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
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

/* ════════════════════════════════════════════════════
   CONVENIOS
   ════════════════════════════════════════════════════ */
function TabConvenios() {
  const { convenios, addConvenio, updateConvenio, deleteConvenio } = useApp();
  const [editing, setEditing] = useState<Convenio | "new" | null>(null);

  const emptyConvenio = (): Convenio => ({
    id: crypto.randomUUID(),
    name: "",
    entity: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    discountPct: 0,
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    active: true,
  });

  const [form, setForm] = useState<Convenio>(emptyConvenio());

  const openNew = () => {
    setForm(emptyConvenio());
    setEditing("new");
  };
  const openEdit = (c: Convenio) => {
    setForm({ ...c });
    setEditing(c);
  };

  const handleSave = () => {
    if (!form.name || !form.entity) return;
    if (editing === "new") addConvenio(form);
    else updateConvenio(form.id, form);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {convenios.length} convenios registrados
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm"
        >
          <Plus size={15} /> Nuevo Convenio
        </button>
      </div>

      {editing !== null && (
        <div className="bg-white rounded-xl border border-gold-200 shadow-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">
              {editing === "new"
                ? "Nuevo Convenio"
                : `Editando: ${(editing as Convenio).name}`}
            </h3>
            <button
              onClick={() => setEditing(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Nombre del convenio *
              </label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ej: Convenio Isapre Colmena"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Entidad / Empresa *
              </label>
              <input
                className={inputCls}
                value={form.entity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, entity: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                % de Descuento
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={form.discountPct}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountPct: +e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Nombre contacto
              </label>
              <input
                className={inputCls}
                value={form.contactName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Teléfono contacto
              </label>
              <input
                className={inputCls}
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactPhone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Correo contacto
              </label>
              <input
                type="email"
                className={inputCls}
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contactEmail: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Fecha término (opcional)
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.endDate ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                className={inputCls + " resize-none"}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Condiciones del convenio…"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="conv-active"
                checked={form.active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, active: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
              <label htmlFor="conv-active" className="text-sm text-slate-600">
                Convenio activo
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-navy-900 hover:bg-navy-800 font-medium"
            >
              <Check size={14} /> Guardar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Nombre
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Entidad
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Contacto
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Descuento
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Vigencia
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-500 text-xs uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convenios.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Sin convenios registrados
                </td>
              </tr>
            )}
            {convenios.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{c.name}</p>
                  {c.description && (
                    <p className="text-slate-400 text-xs truncate max-w-52">
                      {c.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm">{c.entity}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 text-sm">{c.contactName}</p>
                  <p className="text-slate-400 text-xs">{c.contactPhone}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-indigo-700 text-base">
                    {c.discountPct}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {format(new Date(c.startDate), "d MMM yyyy", { locale: es })}
                  {c.endDate && (
                    <>
                      {" "}
                      →{" "}
                      {format(new Date(c.endDate), "d MMM yyyy", {
                        locale: es,
                      })}
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {c.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gold-200 text-navy-900 hover:bg-navy-900 hover:text-white transition-all"
                    >
                      <Edit size={12} /> Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${c.name}"?`))
                          deleteConvenio(c.id);
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
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

/* ════════════════════════════════════════════════════
   SERVICIOS (ítems del catálogo agrupados por categoría)
   ════════════════════════════════════════════════════ */
function TabServicios() {
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem } =
    useApp();
  const [openCat, setOpenCat] = useState<string | null>(catalog[0]?.id ?? null);
  const [editingItem, setEditingItem] = useState<{
    catId: string;
    item: CatalogItem | null;
  } | null>(null);
  const [itemForm, setItemForm] = useState<{ name: string; price: number }>({
    name: "",
    price: 0,
  });

  const openAdd = (catId: string) => {
    setItemForm({ name: "", price: 0 });
    setEditingItem({ catId, item: null });
  };
  const openEditItem = (catId: string, item: CatalogItem) => {
    setItemForm({ name: item.name, price: item.price });
    setEditingItem({ catId, item });
  };
  const handleSaveItem = () => {
    if (!itemForm.name || !editingItem) return;
    if (editingItem.item === null) {
      addCatalogItem(editingItem.catId, itemForm);
    } else {
      updateCatalogItem(editingItem.catId, {
        ...editingItem.item,
        ...itemForm,
      });
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Servicios agrupados por categoría. Estos ítems aparecen en los menús
        desplegables de los presupuestos.
      </p>

      {catalog.map((cat) => (
        <div
          key={cat.id}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* category header */}
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100"
            onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
          >
            <div className="flex items-center gap-2">
              {openCat === cat.id ? (
                <ChevronDown size={15} className="text-indigo-500" />
              ) : (
                <ChevronRight size={15} className="text-slate-400" />
              )}
              <span className="font-semibold text-slate-700 text-sm">
                {cat.name}
              </span>
              <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                {cat.items.length} ítems
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAdd(cat.id);
              }}
              className="flex items-center gap-1 text-xs text-navy-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={12} /> Agregar ítem
            </button>
          </button>

          {/* inline add/edit form */}
          {editingItem?.catId === cat.id && (
            <div className="px-5 py-3 bg-slate-50 border-b border-indigo-100 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  {editingItem.item ? "Editar nombre" : "Nombre del servicio"} *
                </label>
                <input
                  className={inputCls}
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ej: Ataúd de madera de roble"
                  autoFocus
                />
              </div>
              <div className="w-40">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={itemForm.price || ""}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, price: +e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pb-0.5">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveItem}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg hover:bg-navy-800 font-medium"
                >
                  <Check size={13} /> {editingItem.item ? "Guardar" : "Agregar"}
                </button>
              </div>
            </div>
          )}

          {/* items list */}
          {openCat === cat.id && (
            <div className="divide-y divide-slate-50">
              {cat.items.length === 0 && (
                <p className="px-5 py-5 text-sm text-slate-400 text-center">
                  Sin ítems — agrega el primero
                </p>
              )}
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50/70 transition-colors group"
                >
                  <div>
                    <p className="text-sm text-slate-700">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-700 text-sm tabular-nums">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      }).format(item.price)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditItem(cat.id, item)}
                        className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${item.name}"?`))
                            deleteCatalogItem(cat.id, item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CATEGORÍAS
   ════════════════════════════════════════════════════ */
function TabCategorias() {
  const { catalog, addCategory, updateCategory, deleteCategory } = useApp();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim());
    setNewName("");
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };
  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateCategory(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-slate-500">
        Las categorías organizan los servicios en los menús desplegables de los
        presupuestos. El orden aquí determina el orden en los formularios.
      </p>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nueva categoría (ej: Música y Sonido)…"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium bg-navy-900 hover:bg-navy-800 transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {catalog.length === 0 && (
          <p className="px-5 py-8 text-center text-slate-400 text-sm">
            Sin categorías
          </p>
        )}
        {catalog.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-slate-300 text-xs font-mono w-5 text-right">
                {idx + 1}
              </span>
              {editingId === cat.id ? (
                <input
                  className="flex-1 border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(cat.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span className="text-slate-800 font-medium text-sm">
                  {cat.name}
                </span>
              )}
              <span className="text-xs text-slate-400">
                ({cat.items.length} ítems)
              </span>
            </div>

            <div className="flex items-center gap-1">
              {editingId === cat.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (cat.items.length > 0) {
                        if (
                          !confirm(
                            `La categoría "${cat.name}" tiene ${cat.items.length} ítem(s). ¿Eliminar de todas formas?`,
                          )
                        )
                          return;
                      }
                      deleteCategory(cat.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        💡 Consejo: Al eliminar una categoría con ítems, los ítems se eliminarán
        también. Para reorganizar categorías, agrega la nueva y elimina la
        antigua.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TAB PERFIL — Empresa + Tema
   ════════════════════════════════════════════════════ */
interface CompanyProfile {
  logo: string;
  name: string;
  rut: string;
  address: string;
  city: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  description: string;
  ownerName: string;
  ownerPhone: string;
}

const EMPTY_PROFILE: CompanyProfile = {
  logo: "",
  name: "",
  rut: "",
  address: "",
  city: "",
  phone1: "",
  phone2: "",
  email: "",
  website: "",
  description: "",
  ownerName: "",
  ownerPhone: "",
};

function loadProfile(): CompanyProfile {
  try {
    const s = localStorage.getItem("veladesk-profile");
    return s ? { ...EMPTY_PROFILE, ...JSON.parse(s) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

function TabPerfil() {
  const [profile, setProfile] = useState<CompanyProfile>(loadProfile());
  const [theme, setTheme] = useState<ThemeKey>(
    () => (localStorage.getItem("veladesk-theme") as ThemeKey) ?? "blue",
  );
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof CompanyProfile, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("logo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTheme = (key: ThemeKey) => {
    setTheme(key);
    applyTheme(key);
  };

  const handleSave = () => {
    localStorage.setItem("veladesk-profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white";
  const labelCls =
    "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Logo + datos empresa ── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={15} style={{ color: "#C9A96E" }} />
          <h3
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "#0A1628" }}
          >
            Datos de la Empresa
          </h3>
        </div>

        {/* Logo upload */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed transition-all hover:border-gold-400"
            style={{
              borderColor: profile.logo ? "transparent" : "#E2E8F0",
              background: "#F8FAFC",
            }}
            onClick={() => fileRef.current?.click()}
          >
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Logo"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload size={20} style={{ color: "#CBD5E1" }} />
                <span
                  className="text-xs text-center"
                  style={{ color: "#94A3B8" }}
                >
                  Logo
                </span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              style={{ color: "#374151" }}
            >
              {profile.logo ? "Cambiar logo" : "Subir logo"}
            </button>
            {profile.logo && (
              <button
                onClick={() => set("logo", "")}
                className="ml-2 text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                Quitar
              </button>
            )}
            <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
              PNG, JPG o SVG. Máx 2MB.
            </p>
          </div>
        </div>

        {/* Campos empresa */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>
              Razón Social / Nombre de la empresa
            </label>
            <input
              className={inputCls}
              value={profile.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Funeraria San Martín Ltda."
            />
          </div>
          <div>
            <label className={labelCls}>RUT Empresa</label>
            <input
              className={inputCls}
              value={profile.rut}
              onChange={(e) => set("rut", e.target.value)}
              placeholder="76.123.456-7"
            />
          </div>
          <div>
            <label className={labelCls}>Ciudad / Comuna</label>
            <input
              className={inputCls}
              value={profile.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Santiago, Las Condes"
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>
              <MapPin size={10} className="inline mr-1" />
              Dirección
            </label>
            <input
              className={inputCls}
              value={profile.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Av. Principal 1234, Oficina 5"
            />
          </div>
          <div>
            <label className={labelCls}>
              <Phone size={10} className="inline mr-1" />
              Teléfono principal
            </label>
            <input
              className={inputCls}
              value={profile.phone1}
              onChange={(e) => set("phone1", e.target.value)}
              placeholder="+56 2 1234 5678"
            />
          </div>
          <div>
            <label className={labelCls}>
              <Phone size={10} className="inline mr-1" />
              Teléfono secundario
            </label>
            <input
              className={inputCls}
              value={profile.phone2}
              onChange={(e) => set("phone2", e.target.value)}
              placeholder="+56 9 8765 4321"
            />
          </div>
          <div>
            <label className={labelCls}>
              <Mail size={10} className="inline mr-1" />
              Correo de contacto
            </label>
            <input
              className={inputCls}
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contacto@funeraria.cl"
            />
          </div>
          <div>
            <label className={labelCls}>
              <Globe size={10} className="inline mr-1" />
              Sitio web
            </label>
            <input
              className={inputCls}
              value={profile.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="www.funeraria.cl"
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Descripción / Eslogan</label>
            <textarea
              className={inputCls}
              rows={2}
              value={profile.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Más de 30 años acompañando a las familias…"
            />
          </div>
        </div>
      </section>

      {/* ── Datos representante ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} style={{ color: "#C9A96E" }} />
          <h3
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "#0A1628" }}
          >
            Representante Legal
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              className={inputCls}
              value={profile.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              placeholder="Juan Pérez González"
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono directo</label>
            <input
              className={inputCls}
              value={profile.ownerPhone}
              onChange={(e) => set("ownerPhone", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </div>
        </div>
      </section>

      {/* ── Tema del software ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={14} style={{ color: "#C9A96E" }} />
          <h3
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "#0A1628" }}
          >
            Tema del Software
          </h3>
        </div>
        <p className="text-sm mb-5" style={{ color: "#64748B" }}>
          Elige el color del menú lateral y los elementos principales del
          sistema.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {(
            Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]
          ).map(([key, t]) => {
            const active = theme === key;
            return (
              <button
                key={key}
                onClick={() => handleTheme(key)}
                className="relative rounded-2xl overflow-hidden transition-all duration-200 text-left"
                style={{
                  border: active ? `2px solid ${t.hex}` : "2px solid #E2E8F0",
                  boxShadow: active ? `0 4px 20px ${t.hex}40` : "none",
                  transform: active ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* preview sidebar strip */}
                <div
                  className="h-20 flex items-stretch gap-0"
                  style={{ background: "#F8FAFC" }}
                >
                  {/* fake sidebar */}
                  <div
                    className="w-14 flex flex-col gap-1.5 p-2"
                    style={{
                      background: `linear-gradient(180deg, ${t.brandDark} 0%, ${t.brand} 100%)`,
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-2 rounded-sm"
                        style={{
                          background:
                            i === 2 ? t.brandText : "rgba(255,255,255,0.15)",
                          width: i === 2 ? "90%" : `${50 + i * 10}%`,
                        }}
                      />
                    ))}
                  </div>
                  {/* fake content */}
                  <div className="flex-1 p-2.5 space-y-1.5">
                    <div className="h-2 rounded bg-slate-200 w-3/4" />
                    <div className="h-1.5 rounded bg-slate-100 w-full" />
                    <div className="h-1.5 rounded bg-slate-100 w-5/6" />
                    <div
                      className="h-5 rounded-lg mt-1"
                      style={{ background: t.brand, width: "60%" }}
                    />
                  </div>
                </div>
                {/* label */}
                <div
                  className="px-3 py-2.5 flex items-center justify-between bg-white"
                  style={{ borderTop: "1px solid #F1F5F9" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ background: t.hex }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#1E293B" }}
                    >
                      {t.label}
                    </span>
                  </div>
                  {active && (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: t.hex }}
                    >
                      <Check size={10} color="white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Guardar ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm btn-gold"
        >
          <span className="relative z-10 flex items-center gap-2">
            {saved ? (
              <>
                <Check size={14} /> Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </span>
        </button>
        {saved && (
          <span
            className="text-sm font-medium animate-fade-in"
            style={{ color: "#10B981" }}
          >
            ✓ Los cambios se guardaron correctamente
          </span>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════ */
export default function Admin() {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="flex flex-col h-screen">
      {/* header */}
      <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0 shrink-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Administrador</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión de usuarios, convenios y catálogo de servicios
          </p>
        </div>
        <div className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "perfil" && <TabPerfil />}
        {activeTab === "usuarios" && <TabUsuarios />}
        {activeTab === "convenios" && <TabConvenios />}
        {activeTab === "servicios" && <TabServicios />}
        {activeTab === "categorias" && <TabCategorias />}
      </div>
    </div>
  );
}
