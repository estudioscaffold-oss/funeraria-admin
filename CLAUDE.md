# Veladesk — Estado del Proyecto

## ¿Qué es?

App de administración de funerarias. React + TypeScript + Vite + TailwindCSS + Supabase.

## Repositorio y Deploy

- **Repo:** https://github.com/estudioscaffold-oss/funeraria-admin
- **Deploy:** Vercel (auto-deploy en push a `main`)
- **URL producción:** https://funeraria-admin-git-main-funeraria-software.vercel.app
- **Directorio local:** `/Users/renatadelaparra/Downloads/funeraria-admin`

## Supabase

- **URL:** `https://dwcuambexhmayqctrvua.supabase.co`
- **Anon key:** en `.env.local`
- **Tablas existentes:**
  - `deceased_records` — fichas de fallecidos (incluye `contract_signature jsonb`)
  - `funeral_services` — servicios del calendario
  - `staff_users` — usuarios (incluye `deceased_id text` para vincular familia)
  - `convenios`
  - `catalog_categories` — categorías y servicios del catálogo
  - `veladesk_collections` — colección genérica JSONB para: inventario, sucursales, proveedores, médicos, destinos, planes
- **Función RPC:** `delete_auth_user_by_email(user_email text)` — borra usuario de auth.users

## Stack de archivos clave

```
src/
  App.tsx                    — guard auth + routing + NoPerfil screen
  context/
    AppContext.tsx            — estado global + sync Supabase (polling 3s)
    AuthContext.tsx           — Supabase Auth (login/logout/setupMaestro)
  lib/
    supabase.ts              — cliente Supabase
    db.ts                    — CRUD Supabase (deceased, services, users, convenios, catalog, collections)
    auth.ts                  — ghostClient para crear usuarios sin afectar sesión
    theme.ts                 — temas de color
  hooks/
    useCollection.ts         — hook localStorage+Supabase para colecciones Admin
  pages/
    Login.tsx                — login + setup inicial maestro
    Admin.tsx                — panel administrador (todos los tabs)
    FamiliaPortal.tsx        — portal móvil para familias
    DeceasedDetail.tsx       — ficha del fallecido (con contrato)
    Dashboard.tsx, Progress.tsx, etc.
  components/
    layout/Sidebar.tsx       — sidebar con usuario activo + logout
    deceased/ContractDocument.tsx — contrato auto-rellenado + SignaturePad táctil
    pdf/OrdenServicioPDF.tsx
```

## Autenticación y Roles

- **Supabase Auth** (email + contraseña, sin confirmación de email)
- Roles: `maestro` | `administrador` | `vendedor` | `equipo_tecnico` | `familia`
- El maestro crea usuarios desde Admin → Usuarios con contraseña temporal
- Rol `familia` → redirige a FamiliaPortal (no ve el admin)
- Rol `familia` debe vincularse a un `deceasedId` para ver datos reales

## Portal Familia (FamiliaPortal.tsx)

- Mobile-first, diseño cálido (stone/beige)
- Countdown 72 horas desde `createdAt` del fallecido
- Muestra: etapa actual, velatorio, ceremonia, timeline de progreso, ítems del presupuesto aprobado
- **Contrato digital**: `ContractSection` con `canSign={true}`
  - Firma táctil (canvas) + nombre + RUT
  - Al firmar → `updateDeceased` → guarda en Supabase campo `contract_signature`
- Si no tiene `deceasedId` → pantalla "Sin servicio asignado"

## Contrato Digital (ContractDocument.tsx)

- `ContractPreview` — plantilla con datos de empresa (localStorage "veladesk-profile"), fallecido, contratante, tabla de presupuesto aprobado, cláusulas
- `SignaturePad` — canvas táctil (funciona con dedo), nombre, RUT
- `ContractSection` — bloque reutilizable (compact en admin, canSign en familia)
- Estado firmado se persiste en `deceased_records.contract_signature` vía Supabase

## Inventario

- Formulario en Admin tiene: categoría (del catálogo), servicio filtrado por cat., cantidad, unidad, precio CLP con desglose IVA 19%, stock mínimo (genera alerta en dashboard), proveedor (dropdown), ubicación/sucursal (dropdown)
- Presupuesto aprobado descuenta stock automáticamente

## Pendientes conocidos

- `velatorioStart` en FamiliaPortal usa `createdAt` como placeholder (no existe campo de fecha de velatorio independiente en el tipo — usar `d.createdAt` por ahora)
- Restricciones de acceso por rol (administrador, vendedor, equipo_tecnico) aún no implementadas — la usuaria dará las reglas
- PDF del contrato firmado (actualmente es solo vista HTML en modal)
- Notificaciones push cuando se firma el contrato

## Comandos útiles

```bash
cd /Users/renatadelaparra/Downloads/funeraria-admin
npm run dev          # servidor local
npm run build        # build producción
git push origin main # deploy a Vercel
```
