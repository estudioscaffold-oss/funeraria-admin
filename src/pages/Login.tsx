import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";

export default function Login({ isFirstTime }: { isFirstTime: boolean }) {
  const { login, setupMaestro } = useAuth();

  /* login */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* setup maestro */
  const [mode, setMode] = useState<"login" | "setup">(
    isFirstTime ? "setup" : "login",
  );
  const [fullName, setFullName] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    if (err) setError("Correo o contraseña incorrectos.");
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const err = await setupMaestro(email, password, fullName);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(160deg,#060E1A 0%,#0A1628 55%,#0D1E35 100%)",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg
            viewBox="0 0 220 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-44 h-auto mx-auto mb-4"
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
              x="60"
              y="38"
              fontFamily="Georgia,serif"
              fontSize="26"
              fontWeight="400"
              letterSpacing="0.5"
              fill="#F0EDE8"
            >
              Veladesk
            </text>
            <text
              x="60"
              y="55"
              fontFamily="Inter,Arial,sans-serif"
              fontSize="7"
              fontWeight="600"
              letterSpacing="2.5"
              fill="#C9A96E"
            >
              EL CETRO DE CONTROL
            </text>
          </svg>

          <h1 className="text-white font-semibold text-lg">
            {mode === "login" ? "Iniciar sesión" : "Configuración inicial"}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {mode === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Crea el usuario Maestro para comenzar"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={mode === "login" ? handleLogin : handleSetup}
          className="space-y-4"
        >
          {/* Nombre completo (solo setup) */}
          {mode === "setup" && (
            <div className="relative">
              <User
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                className={inputCls + " pl-11"}
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              className={inputCls + " pl-11"}
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              className={inputCls + " pl-11 pr-11"}
              type={showPw ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Confirmar contraseña (solo setup) */}
          {mode === "setup" && (
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                className={inputCls + " pl-11"}
                type={showPw ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg,#B8860B,#D4AF70,#B8860B)",
              color: "#0A1628",
            }}
          >
            {loading
              ? "Procesando…"
              : mode === "login"
                ? "Ingresar"
                : "Crear usuario Maestro"}
          </button>
        </form>

        {/* Toggle setup link (solo si no es first time) */}
        {!isFirstTime && (
          <p className="text-center text-white/30 text-xs mt-6">
            {mode === "login" ? (
              <>
                ¿Primer uso?{" "}
                <button
                  onClick={() => {
                    setMode("setup");
                    setError(null);
                  }}
                  className="text-white/50 hover:text-gold-400 underline transition-colors"
                >
                  Configurar acceso maestro
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-white/50 hover:text-gold-400 underline transition-colors"
              >
                ← Volver al login
              </button>
            )}
          </p>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          Veladesk © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
