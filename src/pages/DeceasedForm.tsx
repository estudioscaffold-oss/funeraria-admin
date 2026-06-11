import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  ChevronLeft,
  Save,
  User,
  Phone,
  Briefcase,
  AlertTriangle,
  Cross,
  MapPin,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import type { DeceasedRecord } from "../types";
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  RELIGIOUS_LABELS,
} from "../utils/mockData";

/* ── empty form ─────────────────────────────── */
const empty: Omit<DeceasedRecord, "id" | "createdAt" | "updatedAt"> = {
  sucursal: "",
  /* fallecido */
  fullName: "",
  rut: "",
  birthDate: "",
  nationality: "Chilena",
  address: "",
  weight: undefined,
  height: undefined,
  prevision: "",
  occupation: "",
  civilStatus: "",
  educationLevel: "",
  /* fallecimiento */
  deathDate: "",
  deathTime: "",
  deathPlace: "",
  deathCause: "",
  /* contratante */
  familyContact: {
    name: "",
    rut: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  },
  /* servicio */
  serviceType: "servicio_completo",
  serviceIncludes: "",
  status: "recepcion",
  velatorio: "",
  velatorioAddress: "",
  cemetery: "",
  cemeteryAddress: "",
  crematorium: "",
  crematoriumAddress: "",
  /* otros */
  religiousPreference: "ninguna",
  religiousNotes: "",
  urgencies: "",
  restrictions: "",
  sensitiveObservations: "",
  documents: [],
  budgets: [],
  payments: [],
  tasks: [],
  assignedStaff: "",
};

