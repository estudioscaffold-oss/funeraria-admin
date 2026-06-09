/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060E1A",
          900: "#0A1628",
          800: "#0D1E35",
          700: "#112244",
          600: "#163060",
          500: "#1A3A72",
        },
        gold: {
          50: "#FAF5E8",
          100: "#F2E8CB",
          200: "#E8D5B0",
          300: "#DEC292",
          400: "#D4AF70",
          500: "#C9A96E",
          600: "#B8924A",
          700: "#A07840",
          800: "#7A5A2E",
          900: "#4A3518",
        },
        cream: {
          50: "#FFFFFF",
          100: "#F8F5F0",
          200: "#F0EDE8",
          300: "#DDD8D0",
          400: "#B8B0A8",
          500: "#8FA3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #D4AF70 0%, #C9A96E 50%, #A07840 100%)",
        "navy-gradient": "linear-gradient(135deg, #0A1628 0%, #112244 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(17,34,68,0.9) 0%, rgba(13,30,53,0.95) 100%)",
        "glow-gold":
          "radial-gradient(ellipse at center, rgba(201,169,110,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(201,169,110,0.3), 0 4px 15px rgba(0,0,0,0.4)",
        "gold-sm": "0 0 10px rgba(201,169,110,0.2), 0 2px 8px rgba(0,0,0,0.3)",
        card: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        "card-hover":
          "0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(201,169,110,0.15)",
        "inner-gold": "inset 0 1px 0 rgba(201,169,110,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        loading: "loading 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 10px rgba(201,169,110,0.2)" },
          "50%": {
            boxShadow:
              "0 0 25px rgba(201,169,110,0.5), 0 0 50px rgba(201,169,110,0.1)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        loading: {
          "0%": { width: "0%", marginLeft: "0%" },
          "50%": { width: "60%", marginLeft: "20%" },
          "100%": { width: "0%", marginLeft: "100%" },
        },
      },
    },
  },
  plugins: [],
};
