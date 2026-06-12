/**
 * ContractDocument — plantilla de contrato auto-rellenada + pad de firma táctil.
 * Usado tanto en la ficha del fallecido (admin) como en el Portal Familia (móvil).
 */
import { useRef, useState, useEffect, useCallback } from "react";
import {
  PenLine,
  CheckCircle2,
  RotateCcw,
  X,
  Check,
  Download,
} from "lucide-react";
import type { DeceasedRecord } from "../../types";
import { useApp } from "../../context/AppContext";

/* ── helpers ─────────────────────────────────────── */
const fmt$ = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    n,
  );
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function loadProfile() {
  try {
    const s = localStorage.getItem("veladesk-profile");
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

/* ════════════════════════════════════════════════════
   CONTRACT PREVIEW — contenido del contrato
════════════════════════════════════════════════════ */
export function ContractPreview({ record }: { record: DeceasedRecord }) {
  const profile = loadProfile();
  const approvedBudget = record.budgets?.find((b) => b.status === "aprobado");
  const totalAmount =
    approvedBudget?.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ??
    0;
  const signed = !!record.contractSignature;

  return (
    <div
      id="contract-content"
      className="bg-white text-slate-800 text-sm leading-relaxed"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between pb-6 mb-6 border-b-2 border-slate-300">
        <div>
          {profile.logo && (
            <img
              src={profile.logo}
              alt="Logo"
              className="h-12 object-contain mb-2"
            />
          )}
          <p className="font-bold text-base">{profile.name || "Funeraria"}</p>
          {profile.rut && (
            <p className="text-slate-500 text-xs">RUT: {profile.rut}</p>
          )}
          {profile.address && (
            <p className="text-slate-500 text-xs">{profile.address}</p>
          )}
          {profile.phone1 && (
            <p className="text-slate-500 text-xs">{profile.phone1}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Contrato de Servicios Funerarios
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Fecha: {fmtDate(record.createdAt)}
          </p>
          {signed && record.contractSignature && (
            <span className="inline-flex items-center gap-1 text-xs mt-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              <CheckCircle2 size={11} /> Firmado el{" "}
              {fmtDate(record.contractSignature.signedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Partes */}
      <section className="mb-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">
          Partes del contrato
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-bold uppercase text-slate-400 mb-1">
              Prestador
            </p>
            <p className="font-semibold">{profile.name || "Funeraria"}</p>
            {profile.rut && (
              <p className="text-slate-500">RUT: {profile.rut}</p>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-bold uppercase text-slate-400 mb-1">
              Contratante
            </p>
            <p className="font-semibold">{record.familyContact?.name || "—"}</p>
            <p className="text-slate-500">
              RUT: {record.familyContact?.rut || "—"}
            </p>
            <p className="text-slate-500">
              Tel: {record.familyContact?.phone || "—"}
            </p>
            <p className="text-slate-500">
              {record.familyContact?.relationship
                ? `(${record.familyContact.relationship})`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Fallecido */}
      <section className="mb-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">
          Datos del fallecido
        </h3>
        <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-400 text-xs">Nombre completo</span>
            <p className="font-semibold">{record.fullName}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs">RUT</span>
            <p>{record.rut || "—"}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs">
              Fecha de fallecimiento
            </span>
            <p>{record.deathDate ? fmtDate(record.deathDate) : "—"}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs">Lugar</span>
            <p>{record.deathPlace || "—"}</p>
          </div>
        </div>
      </section>

      {/* Servicios contratados */}
      <section className="mb-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">
          Servicios contratados
        </h3>
        {approvedBudget ? (
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 uppercase">
                  Descripción
                </th>
                <th className="text-center px-3 py-2 text-xs font-bold text-slate-500 uppercase">
                  Cant.
                </th>
                <th className="text-right px-3 py-2 text-xs font-bold text-slate-500 uppercase">
                  Precio unit.
                </th>
                <th className="text-right px-3 py-2 text-xs font-bold text-slate-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvedBudget.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {fmt$(item.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {fmt$(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300">
                <td
                  colSpan={3}
                  className="px-3 py-2 font-bold text-right text-xs uppercase"
                >
                  Total
                </td>
                <td className="px-3 py-2 font-bold text-right tabular-nums">
                  {fmt$(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-slate-400 text-sm italic">
            Sin presupuesto aprobado. El detalle de servicios se completará al
            aprobar el presupuesto.
          </p>
        )}
      </section>

      {/* Cláusulas */}
      <section className="mb-6">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">
          Condiciones del servicio
        </h3>
        <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
          <li>
            El prestador se compromete a realizar los servicios detallados con
            dignidad, respeto y profesionalismo.
          </li>
          <li>
            El contratante declara actuar en representación legal de la familia
            del fallecido y acepta las condiciones del servicio.
          </li>
          <li>
            El pago deberá realizarse según las condiciones acordadas. El
            incumplimiento podrá suspender la prestación del servicio.
          </li>
          <li>
            Cualquier modificación al servicio contratado deberá ser acordada
            por escrito entre ambas partes.
          </li>
          <li>
            Ambas partes se someten a la legislación chilena vigente para la
            resolución de controversias.
          </li>
        </ol>
      </section>

      {/* Firma */}
      <section>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <div className="h-16 border-b border-slate-300 mb-2" />
            <p className="text-xs text-slate-500 text-center">
              Firma Prestador
            </p>
            <p className="text-xs font-medium text-center">
              {profile.name || "Funeraria"}
            </p>
          </div>
          <div>
            {signed && record.contractSignature ? (
              <>
                <div className="h-16 border-b border-slate-300 mb-2 flex items-end justify-center pb-1">
                  <img
                    src={record.contractSignature.signatureData}
                    alt="Firma"
                    className="max-h-14 max-w-full object-contain"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Firma Contratante
                </p>
                <p className="text-xs font-medium text-center">
                  {record.contractSignature.signerName}
                </p>
                <p className="text-xs text-slate-400 text-center">
                  RUT: {record.contractSignature.signerRut}
                </p>
              </>
            ) : (
              <>
                <div className="h-16 border-b border-dashed border-slate-300 mb-2 flex items-center justify-center">
                  <span className="text-xs text-slate-300">
                    Pendiente de firma
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Firma Contratante
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   SIGNATURE PAD — canvas táctil para firma
════════════════════════════════════════════════════ */
interface SignaturePadProps {
  onSave: (data: {
    signerName: string;
    signerRut: string;
    signatureData: string;
  }) => void;
  onCancel: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerRut, setSignerRut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Ajustar DPI para pantallas retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1C1917";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!drawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e, canvas);
      if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setHasStrokes(true);
      }
      lastPos.current = pos;
    },
    [drawing],
  );

  const endDraw = useCallback(() => {
    setDrawing(false);
    lastPos.current = null;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const handleSave = () => {
    setError(null);
    if (!signerName.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!signerRut.trim()) {
      setError("Ingresa tu RUT.");
      return;
    }
    if (!hasStrokes) {
      setError("Dibuja tu firma en el recuadro.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");
    onSave({
      signerName: signerName.trim(),
      signerRut: signerRut.trim(),
      signatureData,
    });
  };

  const inputCls =
    "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white overflow-hidden"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-800">Firmar contrato</h2>
            <p className="text-xs text-stone-400">
              Tu firma tiene validez legal como aceptación del servicio
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center"
          >
            <X size={15} className="text-stone-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Datos del firmante */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1.5">
              Nombre completo *
            </label>
            <input
              className={inputCls}
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nombres y apellidos"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1.5">
              RUT *
            </label>
            <input
              className={inputCls}
              value={signerRut}
              onChange={(e) => setSignerRut(e.target.value)}
              placeholder="12.345.678-9"
              inputMode="numeric"
            />
          </div>

          {/* Canvas firma */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Firma *
              </label>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"
              >
                <RotateCcw size={11} /> Limpiar
              </button>
            </div>
            <div
              className="rounded-2xl overflow-hidden border-2 border-dashed"
              style={{
                borderColor: hasStrokes ? "#10B981" : "#D6D3D1",
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-full touch-none"
                style={{
                  height: "160px",
                  background: "#FAFAF9",
                  display: "block",
                }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1 text-center">
              {hasStrokes
                ? "✓ Firma registrada"
                : "Dibuja tu firma con el dedo"}
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <button
              onClick={onCancel}
              className="py-3.5 rounded-2xl text-sm font-medium border border-stone-200 text-stone-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#B8860B,#D4AF70)",
                color: "#1C0A00",
              }}
            >
              <Check size={15} /> Firmar contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CONTRACT SECTION — bloque completo para usar en
   DeceasedDetail (admin) y FamiliaPortal (familia)
════════════════════════════════════════════════════ */
interface ContractSectionProps {
  record: DeceasedRecord;
  canSign?: boolean; // true en FamiliaPortal
  compact?: boolean; // true en admin (menos espacio)
}

export function ContractSection({
  record,
  canSign = false,
  compact = false,
}: ContractSectionProps) {
  const { updateDeceased } = useApp();
  const [showContract, setShowContract] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const signed = !!record.contractSignature;

  const handleSign = (data: {
    signerName: string;
    signerRut: string;
    signatureData: string;
  }) => {
    updateDeceased(record.id, {
      contractSignature: {
        ...data,
        signedAt: new Date().toISOString(),
      },
    });
    setShowSignPad(false);
    setShowContract(false);
  };

  return (
    <>
      {/* Tarjeta de estado del contrato */}
      <div
        className={`rounded-2xl border ${
          signed
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        } ${compact ? "p-4" : "p-5"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                signed ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              {signed ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <PenLine size={20} className="text-amber-600" />
              )}
            </div>
            <div>
              <p
                className={`font-semibold text-sm ${
                  signed ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {signed ? "Contrato firmado" : "Contrato pendiente de firma"}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  signed ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {signed && record.contractSignature
                  ? `Firmado por ${record.contractSignature.signerName} · ${fmtDate(record.contractSignature.signedAt)}`
                  : "El contratante debe revisar y firmar el contrato"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => setShowContract(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                signed
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              <Download size={12} />
              {compact ? "Ver" : "Ver contrato"}
            </button>

            {canSign && !signed && (
              <button
                onClick={() => {
                  setShowContract(false);
                  setShowSignPad(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-white hover:bg-stone-900"
              >
                <PenLine size={12} /> Firmar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal del contrato */}
      {showContract && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50 sticky top-0">
              <p className="font-semibold text-stone-800">
                Contrato de Servicios Funerarios
              </p>
              <div className="flex items-center gap-2">
                {canSign && !signed && (
                  <button
                    onClick={() => {
                      setShowContract(false);
                      setShowSignPad(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: "#B8860B" }}
                  >
                    <PenLine size={12} /> Firmar
                  </button>
                )}
                <button
                  onClick={() => setShowContract(false)}
                  className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center"
                >
                  <X size={15} className="text-stone-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ContractPreview record={record} />
            </div>
          </div>
        </div>
      )}

      {/* Pad de firma */}
      {showSignPad && (
        <SignaturePad
          onSave={handleSign}
          onCancel={() => setShowSignPad(false)}
        />
      )}
    </>
  );
}
