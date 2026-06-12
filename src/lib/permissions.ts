import type { UserRole } from "../types";

export type NavRoute =
  | "/"
  | "/progreso"
  | "/fallecidos"
  | "/inventario"
  | "/personal"
  | "/finanzas"
  | "/flota"
  | "/admin";

export type AdminTab =
  | "perfil"
  | "usuarios"
  | "convenios"
  | "servicios"
  | "categorias"
  | "proveedores"
  | "inventario"
  | "medicos"
  | "destinos";

const ALL_ROUTES: NavRoute[] = [
  "/",
  "/progreso",
  "/fallecidos",
  "/inventario",
  "/personal",
  "/finanzas",
  "/flota",
  "/admin",
];

const ALL_ADMIN_TABS: AdminTab[] = [
  "perfil",
  "usuarios",
  "convenios",
  "servicios",
  "categorias",
  "proveedores",
  "inventario",
  "medicos",
  "destinos",
];

const ROLE_ROUTES: Partial<Record<UserRole, NavRoute[]>> = {
  maestro: ALL_ROUTES,
  administrador: ALL_ROUTES,
  vendedor: ["/", "/progreso", "/fallecidos", "/inventario", "/admin"],
  equipo_tecnico: ["/", "/progreso", "/fallecidos"],
};

const ROLE_ADMIN_TABS: Partial<Record<UserRole, AdminTab[]>> = {
  maestro: ALL_ADMIN_TABS,
  administrador: ALL_ADMIN_TABS.filter((t) => t !== "usuarios"),
  vendedor: ["convenios", "servicios", "categorias"],
  equipo_tecnico: [],
};

export function getAllowedRoutes(role: UserRole): NavRoute[] {
  return ROLE_ROUTES[role] ?? ["/"];
}

export function getAllowedAdminTabs(role: UserRole): AdminTab[] {
  return ROLE_ADMIN_TABS[role] ?? [];
}

/** Puede crear/editar/eliminar registros en esa sección */
export function canWrite(role: UserRole, section: "inventario"): boolean {
  if (section === "inventario") {
    return role === "maestro" || role === "administrador";
  }
  return true;
}
