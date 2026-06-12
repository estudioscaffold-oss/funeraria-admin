import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { registerFuneraria } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/30 transition-all";

export default function Registro() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [funerariaName, setFunerariaName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid =
    funerariaName.trim().length > 2 &&
    fullName.trim().length > 2 &&
    email.includes("@") &&
    password.length >= 6 &&
    password === confirmPw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setLoading(true);

    const { error: err } = await registerFuneraria(
      funerariaName.trim(),
      fullName.trim(),
      email.trim().toLowerCase(),
      password,
    );

    if (err) {
      setError(
        err.includes("ya tiene una funeraria")
          ? "Este email ya tiene una funeraria registrada. Inicia sesión."
          : err.includes("already registered")
            ? "Este email ya está registrado. Inicia sesión."
            : err,
      );
      setLoading(false);
      return;
    }

    /* refrescar perfil para que AuthContext tenga tenantId */
    await refreshProfile();
    setDone(true);
    setLoading(false);

    /* redirigir al panel después de un segundo */
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#0D1E35 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg
            viewBox="0 0 220 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-40 h-auto mx-auto mb-4"
          >
            <defs>
              <linearGradient id="lgGold2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8D5B0" />
                <stop offset="45%" stopColor="#D4AF70" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
              <linearGradient id="lgDiamond2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F2E8CB" />
                <stop offset="100%" stopColor="#C9A96E" />
              </linearGradient>
            </defs>
            <path d="M6 6 L24 54 L32 36 L20 6 Z" fill="url(#lgGold2)" />
            <path d="M44 6 L26 54 L32 36 L46 6 Z" fill="url(#lgGold2)" />
            <rect
              x="27"
              y="1"
              width="10"
              height="10"
              rx="1.5"
              transform="rotate(45 32 6)"
              fill="url(#lgDiamond2)"
            />
            <text
              x="58"
              y="42"
              fontFamily="Georgia, serif"
              fontSize="28"
              fontWeight="700"
              fill="url(#lgGold2)"
              letterSpacing="-0.5"
            >
              Veladesk
            </text>
          </svg>
          <p className="text-sm" style={{ color: "#8FA3B8" }}>
            Software de gestión funeraria
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {done ? (
            /* ── Estado de éxito ── */
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                ¡Funeraria creada!
              </h2>
              <p style={{ color: "#8FA3B8", fontSize: 14 }}>
                Ingresando a tu panel...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-white mb-1">
                  Registrar nueva funeraria
                </h1>
                <p className="text-sm" style={{ color: "#8FA3B8" }}>
                  Cada funeraria tiene su propio espacio aislado.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre funeraria */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                    style={{ color: "#C9A96E" }}
                  >
                    Nombre de la funeraria
                  </label>
                  <div className="relative">
                    <Building2
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    />
                    <input
                      className={inputCls}
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="Ej: Funeraria San José"
                      value={funerariaName}
                      onChange={(e) => setFunerariaName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Nombre maestro */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                    style={{ color: "#C9A96E" }}
                  >
                    Tu nombre completo
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    />
                    <input
                      className={inputCls}
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="Nombre Apellido"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                    style={{ color: "#C9A96E" }}
                  >
                    Email (será tu usuario)
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    />
                    <input
                      type="email"
                      className={inputCls}
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="correo@funeraria.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                    style={{ color: "#C9A96E" }}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    />
                    <input
                      type={showPw ? "text" : "password"}
                      className={inputCls}
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                    style={{ color: "#C9A96E" }}
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "#8FA3B8" }}
                    />
                    <input
                      type={showPw ? "text" : "password"}
                      className={inputCls}
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="Repite la contraseña"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPw && password !== confirmPw && (
                    <p className="text-xs mt-1" style={{ color: "#F87171" }}>
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#F87171",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!valid || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  style={{
                    background: "linear-gradient(135deg,#C9A96E,#A07840)",
                    color: "#0A1628",
                    boxShadow:
                      valid && !loading
                        ? "0 4px 20px rgba(201,169,110,0.3)"
                        : "none",
                  }}
                >
                  {loading ? (
                    <span className="animate-pulse">Creando funeraria…</span>
                  ) : (
                    <>
                      Crear funeraria <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <p
                className="text-center text-sm mt-6"
                style={{ color: "#8FA3B8" }}
              >
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="font-semibold"
                  style={{ color: "#C9A96E" }}
                >
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