/* ── UI helpers ──────────────────────────────── */
const Section = ({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div
      className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5"
      style={{
        background:
          "linear-gradient(90deg, rgba(201,169,110,0.06) 0%, transparent 100%)",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(201,169,110,0.12)" }}
      >
        <Icon size={14} style={{ color: "#A07840" }} />
      </div>
      <div>
        <h3 className="font-bold text-sm" style={{ color: "#0A1628" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({
  label,
  required,
  span2,
  children,
}: {
  label: string;
  required?: boolean;
  span2?: boolean;
  children: React.ReactNode;
}) => (
  <div className={span2 ? "col-span-2" : ""}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
      {label}{" "}
      {required && (
        <span className="text-red-400 normal-case font-normal">*</span>
      )}
    </label>
    {children}
  </div>
);

const ic =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-all duration-200";
const icFocus = `${ic} focus:ring-yellow-300`;

const CIVIL_STATUS = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
  "Conviviente civil",
  "Otro",
];
const EDUCATION = [
  "Sin estudios",
  "Educación básica",
  "Educación media",
  "Técnico",
  "Universitario",
  "Postgrado",
];
const PREVISION = [
  "Fonasa A",
  "Fonasa B",
  "Fonasa C",
  "Fonasa D",
  "Isapre",
  "Sin previsión",
  "Otro",
];

/* ══════════════════════════════════════════════
   FORM
══════════════════════════════════════════════ */
export default function DeceasedForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deceased, addDeceased, updateDeceased, sucursales } = useApp();

  const existing =
    id && id !== "nuevo" ? deceased.find((d) => d.id === id) : null;
  const [form, setForm] = useState<
    Omit<DeceasedRecord, "id" | "createdAt" | "updatedAt">
  >(existing ?? empty);
  const [saved, setSaved] = useState(false);

  /* ── service items list ── */
  const [serviceItems, setServiceItems] = useState<string[]>(() =>
    (existing?.serviceIncludes ?? "").split("\n").filter(Boolean),
  );
  const [newItem, setNewItem] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState("");

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    setServiceItems((prev) => [...prev, v]);
    setNewItem("");
  };
  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingVal(serviceItems[idx]);
  };
  const confirmEdit = () => {
    if (editingIdx === null) return;
    const v = editingVal.trim();
    if (v)
      setServiceItems((prev) => prev.map((x, i) => (i === editingIdx ? v : x)));
    setEditingIdx(null);
  };
  const removeItem = (idx: number) =>
    setServiceItems((prev) => prev.filter((_, i) => i !== idx));

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setContact = (key: keyof typeof form.familyContact, value: string) =>
    setForm((f) => ({
      ...f,
      familyContact: { ...f.familyContact, [key]: value },
    }));

  const handleSave = () => {
    if (!form.fullName || !form.rut || !form.deathDate) return;
    const record = { ...form, serviceIncludes: serviceItems.join("\n") };
    if (existing) {
      updateDeceased(existing.id, record);
    } else {
      addDeceased({
        ...record,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setSaved(true);
    setTimeout(() => navigate("/fallecidos"), 800);
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/fallecidos")}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>
            {existing ? "Editar Ficha" : "Nueva Ficha de Fallecido"}
          </h1>
          <p className="text-sm text-slate-400">
            Complete todos los campos obligatorios
          </p>
        </div>
      </div>

      {/* ── 1. SUCURSAL ── */}
      <Section icon={Building2} title="Sucursal">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sucursal">
            <select
              className={icFocus}
              value={form.sucursal ?? ""}
              onChange={(e) => set("sucursal", e.target.value)}
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
          </Field>
          <Field label="Personal asignado">
            <input
              className={icFocus}
              value={form.assignedStaff ?? ""}
              onChange={(e) => set("assignedStaff", e.target.value)}
              placeholder="Nombre del funcionario responsable"
            />
          </Field>
        </div>
      </Section>

      {/* ── 2. DATOS DEL CONTRATANTE ── */}
      <Section
        icon={Phone}
        title="Datos del Contratante"
        subtitle="Persona que contrata y es responsable del servicio"
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre completo" required>
            <input
              className={icFocus}
              value={form.familyContact.name}
              onChange={(e) => setContact("name", e.target.value)}
              placeholder="Nombres y apellidos completos"
            />
          </Field>
          <Field label="RUT">
            <input
              className={icFocus}
              value={form.familyContact.rut}
              onChange={(e) => setContact("rut", e.target.value)}
              placeholder="12.345.678-9"
            />
          </Field>
          <Field label="Teléfono">
            <input
              className={icFocus}
              value={form.familyContact.phone}
              onChange={(e) => setContact("phone", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </Field>
          <Field label="Correo electrónico">
            <input
              type="email"
              className={icFocus}
              value={form.familyContact.email}
              onChange={(e) => setContact("email", e.target.value)}
              placeholder="correo@email.com"
            />
          </Field>
          <Field label="Dirección" span2>
            <input
              className={icFocus}
              value={form.familyContact.address}
              onChange={(e) => setContact("address", e.target.value)}
              placeholder="Calle, número, comuna, ciudad"
            />
          </Field>
          <Field label="Parentesco con el fallecido">
            <input
              className={icFocus}
              value={form.familyContact.relationship}
              onChange={(e) => setContact("relationship", e.target.value)}
              placeholder="Ej: Hijo/a, cónyuge, hermano/a…"
            />
          </Field>
        </div>
      </Section>

      {/* ── 3. DATOS DEL FALLECIDO ── */}
      <Section icon={User} title="Datos del Fallecido">
        <div className="grid grid-cols-2 gap-4">
          {/* identificación */}
          <Field label="Nombre completo" required span2>
            <input
              className={icFocus}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Nombres y apellidos completos"
            />
          </Field>
          <Field label="RUT" required>
            <input
              className={icFocus}
              value={form.rut}
              onChange={(e) => set("rut", e.target.value)}
              placeholder="12.345.678-9"
            />
          </Field>
          <Field label="Nacionalidad">
            <input
              className={icFocus}
              value={form.nationality}
              onChange={(e) => set("nationality", e.target.value)}
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              className={icFocus}
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
            />
          </Field>
          <Field label="Fecha de fallecimiento" required>
            <input
              type="date"
              className={icFocus}
              value={form.deathDate}
              onChange={(e) => set("deathDate", e.target.value)}
            />
          </Field>
          <Field label="Hora de fallecimiento">
            <input
              type="time"
              className={icFocus}
              value={form.deathTime}
              onChange={(e) => set("deathTime", e.target.value)}
            />
          </Field>
          <Field label="Causa de fallecimiento" span2>
            <input
              className={icFocus}
              value={form.deathCause ?? ""}
              onChange={(e) => set("deathCause", e.target.value)}
              placeholder="Diagnóstico o causa de muerte"
            />
          </Field>
          <Field label="Lugar de fallecimiento" span2>
            <input
              className={icFocus}
              value={form.deathPlace}
              onChange={(e) => set("deathPlace", e.target.value)}
              placeholder="Hospital, clínica, domicilio, dirección…"
            />
          </Field>

          {/* datos adicionales */}
          <Field label="Dirección del fallecido" span2>
            <input
              className={icFocus}
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Calle, número, comuna, ciudad"
            />
          </Field>
          <Field label="Estado civil">
            <select
              className={icFocus}
              value={form.civilStatus ?? ""}
              onChange={(e) => set("civilStatus", e.target.value)}
            >
              <option value="">Seleccionar</option>
              {CIVIL_STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Ocupación / Profesión">
            <input
              className={icFocus}
              value={form.occupation ?? ""}
              onChange={(e) => set("occupation", e.target.value)}
              placeholder="Ej: Contador, Dueña de casa…"
            />
          </Field>
          <Field label="Previsión de salud">
            <select
              className={icFocus}
              value={form.prevision ?? ""}
              onChange={(e) => set("prevision", e.target.value)}
            >
              <option value="">Seleccionar</option>
              {PREVISION.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Nivel de estudios">
            <select
              className={icFocus}
              value={form.educationLevel ?? ""}
              onChange={(e) => set("educationLevel", e.target.value)}
            >
              <option value="">Seleccionar</option>
              {EDUCATION.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>

          {/* antropometría */}
          <Field label="Peso (kg)">
            <input
              type="number"
              min={0}
              max={300}
              step={0.1}
              className={icFocus}
              value={form.weight ?? ""}
              onChange={(e) =>
                set(
                  "weight",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Ej: 70"
            />
          </Field>
          <Field label="Altura (cms)">
            <input
              type="number"
              min={0}
              max={250}
              className={icFocus}
              value={form.height ?? ""}
              onChange={(e) =>
                set(
                  "height",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Ej: 165"
            />
          </Field>
        </div>
      </Section>

      {/* ── 5. SERVICIO CONTRATADO ── */}
      <Section icon={Briefcase} title="Servicio Contratado">
        <div className="grid grid-cols-2 gap-4">
          {/* tipo + estado */}
          <Field label="Tipo de servicio" required>
            <select
              className={icFocus}
              value={form.serviceType}
              onChange={(e) =>
                set(
                  "serviceType",
                  e.target.value as DeceasedRecord["serviceType"],
                )
              }
            >
              {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado del proceso">
            <select
              className={icFocus}
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as DeceasedRecord["status"])
              }
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>

          {/* desglose */}
          <div className="col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
              Desglose del servicio contratado
            </label>

            {/* items list */}
            {serviceItems.length > 0 && (
              <ul className="space-y-1.5 mb-2">
                {serviceItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    {editingIdx === idx ? (
                      <>
                        <input
                          className={`${icFocus} flex-1 py-1.5`}
                          value={editingVal}
                          onChange={(e) => setEditingVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmEdit();
                            if (e.key === "Escape") setEditingIdx(null);
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={confirmEdit}
                          className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIdx(null)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-slate-700">
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(idx)}
                          className="p-1 rounded hover:bg-yellow-50 transition-colors"
                          style={{ color: "#A07840" }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* add new item */}
            <div className="flex gap-2">
              <input
                className={`${icFocus} flex-1`}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="Ej: Ataúd modelo X, traslado, corona floral…"
              />
              <button
                type="button"
                onClick={addItem}
                disabled={!newItem.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-yellow-50"
                style={{ color: "#A07840" }}
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>
          </div>

          {/* velatorio */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3 mt-1">
              <MapPin size={13} style={{ color: "#C9A96E" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Velatorio
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre del velatorio">
                <input
                  className={icFocus}
                  value={form.velatorio ?? ""}
                  onChange={(e) => set("velatorio", e.target.value)}
                  placeholder="Nombre de la sala o funeraria"
                />
              </Field>
              <Field label="Dirección del velatorio">
                <input
                  className={icFocus}
                  value={form.velatorioAddress ?? ""}
                  onChange={(e) => set("velatorioAddress", e.target.value)}
                  placeholder="Calle, número, comuna"
                />
              </Field>
            </div>
          </div>

          {/* cementerio */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} style={{ color: "#C9A96E" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Cementerio
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre del cementerio">
                <input
                  className={icFocus}
                  value={form.cemetery ?? ""}
                  onChange={(e) => set("cemetery", e.target.value)}
                  placeholder="Nombre del cementerio"
                />
              </Field>
              <Field label="Dirección del cementerio">
                <input
                  className={icFocus}
                  value={form.cemeteryAddress ?? ""}
                  onChange={(e) => set("cemeteryAddress", e.target.value)}
                  placeholder="Calle, número, comuna"
                />
              </Field>
            </div>
          </div>

          {/* crematorio */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} style={{ color: "#C9A96E" }} />
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#C9A96E" }}
              >
                Crematorio
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre del crematorio">
                <input
                  className={icFocus}
                  value={form.crematorium ?? ""}
                  onChange={(e) => set("crematorium", e.target.value)}
                  placeholder="Nombre del crematorio"
                />
              </Field>
              <Field label="Dirección del crematorio">
                <input
                  className={icFocus}
                  value={form.crematoriumAddress ?? ""}
                  onChange={(e) => set("crematoriumAddress", e.target.value)}
                  placeholder="Calle, número, comuna"
                />
              </Field>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 6. PREFERENCIAS RELIGIOSAS ── */}
      <Section icon={Cross} title="Preferencias Religiosas / Culturales">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferencia religiosa">
            <select
              className={icFocus}
              value={form.religiousPreference}
              onChange={(e) =>
                set(
                  "religiousPreference",
                  e.target.value as DeceasedRecord["religiousPreference"],
                )
              }
            >
              {Object.entries(RELIGIOUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notas religiosas / culturales">
            <input
              className={icFocus}
              value={form.religiousNotes ?? ""}
              onChange={(e) => set("religiousNotes", e.target.value)}
              placeholder="Ritos específicos, tradiciones…"
            />
          </Field>
        </div>
      </Section>

      {/* ── 7. URGENCIAS Y RESTRICCIONES ── */}
      <Section icon={AlertTriangle} title="Urgencias y Restricciones">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Urgencias">
            <textarea
              rows={2}
              className={`${icFocus} resize-none`}
              value={form.urgencies ?? ""}
              onChange={(e) => set("urgencies", e.target.value)}
              placeholder="Urgencias de tiempo, traslado urgente, condiciones especiales…"
            />
          </Field>
          <Field label="Restricciones">
            <textarea
              rows={2}
              className={`${icFocus} resize-none`}
              value={form.restrictions ?? ""}
              onChange={(e) => set("restrictions", e.target.value)}
              placeholder="Restricciones legales, sanitarias, religiosas…"
            />
          </Field>
          <Field label="Observaciones sensibles">
            <textarea
              rows={3}
              className={`${icFocus} resize-none`}
              value={form.sensitiveObservations ?? ""}
              onChange={(e) => set("sensitiveObservations", e.target.value)}
              placeholder="Información confidencial sobre el fallecido o la familia…"
            />
          </Field>
        </div>
      </Section>

      {/* ── actions ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate("/fallecidos")}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!form.fullName || !form.rut || !form.deathDate}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Save size={15} />
            {saved
              ? "¡Guardado!"
              : existing
                ? "Guardar cambios"
                : "Guardar Ficha"}
          </span>
        </button>
      </div>
    </div>
  );
}
