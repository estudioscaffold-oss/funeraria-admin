import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Heart,
  FileText,
  Package,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { ContractSection } from "../components/deceased/ContractDocument";
import type { ProcessStatus, DeceasedRecord } from "../types";

/* ── Etapas del servicio ─────────────────────────── */
const ETAPAS: {
  key: ProcessStatus;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    key: "recepcion",
    label: "Recepción",
    desc: "El ser querido ha sido recibido en nuestras instalaciones con todo el respeto y cuidado que merece.",
    icon: "🕊️",
  },
  {
    key: "preparacion",
    label: "Preparación",
    desc: "Nuestro equipo realiza los cuidados de preparación y arreglo con dedicación y profesionalismo.",
    icon: "🌸",
  },
  {
    key: "velatorio",
    label: "Velatorio",
    desc: "Tiempo de recogimiento y despedida junto a familiares y amigos en un espacio íntimo y acogedor.",
    icon: "🕯️",
  },
  {
    key: "traslado",
    label: "Traslado",
    desc: "Desplazamiento al lugar final con el cortejo fúnebre coordinado por nuestro equipo.",
    icon: "🚗",
  },
  {
    key: "ceremonia",
    label: "Ceremonia",
    desc: "Celebración del servicio religioso o civil según las preferencias de la familia.",
    icon: "🙏",
  },
  {
    key: "inhumacion_cremacion",
    label: "Inhumación / Cremación",
    desc: "Etapa final del proceso, realizada con el protocolo y dignidad que corresponde.",
    icon: "🌿",
  },
  {
    key: "completado",
    label: "Servicio completado",
    desc: "El servicio ha concluido. Estamos disponibles para cualquier consulta adicional.",
    icon: "✨",
  },
];

/* ── Helper: armar datos de servicio desde DeceasedRecord ── */
function buildService(d: DeceasedRecord) {
  // Recopilar ítems aprobados de presupuestos
  const items: { name: string; category: string }[] = [];
  d.budgets?.forEach((b) => {
    if (b.status === "aprobado") {
      b.items?.forEach((item) => {
        if (item.description && item.description !== "__custom__") {
          items.push({
            name: item.description,
            category: item.category ?? "Servicio",
          });
        }
      });
    }
  });

  return {
    deceasedName: d.fullName,
    rut: d.rut ?? "",
    serviceType:
      d.serviceType === "servicio_completo"
        ? "Servicio completo"
        : d.serviceType === "inhumacion"
          ? "Inhumación"
          : d.serviceType === "cremacion"
            ? "Cremación"
            : d.serviceType === "traslado"
              ? "Traslado"
              : d.serviceType === "velatorio"
                ? "Velatorio"
                : "Servicio funerario",
    status: (d.status ?? "recepcion") as ProcessStatus,
    velatorio: d.velatorio ?? "",
    velatorioAddress: d.velatorioAddress ?? "",
    velatorioStart: d.createdAt, // placeholder hasta tener campo real
    velatorioEnd: "",
    cemetery: d.cemetery ?? "",
    cemeteryAddress: d.cemeteryAddress ?? "",
    ceremonyDate: "",
    religiousPreference:
      d.religiousPreference === "catolica"
        ? "Católica"
        : d.religiousPreference === "evangelica"
          ? "Evangélica"
          : d.religiousPreference === "ninguna"
            ? "Sin preferencia religiosa"
            : (d.religiousPreference ?? ""),
    contactName: d.assignedStaff ?? "Equipo Veladesk",
    contactPhone: d.familyContact?.phone ?? "",
    activatedAt: d.createdAt,
    items,
    tasks: d.tasks ?? [],
  };
}

/* ── Helper: etapa actual ────────────────────────── */
function etapaIndex(status: ProcessStatus): number {
  return ETAPAS.findIndex((e) => e.key === status);
}

