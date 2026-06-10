export type ThemeKey = "blue" | "green" | "coffee";

export const THEMES: Record<
  ThemeKey,
  {
    label: string;
    hex: string;
    brand: string;
    brandDark: string;
    brandMid: string;
    brandText: string;
  }
> = {
  blue: {
    label: "Azul marino",
    hex: "#0D1820",
    brand: "#0D1820",
    brandDark: "#070F15",
    brandMid: "#183048",
    brandText: "#D4AF70",
  },
  green: {
    label: "Verde bosque",
    hex: "#1A3728",
    brand: "#1A3728",
    brandDark: "#0F2118",
    brandMid: "#244F38",
    brandText: "#D4AF70",
  },
  coffee: {
    label: "Café tostado",
    hex: "#61564A",
    brand: "#61564A",
    brandDark: "#3D3530",
    brandMid: "#7A6D62",
    brandText: "#E8D5B0",
  },
};

export function applyTheme(key: ThemeKey) {
  const t = THEMES[key];
  const r = document.documentElement;
  r.style.setProperty("--brand", t.brand);
  r.style.setProperty("--brand-dark", t.brandDark);
  r.style.setProperty("--brand-mid", t.brandMid);
  r.style.setProperty("--brand-text", t.brandText);
  localStorage.setItem("veladesk-theme", key);
}

export function loadTheme() {
  const saved = (localStorage.getItem("veladesk-theme") ?? "blue") as ThemeKey;
  applyTheme(saved);
  return saved;
}
