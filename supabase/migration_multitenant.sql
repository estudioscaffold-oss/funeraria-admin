-- ═══════════════════════════════════════════════════════════════
--  VELADESK — Migración Multi-Tenant
--  Ejecutar UNA VEZ en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Tabla tenants (una fila = una funeraria) ──────────────
CREATE TABLE IF NOT EXISTS tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'basic',
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Crear tenant por defecto para los datos existentes ────
-- (todos los registros actuales quedan en esta funeraria)
INSERT INTO tenants (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Funeraria Principal')
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Agregar tenant_id a todas las tablas ─────────────────
ALTER TABLE staff_users          ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE deceased_records     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE funeral_services     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE convenios            ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE catalog_categories   ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE veladesk_collections ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- ─── 4. Asignar datos existentes al tenant por defecto ────────
UPDATE staff_users          SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE deceased_records     SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE funeral_services     SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE convenios            SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE catalog_categories   SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE veladesk_collections SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- ─── 5. Función helper: tenant del usuario actual ────────────
-- SECURITY DEFINER → corre como postgres, bypasea RLS sin loops
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM staff_users WHERE email = auth.email() LIMIT 1;
$$;

-- ─── 6. RPC pública: registrar nueva funeraria ───────────────
-- Crea tenant + maestro en una sola transacción atómica.
-- Se llama desde el frontend después de que Supabase Auth crea el usuario.
CREATE OR REPLACE FUNCTION crear_funeraria(
  p_funeraria_name TEXT,
  p_full_name      TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id   UUID;
  v_email     TEXT;
BEGIN
  -- Obtener datos del usuario autenticado actual
  v_user_id := auth.uid();
  v_email   := auth.email();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Verificar que este usuario no sea ya maestro de otro tenant
  IF EXISTS (
    SELECT 1 FROM staff_users WHERE email = v_email AND role = 'maestro'
  ) THEN
    RAISE EXCEPTION 'Este email ya tiene una funeraria registrada';
  END IF;

  -- Crear el tenant
  INSERT INTO tenants (name)
  VALUES (p_funeraria_name)
  RETURNING id INTO v_tenant_id;

  -- Crear el usuario maestro vinculado al tenant
  INSERT INTO staff_users (id, email, full_name, role, tenant_id, active, created_at)
  VALUES (v_user_id, v_email, p_full_name, 'maestro', v_tenant_id, true, now());

  RETURN v_tenant_id;
END;
$$;

-- ─── 7. DEFAULT automático de tenant_id en nuevos registros ──
-- Así el frontend no necesita pasar tenant_id explícitamente
ALTER TABLE deceased_records     ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE funeral_services     ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE convenios            ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE catalog_categories   ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE veladesk_collections ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
-- staff_users NO tiene DEFAULT porque el frontend debe ser explícito al crear usuarios

-- ─── 8. Restricción: un solo maestro por funeraria ───────────
CREATE UNIQUE INDEX IF NOT EXISTS one_maestro_per_tenant
  ON staff_users (tenant_id)
  WHERE role = 'maestro';

-- ─── 9. Fix clave única de veladesk_collections ──────────────
-- Antes era solo (key). Ahora debe ser (key, tenant_id).
-- Primero eliminar el índice antiguo si existe
DROP INDEX IF EXISTS veladesk_collections_key_key;
ALTER TABLE veladesk_collections DROP CONSTRAINT IF EXISTS veladesk_collections_pkey;
ALTER TABLE veladesk_collections DROP CONSTRAINT IF EXISTS veladesk_collections_key_unique;

-- Crear nueva PK o índice único compuesto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'veladesk_collections'
    AND indexname = 'veladesk_collections_key_tenant_idx'
  ) THEN
    CREATE UNIQUE INDEX veladesk_collections_key_tenant_idx
      ON veladesk_collections (key, tenant_id);
  END IF;
END $$;

-- ─── 10. Habilitar RLS en todas las tablas ───────────────────
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE deceased_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE funeral_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE veladesk_collections ENABLE ROW LEVEL SECURITY;

-- ─── 11. Políticas RLS ───────────────────────────────────────

-- tenants: cada usuario ve solo su propio tenant
DROP POLICY IF EXISTS "tenant_own" ON tenants;
CREATE POLICY "tenant_own" ON tenants
  FOR ALL USING (id = get_current_tenant_id());

-- staff_users: siempre puede leer su propio registro (email) +
-- todos del mismo tenant. Solo maestro/admin pueden insertar.
DROP POLICY IF EXISTS "staff_select" ON staff_users;
CREATE POLICY "staff_select" ON staff_users
  FOR SELECT USING (
    email = auth.email()
    OR tenant_id = get_current_tenant_id()
  );

DROP POLICY IF EXISTS "staff_insert" ON staff_users;
CREATE POLICY "staff_insert" ON staff_users
  FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

DROP POLICY IF EXISTS "staff_update" ON staff_users;
CREATE POLICY "staff_update" ON staff_users
  FOR UPDATE USING (tenant_id = get_current_tenant_id());

DROP POLICY IF EXISTS "staff_delete" ON staff_users;
CREATE POLICY "staff_delete" ON staff_users
  FOR DELETE USING (tenant_id = get_current_tenant_id());

-- deceased_records
DROP POLICY IF EXISTS "deceased_tenant" ON deceased_records;
CREATE POLICY "deceased_tenant" ON deceased_records
  FOR ALL USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- funeral_services
DROP POLICY IF EXISTS "services_tenant" ON funeral_services;
CREATE POLICY "services_tenant" ON funeral_services
  FOR ALL USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- convenios
DROP POLICY IF EXISTS "convenios_tenant" ON convenios;
CREATE POLICY "convenios_tenant" ON convenios
  FOR ALL USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- catalog_categories
DROP POLICY IF EXISTS "catalog_tenant" ON catalog_categories;
CREATE POLICY "catalog_tenant" ON catalog_categories
  FOR ALL USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- veladesk_collections
DROP POLICY IF EXISTS "collections_tenant" ON veladesk_collections;
CREATE POLICY "collections_tenant" ON veladesk_collections
  FOR ALL USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- ─── Verificación final ──────────────────────────────────────
SELECT
  'tenants'              AS tabla, COUNT(*) AS filas FROM tenants
UNION ALL SELECT 'staff_users',          COUNT(*) FROM staff_users
UNION ALL SELECT 'deceased_records',     COUNT(*) FROM deceased_records
UNION ALL SELECT 'veladesk_collections', COUNT(*) FROM veladesk_collections;