/* ── Countdown 72h ───────────────────────────────── */
function useCountdown(activatedAt: string) {
  const expiresAt = new Date(activatedAt).getTime() + 72 * 60 * 60 * 1000;
  const [remaining, setRemaining] = useState(expiresAt - Date.now());

  useEffect(() => {
    const t = setInterval(() => setRemaining(expiresAt - Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const total = Math.max(0, remaining);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const pct = Math.min(100, (total / (72 * 3600000)) * 100);
  return { h, m, s, pct, expired: total <= 0 };
}

/* ── Formatear fecha ──────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ════════════════════════════════════════════════════
   PORTAL FAMILIA — componente principal
════════════════════════════════════════════════════ */
export default function FamiliaPortal() {
  const { authUser, logout } = useAuth();
  const { deceased } = useApp();
  const [itemsOpen, setItemsOpen] = useState(false);
  const [etapasOpen, setEtapasOpen] = useState(true);

  // Buscar el fallecido vinculado al usuario familia
  const linkedDeceased = authUser?.deceasedId
    ? deceased.find((d) => d.id === authUser.deceasedId)
    : null;

  // Construir datos (placeholder vacío si no hay vínculo todavía)
  const svc = linkedDeceased ? buildService(linkedDeceased) : null;

  // Todos los hooks deben ir antes de cualquier return condicional
  const { h, m, s, pct, expired } = useCountdown(
    svc?.activatedAt ?? new Date().toISOString(),
  );
  const curIdx = etapaIndex((svc?.status ?? "recepcion") as ProcessStatus);

  // Sin vínculo configurado
  if (!linkedDeceased || !svc) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#FAF9F7" }}
      >
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">
            Sin servicio asignado
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Tu cuenta aún no está vinculada a ningún servicio. Comunícate con la
            funeraria para completar tu registro.
          </p>
          <button
            onClick={logout}
            className="text-sm text-stone-400 hover:text-stone-600 underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">
            Acceso expirado
          </h2>
          <p className="text-stone-500 text-sm">
            El período de acceso de 72 horas ha concluido. Si necesitas más
            información, contacta directamente a la funeraria.
          </p>
          <a
            href={`tel:${svc.contactPhone}`}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: "#A07840" }}
          >
            <Phone size={15} /> Llamar a la funeraria
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Header ─────────────────────────────── */}
      <div
        className="px-5 pt-10 pb-8 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg,#1a0f05 0%,#2d1a08 40%,#3d2410 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#D4AF70,transparent)" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#D4AF70,transparent)" }}
        />

        <div className="relative">
          {/* Logo pequeño */}
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 48 48" className="w-7 h-7">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8D5B0" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
              </defs>
              <path d="M4 4 L16 36 L22 24 L14 4 Z" fill="url(#g1)" />
              <path d="M30 4 L18 36 L22 24 L32 4 Z" fill="url(#g1)" />
            </svg>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#C9A96E" }}
            >
              Veladesk
            </span>
          </div>

          <p
            className="text-xs font-medium tracking-widest uppercase mb-1"
            style={{ color: "#C9A96E" }}
          >
            Portal Familiar
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-1">
            {svc.deceasedName}
          </h1>
          <p className="text-white/50 text-sm">{svc.serviceType}</p>

          {/* Hola + logout */}
          {authUser && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white/60 text-xs">
                Hola,{" "}
                <span className="text-white/80 font-medium">
                  {authUser.fullName}
                </span>
              </p>
              <button
                onClick={logout}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Countdown ──────────────────────────── */}
      <div className="mx-4 -mt-4 rounded-2xl bg-white shadow-lg border border-stone-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
              Acceso activo
            </span>
          </div>
          <span className="text-xs text-stone-400">72 horas totales</span>
        </div>
        <div className="flex items-end gap-1 mb-3">
          <CountUnit value={h} label="h" />
          <span className="text-stone-300 text-lg mb-1">:</span>
          <CountUnit value={m} label="m" />
          <span className="text-stone-300 text-lg mb-1">:</span>
          <CountUnit value={s} label="s" />
          <span className="text-stone-400 text-sm mb-1 ml-1">restantes</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct > 30 ? "#10B981" : "#F59E0B",
            }}
          />
        </div>
      </div>

      <div className="px-4 space-y-4 pb-24">
        {/* ── Estado actual ──────────────────── */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(160,120,64,0.06)",
            border: "1px solid rgba(160,120,64,0.15)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#A07840" }}
          >
            Etapa actual
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ETAPAS[curIdx]?.icon}</span>
            <div>
              <p className="font-bold text-stone-800 text-lg leading-tight">
                {ETAPAS[curIdx]?.label}
              </p>
              <p className="text-stone-500 text-sm">{ETAPAS[curIdx]?.desc}</p>
            </div>
          </div>
        </div>

        {/* ── Info del velatorio ─────────────── */}
        {svc.velatorio && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-50">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Velatorio
              </p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <InfoRow icon={<MapPin size={14} className="text-stone-400" />}>
                <p className="text-sm font-medium text-stone-800">
                  {svc.velatorio}
                </p>
                <p className="text-xs text-stone-400">{svc.velatorioAddress}</p>
              </InfoRow>
              <InfoRow icon={<Calendar size={14} className="text-stone-400" />}>
                <p className="text-sm text-stone-700">
                  {fmtDate(svc.velatorioStart)} · {fmtTime(svc.velatorioStart)}
                </p>
                <p className="text-xs text-stone-400">
                  hasta {fmtDate(svc.velatorioEnd)} ·{" "}
                  {fmtTime(svc.velatorioEnd)}
                </p>
              </InfoRow>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(svc.velatorioAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 mx-4 mb-4 py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <MapPin size={13} /> Ver en mapa
            </a>
          </div>
        )}

        {/* ── Ceremonia ──────────────────────── */}
        {svc.ceremonyDate && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
              Ceremonia
            </p>
            <InfoRow icon={<Calendar size={14} className="text-stone-400" />}>
              <p className="text-sm font-medium text-stone-800">
                {fmtDate(svc.ceremonyDate)} · {fmtTime(svc.ceremonyDate)}
              </p>
              <p className="text-xs text-stone-400">
                {svc.religiousPreference}
              </p>
            </InfoRow>
            {svc.cemetery && (
              <InfoRow
                icon={<MapPin size={14} className="text-stone-400 mt-2.5" />}
              >
                <p className="text-sm text-stone-700 mt-2.5">{svc.cemetery}</p>
                <p className="text-xs text-stone-400">{svc.cemeteryAddress}</p>
              </InfoRow>
            )}
          </div>
        )}

        {/* ── Progreso de etapas ─────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3.5"
            onClick={() => setEtapasOpen((p) => !p)}
          >
            <div className="flex items-center gap-2">
              <Heart size={14} style={{ color: "#A07840" }} />
              <span className="text-sm font-semibold text-stone-800">
                Progreso del servicio
              </span>
            </div>
            {etapasOpen ? (
              <ChevronUp size={16} className="text-stone-400" />
            ) : (
              <ChevronDown size={16} className="text-stone-400" />
            )}
          </button>

          {etapasOpen && (
            <div className="px-4 pb-4">
              <div className="relative">
                {/* línea vertical */}
                <div
                  className="absolute left-4 top-4 bottom-4 w-0.5"
                  style={{ background: "#E7E5E4" }}
                />
                <div className="space-y-1">
                  {ETAPAS.map((etapa, i) => {
                    const done = i < curIdx;
                    const active = i === curIdx;
                    const pending = i > curIdx;
                    return (
                      <div
                        key={etapa.key}
                        className="flex items-start gap-4 py-2"
                      >
                        <div className="relative z-10 shrink-0">
                          {done ? (
                            <CheckCircle2
                              size={20}
                              style={{ color: "#10B981" }}
                              className="bg-white"
                            />
                          ) : active ? (
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                              style={{
                                borderColor: "#A07840",
                                background: "rgba(160,120,64,0.1)",
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ background: "#A07840" }}
                              />
                            </div>
                          ) : (
                            <Circle
                              size={20}
                              className="text-stone-200 bg-white"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold leading-tight ${
                              done
                                ? "text-stone-400"
                                : active
                                  ? "text-stone-800"
                                  : "text-stone-300"
                            }`}
                          >
                            {etapa.icon} {etapa.label}
                            {active && (
                              <span
                                className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(160,120,64,0.1)",
                                  color: "#A07840",
                                }}
                              >
                                En curso
                              </span>
                            )}
                          </p>
                          {(done || active) && !pending && (
                            <p className="text-xs text-stone-400 mt-0.5 leading-snug">
                              {etapa.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Ítems incluidos ────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3.5"
            onClick={() => setItemsOpen((p) => !p)}
          >
            <div className="flex items-center gap-2">
              <Package size={14} style={{ color: "#A07840" }} />
              <span className="text-sm font-semibold text-stone-800">
                Servicios incluidos
              </span>
              <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                {svc.items.length}
              </span>
            </div>
            {itemsOpen ? (
              <ChevronUp size={16} className="text-stone-400" />
            ) : (
              <ChevronDown size={16} className="text-stone-400" />
            )}
          </button>

          {itemsOpen && (
            <div className="divide-y divide-stone-50">
              {svc.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <CheckCircle2
                    size={15}
                    style={{ color: "#10B981" }}
                    className="shrink-0"
                  />
                  <div>
                    <p className="text-sm text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Contrato de servicios ──────────── */}
        <ContractSection record={linkedDeceased} canSign />

        {/* ── Contacto ───────────────────────── */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg,#1a0f05 0%,#2d1a08 100%)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#C9A96E" }}
          >
            Tu asesor
          </p>
          <p className="text-white font-semibold text-base mb-0.5">
            {svc.contactName}
          </p>
          <p className="text-white/50 text-sm mb-4">Disponible las 24 horas</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${svc.contactPhone}`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <Phone size={14} /> Llamar
            </a>
            <a
              href={`https://wa.me/${svc.contactPhone.replace(/\D/g, "")}?text=Hola,%20soy%20familiar%20de%20${encodeURIComponent(svc.deceasedName)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "#25D366", color: "white" }}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom safe area ───────────────── */}
      <div className="h-8" />
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────── */
function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-end gap-0.5">
      <span className="text-2xl font-bold tabular-nums text-stone-800">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-stone-400 mb-0.5">{label}</span>
    </div>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>{children}</div>
    </div>
  );
}
