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
  FileText,
  Cross,
} from "lucide-react";
import type { DeceasedRecord } from "../types";
import {
  SERVICE_LABELS,
  STATUS_LABELS,
  RELIGIOUS_LABELS,
} from "../utils/mockData";

const empty: Omit<DeceasedRecord, "id" | "createdAt" | "updatedAt"> = {
  fullName: "",
  rut: "",
  birthDate: "",
  nationality: "Chilena",
  deathDate: "",
  deathTime: "",
  deathPlace: "",
  deathCause: "",
  familyContact: {
    name: "",
    rut: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  },
  serviceType: "servicio_completo",
  status: "recepcion",
  velatorio: "",
  velatorioAddress: "",
  cemetery: "",
  cemeteryAddress: "",
  crematorium: "",
  crematoriumAddress: "",
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

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
      <Icon size={16} className="text-indigo-600" />
      <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({
  label,
  required,
  children,
  half,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  half?: boolean;
}) => (
  <div className={half ? "" : ""}>
    <label className="text-xs font-medium text-slate-600 block mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function DeceasedForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deceased, addDeceased, updateDeceased } = useApp();

  const existing =
    id && id !== "nuevo" ? deceased.find((d) => d.id === id) : null;
  const [form, setForm] = useState<
    Omit<DeceasedRecord, "id" | "createdAt" | "updatedAt">
  >(existing ?? empty);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setContact = (key: keyof typeof form.familyContact, value: string) =>
    setForm((f) => ({
      ...f,
      familyContact: { ...f.familyContact, [key]: value },
    }));

  const handleSave = () => {
    if (!form.fullName || !form.rut || !form.deathDate) return;
    if (existing) {
      updateDeceased(existing.id, form);
    } else {
      addDeceased({
        ...form,
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/fallecidos")}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {existing ? "Editar Ficha" : "Nueva Ficha de Fallecido"}
          </h1>
          <p className="text-slate-500 text-sm">
            Complete todos los campos obligatorios
          </p>
        </div>
      </div>

      {/* Personal */}
      <Section icon={User} title="Datos del Fallecido">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nombre completo" required>
              <input
                className={inputClass}
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Nombres y apellidos completos"
              />
            </Field>
          </div>
          <Field label="RUT" required>
            <input
              className={inputClass}
              value={form.rut}
              onChange={(e) => set("rut", e.target.value)}
              placeholder="12.345.678-9"
            />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              className={inputClass}
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
            />
          </Field>
          <Field label="Nacionalidad">
            <input
              className={inputClass}
              value={form.nationality}
              onChange={(e) => set("nationality", e.target.value)}
            />
          </Field>
          <Field label="Personal asignado">
            <input
              className={inputClass}
              value={form.assignedStaff ?? ""}
              onChange={(e) => set("assignedStaff", e.target.value)}
              placeholder="Nombre del funcionario"
            />
          </Field>
        </div>
      </Section>

      {/* Death info */}
      <Section icon={FileText} title="Datos del Fallecimiento">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha de fallecimiento" required>
            <input
              type="date"
              className={inputClass}
              value={form.deathDate}
              onChange={(e) => set("deathDate", e.target.value)}
            />
          </Field>
          <Field label="Hora de fallecimiento" required>
            <input
              type="time"
              className={inputClass}
              value={form.deathTime}
              onChange={(e) => set("deathTime", e.target.value)}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Lugar de fallecimiento" required>
              <input
                className={inputClass}
                value={form.deathPlace}
                onChange={(e) => set("deathPlace", e.target.value)}
                placeholder="Hospital, clínica, domicilio..."
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Causa de fallecimiento (si corresponde)">
              <input
                className={inputClass}
                value={form.deathCause ?? ""}
                onChange={(e) => set("deathCause", e.target.value)}
                placeholder="Diagnóstico o causa de muerte"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Family contact */}
      <Section icon={Phone} title="Contacto Familiar Responsable">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre completo" required>
            <input
              className={inputClass}
              value={form.familyContact.name}
              onChange={(e) => setContact("name", e.target.value)}
            />
          </Field>
          <Field label="RUT">
            <input
              className={inputClass}
              value={form.familyContact.rut}
              onChange={(e) => setContact("rut", e.target.value)}
              placeholder="12.345.678-9"
            />
          </Field>
          <Field label="Parentesco">
            <input
              className={inputClass}
              value={form.familyContact.relationship}
              onChange={(e) => setContact("relationship", e.target.value)}
              placeholder="Hijo/a, cónyuge, padre/madre..."
            />
          </Field>
          <Field label="Teléfono">
            <input
              className={inputClass}
              value={form.familyContact.phone}
              onChange={(e) => setContact("phone", e.target.value)}
              placeholder="+56 9 1234 5678"
            />
          </Field>
          <Field label="Correo electrónico">
            <input
              type="email"
              className={inputClass}
              value={form.familyContact.email}
              onChange={(e) => setContact("email", e.target.value)}
            />
          </Field>
          <Field label="Dirección">
            <input
              className={inputClass}
              value={form.familyContact.address}
              onChange={(e) => setContact("address", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Service */}
      <Section icon={Briefcase} title="Servicio Contratado">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de servicio" required>
            <select
              className={inputClass}
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
              className={inputClass}
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
          {/* Velatorio */}
          <Field label="Lugar de velatorio">
            <input
              className={inputClass}
              value={form.velatorio ?? ""}
              onChange={(e) => set("velatorio", e.target.value)}
              placeholder="Nombre de la sala o funeraria"
            />
          </Field>
          <Field label="Dirección del velatorio">
            <input
              className={inputClass}
              value={form.velatorioAddress ?? ""}
              onChange={(e) => set("velatorioAddress", e.target.value)}
              placeholder="Calle, número, comuna"
            />
          </Field>

          {/* Cementerio */}
          <Field label="Cementerio">
            <input
              className={inputClass}
              value={form.cemetery ?? ""}
              onChange={(e) => set("cemetery", e.target.value)}
              placeholder="Nombre del cementerio"
            />
          </Field>
          <Field label="Dirección del cementerio">
            <input
              className={inputClass}
              value={form.cemeteryAddress ?? ""}
              onChange={(e) => set("cemeteryAddress", e.target.value)}
              placeholder="Calle, número, comuna"
            />
          </Field>

          {/* Crematorio */}
          <Field label="Crematorio">
            <input
              className={inputClass}
              value={form.crematorium ?? ""}
              onChange={(e) => set("crematorium", e.target.value)}
              placeholder="Nombre del crematorio"
            />
          </Field>
          <Field label="Dirección del crematorio">
            <input
              className={inputClass}
              value={form.crematoriumAddress ?? ""}
              onChange={(e) => set("crematoriumAddress", e.target.value)}
              placeholder="Calle, número, comuna"
            />
          </Field>
        </div>
      </Section>

      {/* Religious */}
      <Section icon={Cross} title="Preferencias Religiosas / Culturales">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferencia religiosa">
            <select
              className={inputClass}
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
              className={inputClass}
              value={form.religiousNotes ?? ""}
              onChange={(e) => set("religiousNotes", e.target.value)}
              placeholder="Ritos específicos, tradiciones..."
            />
          </Field>
        </div>
      </Section>

      {/* Urgencies */}
      <Section icon={AlertTriangle} title="Urgencias y Restricciones">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Urgencias">
            <textarea
              rows={2}
              className={inputClass + " resize-none"}
              value={form.urgencies ?? ""}
              onChange={(e) => set("urgencies", e.target.value)}
              placeholder="Urgencias de tiempo, traslado urgente, condiciones especiales..."
            />
          </Field>
          <Field label="Restricciones">
            <textarea
              rows={2}
              className={inputClass + " resize-none"}
              value={form.restrictions ?? ""}
              onChange={(e) => set("restrictions", e.target.value)}
              placeholder="Restricciones legales, sanitarias, religiosas..."
            />
          </Field>
          <Field label="Observaciones sensibles">
            <textarea
              rows={3}
              className={inputClass + " resize-none"}
              value={form.sensitiveObservations ?? ""}
              onChange={(e) => set("sensitiveObservations", e.target.value)}
              placeholder="Información confidencial sobre el fallecido o la familia..."
            />
          </Field>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          onClick={() => navigate("/fallecidos")}
          className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Save size={15} />
          {saved ? "¡Guardado!" : "Guardar Ficha"}
        </button>
      </div>
    </div>
  );
}
