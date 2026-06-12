/**
 * Database layer — all reads/writes go through here.
 * Transforms between camelCase (frontend) ↔ snake_case (Postgres).
 */
import { supabase } from "./supabase";
import type {
  DeceasedRecord,
  FuneralService,
  AppUser,
  Convenio,
  CatalogCategory,
} from "../types";

/* ─── helpers ──────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDB = (r: DeceasedRecord): Record<string, any> => ({
  id: r.id,
  full_name: r.fullName,
  rut: r.rut,
  birth_date: r.birthDate || null,
  nationality: r.nationality,
  death_date: r.deathDate,
  death_time: r.deathTime,
  death_place: r.deathPlace,
  death_cause: r.deathCause || null,
  service_type: r.serviceType,
  status: r.status,
  velatorio: r.velatorio || null,
  velatorio_address: r.velatorioAddress || null,
  cemetery: r.cemetery || null,
  cemetery_address: r.cemeteryAddress || null,
  crematorium: r.crematorium || null,
  crematorium_address: r.crematoriumAddress || null,
  religious_preference: r.religiousPreference,
  religious_notes: r.religiousNotes || null,
  urgencies: r.urgencies || null,
  restrictions: r.restrictions || null,
  sensitive_observations: r.sensitiveObservations || null,
  assigned_staff: r.assignedStaff || null,
  assigned_technical_ids: r.assignedTechnicalIds ?? [],
  assigned_vehicle_ids: r.assignedVehicleIds ?? [],
  family_contact: r.familyContact,
  documents: r.documents,
  budgets: r.budgets,
  payments: r.payments,
  tasks: r.tasks,
  contract_signature: r.contractSignature ?? null,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromDB = (r: Record<string, any>): DeceasedRecord => ({
  id: r.id,
  fullName: r.full_name,
  rut: r.rut,
  birthDate: r.birth_date ?? "",
  nationality: r.nationality ?? "Chilena",
  deathDate: r.death_date,
  deathTime: r.death_time,
  deathPlace: r.death_place,
  deathCause: r.death_cause ?? "",
  serviceType: r.service_type,
  status: r.status,
  velatorio: r.velatorio ?? "",
  velatorioAddress: r.velatorio_address ?? "",
  cemetery: r.cemetery ?? "",
  cemeteryAddress: r.cemetery_address ?? "",
  crematorium: r.crematorium ?? "",
  crematoriumAddress: r.crematorium_address ?? "",
  religiousPreference: r.religious_preference,
  religiousNotes: r.religious_notes ?? "",
  urgencies: r.urgencies ?? "",
  restrictions: r.restrictions ?? "",
  sensitiveObservations: r.sensitive_observations ?? "",
  assignedStaff: r.assigned_staff ?? "",
  assignedTechnicalIds: r.assigned_technical_ids ?? [],
  assignedVehicleIds: r.assigned_vehicle_ids ?? [],
  familyContact: r.family_contact ?? {
    name: "",
    rut: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  },
  documents: r.documents ?? [],
  budgets: r.budgets ?? [],
  payments: r.payments ?? [],
  tasks: r.tasks ?? [],
  contractSignature: r.contract_signature ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

/* ─── deceased ─────────────────────────────────────── */
export const dbDeceased = {
  getAll: async (): Promise<DeceasedRecord[]> => {
    let q = supabase
      .from("deceased_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (currentTenantId) q = q.eq("tenant_id", currentTenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(fromDB);
  },

  create: async (r: DeceasedRecord): Promise<void> => {
    const { error } = await supabase.from("deceased_records").insert(toDB(r));
    if (error) throw error;
  },

  update: async (id: string, patch: Partial<DeceasedRecord>): Promise<void> => {
    // Build a partial toDB from patch
    const full = { ...patch, id } as DeceasedRecord;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbPatch: Record<string, any> = {};
    if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName;
    if (patch.rut !== undefined) dbPatch.rut = patch.rut;
    if (patch.birthDate !== undefined) dbPatch.birth_date = patch.birthDate;
    if (patch.nationality !== undefined)
      dbPatch.nationality = patch.nationality;
    if (patch.deathDate !== undefined) dbPatch.death_date = patch.deathDate;
    if (patch.deathTime !== undefined) dbPatch.death_time = patch.deathTime;
    if (patch.deathPlace !== undefined) dbPatch.death_place = patch.deathPlace;
    if (patch.deathCause !== undefined) dbPatch.death_cause = patch.deathCause;
    if (patch.serviceType !== undefined)
      dbPatch.service_type = patch.serviceType;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.velatorio !== undefined) dbPatch.velatorio = patch.velatorio;
    if (patch.velatorioAddress !== undefined)
      dbPatch.velatorio_address = patch.velatorioAddress;
    if (patch.cemetery !== undefined) dbPatch.cemetery = patch.cemetery;
    if (patch.cemeteryAddress !== undefined)
      dbPatch.cemetery_address = patch.cemeteryAddress;
    if (patch.crematorium !== undefined)
      dbPatch.crematorium = patch.crematorium;
    if (patch.crematoriumAddress !== undefined)
      dbPatch.crematorium_address = patch.crematoriumAddress;
    if (patch.religiousPreference !== undefined)
      dbPatch.religious_preference = patch.religiousPreference;
    if (patch.religiousNotes !== undefined)
      dbPatch.religious_notes = patch.religiousNotes;
    if (patch.urgencies !== undefined) dbPatch.urgencies = patch.urgencies;
    if (patch.restrictions !== undefined)
      dbPatch.restrictions = patch.restrictions;
    if (patch.sensitiveObservations !== undefined)
      dbPatch.sensitive_observations = patch.sensitiveObservations;
    if (patch.assignedStaff !== undefined)
      dbPatch.assigned_staff = patch.assignedStaff;
    if (patch.familyContact !== undefined)
      dbPatch.family_contact = patch.familyContact;
    if (patch.documents !== undefined) dbPatch.documents = patch.documents;
    if (patch.budgets !== undefined) dbPatch.budgets = patch.budgets;
    if (patch.payments !== undefined) dbPatch.payments = patch.payments;
    if (patch.tasks !== undefined) dbPatch.tasks = patch.tasks;
    if (patch.contractSignature !== undefined)
      dbPatch.contract_signature = patch.contractSignature ?? null;
    dbPatch.updated_at = new Date().toISOString();
    void full;
    const { error } = await supabase
      .from("deceased_records")
      .update(dbPatch)
      .eq("id", id);
    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("deceased_records")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

/* ─── funeral services ─────────────────────────────── */
export const dbServices = {
  getAll: async (): Promise<FuneralService[]> => {
    let q = supabase.from("funeral_services").select("*");
    if (currentTenantId) q = q.eq("tenant_id", currentTenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      deceasedId: r.deceased_id,
      deceasedName: r.deceased_name,
      serviceType: r.service_type,
      startDate: r.start_date,
      endDate: r.end_date,
      location: r.location,
      notes: r.notes,
      status: r.status,
      color: r.color,
    }));
  },

  create: async (s: FuneralService): Promise<void> => {
    const { error } = await supabase.from("funeral_services").insert({
      id: s.id,
      deceased_id: s.deceasedId,
      deceased_name: s.deceasedName,
      service_type: s.serviceType,
      start_date: s.startDate,
      end_date: s.endDate,
      location: s.location,
      notes: s.notes,
      status: s.status,
      color: s.color,
    });
    if (error) throw error;
  },

  update: async (id: string, s: Partial<FuneralService>): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: Record<string, any> = {};
    if (s.serviceType !== undefined) p.service_type = s.serviceType;
    if (s.startDate !== undefined) p.start_date = s.startDate;
    if (s.endDate !== undefined) p.end_date = s.endDate;
    if (s.location !== undefined) p.location = s.location;
    if (s.notes !== undefined) p.notes = s.notes;
    if (s.status !== undefined) p.status = s.status;
    if (s.color !== undefined) p.color = s.color;
    const { error } = await supabase
      .from("funeral_services")
      .update(p)
      .eq("id", id);
    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("funeral_services")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

/* ─── staff users ──────────────────────────────────── */
export const dbUsers = {
  getAll: async (): Promise<AppUser[]> => {
    let q = supabase.from("staff_users").select("*").order("full_name");
    if (currentTenantId) q = q.eq("tenant_id", currentTenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      sucursal: r.sucursal,
      active: r.active,
      deceasedId: r.deceased_id ?? undefined,
      createdAt: r.created_at,
    }));
  },

  upsert: async (u: AppUser): Promise<void> => {
    const { error } = await supabase.from("staff_users").upsert({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      sucursal: u.sucursal,
      active: u.active,
      deceased_id: u.deceasedId ?? null,
      created_at: u.createdAt,
    });
    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("staff_users").delete().eq("id", id);
    if (error) throw error;
  },

  // Elimina también la cuenta de Supabase Auth via función SQL
  deleteAuth: async (email: string): Promise<void> => {
    await supabase.rpc("delete_auth_user_by_email", { user_email: email });
    // No lanzamos error si falla (la cuenta puede no existir en Auth)
  },
};

/* ─── convenios ────────────────────────────────────── */
export const dbConvenios = {
  getAll: async (): Promise<Convenio[]> => {
    let q = supabase.from("convenios").select("*").order("name");
    if (currentTenantId) q = q.eq("tenant_id", currentTenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      entity: r.entity,
      contactName: r.contact_name,
      contactPhone: r.contact_phone,
      contactEmail: r.contact_email,
      discountPct: r.discount_pct,
      description: r.description,
      startDate: r.start_date,
      endDate: r.end_date,
      active: r.active,
    }));
  },

  upsert: async (c: Convenio): Promise<void> => {
    const { error } = await supabase.from("convenios").upsert({
      id: c.id,
      name: c.name,
      entity: c.entity,
      contact_name: c.contactName,
      contact_phone: c.contactPhone,
      contact_email: c.contactEmail,
      discount_pct: c.discountPct,
      description: c.description,
      start_date: c.startDate,
      end_date: c.endDate || null,
      active: c.active,
    });
    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("convenios").delete().eq("id", id);
    if (error) throw error;
  },
};

/* ─── tenant activo (se setea desde AuthContext al autenticar) ─ */
export let currentTenantId: string | null = null;
export function setCurrentTenantId(id: string | null) {
  currentTenantId = id;
}

/* ─── colecciones genéricas ────────────────────────── */
export const dbCollections = {
  get: async <T>(key: string, def: T): Promise<T> => {
    let query = supabase
      .from("veladesk_collections")
      .select("data")
      .eq("key", key);
    if (currentTenantId) query = query.eq("tenant_id", currentTenantId);
    const { data, error } = await query.maybeSingle();
    if (error || !data) return def;
    return data.data as T;
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    const row: Record<string, unknown> = {
      key,
      data: value,
      updated_at: new Date().toISOString(),
    };
    /* incluir tenant_id explícito para que el upsert (key, tenant_id) funcione */
    if (currentTenantId) row.tenant_id = currentTenantId;

    const { error } = await supabase
      .from("veladesk_collections")
      .upsert(row, { onConflict: "key,tenant_id" });
    if (error) throw error;
  },
};

/* ─── catalog ──────────────────────────────────────── */
export const dbCatalog = {
  getAll: async (): Promise<CatalogCategory[]> => {
    let q = supabase
      .from("catalog_categories")
      .select("*")
      .order("order_index");
    if (currentTenantId) q = q.eq("tenant_id", currentTenantId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      items: r.items ?? [],
    }));
  },

  upsert: async (c: CatalogCategory, orderIndex: number): Promise<void> => {
    const { error } = await supabase.from("catalog_categories").upsert({
      id: c.id,
      name: c.name,
      items: c.items,
      order_index: orderIndex,
    });
    if (error) throw error;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("catalog_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
