import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type {
  DeceasedRecord,
  FuneralService,
  Quote,
  PaymentRecord,
  DeceasedBudget,
  CatalogCategory,
  CatalogItem,
  AppUser,
  Convenio,
  ProcessTask,
  InventoryItem,
  InventoryAuditEntry,
  AuditAction,
  Sucursal,
} from "../types";
import {
  mockDeceased,
  mockServices,
  mockCatalog,
  mockUsers,
  mockConvenios,
  MOCK_INVENTORY_ITEMS,
  MOCK_SUCURSALES,
} from "../utils/mockData";
import {
  dbDeceased,
  dbServices,
  dbUsers,
  dbConvenios,
  dbCatalog,
  dbCollections,
} from "../lib/db";

const IS_ONLINE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== "REEMPLAZA_CON_TU_URL"
);

/* ── localStorage helpers ─────────────────────── */
function lsLoad<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}
function lsSave<T>(key: string, v: T) {
  localStorage.setItem(key, JSON.stringify(v));
}

interface AppContextType {
  loading: boolean;
  deceased: DeceasedRecord[];
  services: FuneralService[];
  quotes: Quote[];
  users: AppUser[];
  convenios: Convenio[];
  catalog: CatalogCategory[];
  /* inventory */
  inventory: InventoryItem[];
  inventoryLog: InventoryAuditEntry[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem, notes?: string) => void;
  deleteInventoryItem: (id: string) => void;
  adjustInventoryStock: (
    id: string,
    newQty: number,
    action: AuditAction,
    notes?: string,
  ) => void;
  /* sucursales */
  sucursales: Sucursal[];
  addSucursal: (s: Sucursal) => void;
  updateSucursal: (id: string, s: Partial<Sucursal>) => void;
  deleteSucursal: (id: string) => void;
  addDeceased: (r: DeceasedRecord) => void;
  updateDeceased: (id: string, r: Partial<DeceasedRecord>) => void;
  deleteDeceased: (id: string) => void;
  addService: (s: FuneralService) => void;
  updateService: (id: string, s: Partial<FuneralService>) => void;
  deleteService: (id: string) => void;
  addQuote: (q: Quote) => void;
  updateQuote: (id: string, q: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addBudget: (deceasedId: string, b: DeceasedBudget) => void;
  updateBudget: (deceasedId: string, b: DeceasedBudget) => void;
  deleteBudget: (deceasedId: string, budgetId: string) => void;
  addPayment: (deceasedId: string, p: PaymentRecord) => void;
  deletePayment: (deceasedId: string, paymentId: string) => void;
  addTask: (deceasedId: string, task: ProcessTask) => void;
  updateTask: (deceasedId: string, task: ProcessTask) => void;
  deleteTask: (deceasedId: string, taskId: string) => void;
  setTaskStatus: (
    deceasedId: string,
    taskId: string,
    status: ProcessTask["status"],
  ) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  addCatalogItem: (categoryId: string, item: Omit<CatalogItem, "id">) => void;
  updateCatalogItem: (categoryId: string, item: CatalogItem) => void;
  deleteCatalogItem: (categoryId: string, itemId: string) => void;
  addUser: (u: AppUser) => void;
  updateUser: (id: string, u: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  addConvenio: (c: Convenio) => void;
  updateConvenio: (id: string, c: Partial<Convenio>) => void;
  deleteConvenio: (id: string) => void;
  /* stock warnings — items del presupuesto sin match en inventario */
  stockWarnings: string[];
  clearStockWarnings: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { authUser, loading: authLoading } = useAuth();
  const tenantId = authUser?.tenantId ?? null;
  const [loading, setLoading] = useState(IS_ONLINE);
  /* C4 — bloquea polling mientras hay escrituras en vuelo */
  const writePending = useRef(0);
  /* C3 — items del presupuesto sin coincidencia en inventario */
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);
  const clearStockWarnings = () => setStockWarnings([]);
  const [deceased, setDeceased] = useState<DeceasedRecord[]>(
    IS_ONLINE ? [] : mockDeceased,
  );
  const [services, setServices] = useState<FuneralService[]>(
    IS_ONLINE ? [] : mockServices,
  );
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<AppUser[]>(IS_ONLINE ? [] : mockUsers);
  const [convenios, setConvenios] = useState<Convenio[]>(
    IS_ONLINE ? [] : mockConvenios,
  );
  const [catalog, setCatalog] = useState<CatalogCategory[]>(() => {
    if (IS_ONLINE) return [];
    const saved = lsLoad<CatalogCategory[]>("veladesk-catalog", []);
    if (saved.length > 0) return saved;
    lsSave("veladesk-catalog", mockCatalog);
    return mockCatalog;
  });

  /* inventory + audit — localStorage sólo en modo offline */
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    IS_ONLINE ? [] : lsLoad("veladesk-inventory", MOCK_INVENTORY_ITEMS),
  );
  const [inventoryLog, setInventoryLog] = useState<InventoryAuditEntry[]>(() =>
    IS_ONLINE ? [] : lsLoad("veladesk-inventory-log", []),
  );

  /* sucursales — localStorage sólo en modo offline */
  const [sucursales, setSucursales] = useState<Sucursal[]>(() =>
    IS_ONLINE ? [] : lsLoad("veladesk-sucursales", MOCK_SUCURSALES),
  );

  /* ── helpers ── */
  const saveInventory = (next: InventoryItem[]) => {
    setInventory(next);
    lsSave("veladesk-inventory", next);
    if (IS_ONLINE)
      dbCollections.set("veladesk-inventory", next).catch(console.error);
  };
  const appendLog = (entry: Omit<InventoryAuditEntry, "id" | "date">) => {
    const full: InventoryAuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setInventoryLog((p) => {
      const next = [full, ...p].slice(0, 500);
      lsSave("veladesk-inventory-log", next);
      if (IS_ONLINE)
        dbCollections.set("veladesk-inventory-log", next).catch(console.error);
      return next;
    });
  };

  /* ── inventory CRUD ── */
  const addInventoryItem = (item: InventoryItem) => {
    saveInventory([item, ...inventory]);
    appendLog({
      itemId: item.id,
      itemName: item.name,
      action: "crear",
      quantityAfter: item.quantity,
    });
  };
  const updateInventoryItem = (item: InventoryItem, notes?: string) => {
    const prev = inventory.find((i) => i.id === item.id);
    saveInventory(inventory.map((i) => (i.id === item.id ? item : i)));
    appendLog({
      itemId: item.id,
      itemName: item.name,
      action: "editar",
      quantityBefore: prev?.quantity,
      quantityAfter: item.quantity,
      notes,
    });
  };
  const deleteInventoryItem = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    saveInventory(inventory.filter((i) => i.id !== id));
    if (item)
      appendLog({
        itemId: id,
        itemName: item.name,
        action: "eliminar",
        quantityBefore: item.quantity,
      });
  };
  const adjustInventoryStock = (
    id: string,
    newQty: number,
    action: AuditAction,
    notes?: string,
  ) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const updated = {
      ...item,
      quantity: newQty,
      updatedAt: new Date().toISOString(),
    };
    saveInventory(inventory.map((i) => (i.id === id ? updated : i)));
    appendLog({
      itemId: id,
      itemName: item.name,
      action,
      quantityBefore: item.quantity,
      quantityAfter: newQty,
      notes,
    });
  };

  /* ── sucursales CRUD ── */
  const saveSucursales = (next: Sucursal[]) => {
    setSucursales(next);
    lsSave("veladesk-sucursales", next);
    if (IS_ONLINE)
      dbCollections.set("veladesk-sucursales", next).catch(console.error);
  };
  const addSucursal = (s: Sucursal) => saveSucursales([...sucursales, s]);
  const updateSucursal = (id: string, s: Partial<Sucursal>) =>
    saveSucursales(sucursales.map((x) => (x.id === id ? { ...x, ...s } : x)));
  const deleteSucursal = (id: string) =>
    saveSucursales(sucursales.filter((x) => x.id !== id));

  /* ── load from Supabase on mount + polling every 3 seconds ── */
  /* reset state when tenant changes (logout / switch account) */
  useEffect(() => {
    if (!IS_ONLINE || authLoading) return;
    if (!tenantId) {
      setDeceased([]);
      setServices([]);
      setUsers([]);
      setConvenios([]);
      setCatalog([]);
      setInventory([]);
      setInventoryLog([]);
      setSucursales([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadAllData = async () => {
      /* C4 — no sobreescribir mientras hay escrituras pendientes */
      if (writePending.current > 0) return;
      try {
        const [dec, svc, usr, conv, cat, inv, invLog, suc] = await Promise.all([
          dbDeceased.getAll(),
          dbServices.getAll(),
          dbUsers.getAll(),
          dbConvenios.getAll(),
          dbCatalog.getAll(),
          dbCollections.get<InventoryItem[]>("veladesk-inventory", []),
          dbCollections.get<InventoryAuditEntry[]>(
            "veladesk-inventory-log",
            [],
          ),
          dbCollections.get<Sucursal[]>("veladesk-sucursales", []),
        ]);
        /* volver a revisar después del await por si una escritura empezó */
        if (writePending.current > 0) return;
        setDeceased(dec);
        setServices(svc);
        setUsers(usr);
        setConvenios(conv);
        const finalCatalog = cat.length ? cat : mockCatalog;
        setCatalog(finalCatalog);
        lsSave("veladesk-catalog", finalCatalog);
        setInventory(inv.length ? inv : MOCK_INVENTORY_ITEMS);
        lsSave("veladesk-inventory", inv.length ? inv : MOCK_INVENTORY_ITEMS);
        setInventoryLog(invLog);
        lsSave("veladesk-inventory-log", invLog);
        setSucursales(suc.length ? suc : MOCK_SUCURSALES);
        lsSave("veladesk-sucursales", suc.length ? suc : MOCK_SUCURSALES);
        setLoading(false);
      } catch (e) {
        console.error("Supabase load error:", e);
        setLoading(false);
      }
    };

    void loadAllData();

    const pollInterval = setInterval(() => {
      void loadAllData();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [tenantId, authLoading]);

  /* ── helper: update deceased + persist JSONB arrays ── */
  const updDeceased = (id: string, patch: Partial<DeceasedRecord>) => {
    setDeceased((p) =>
      p.map((d) =>
        d.id === id
          ? { ...d, ...patch, updatedAt: new Date().toISOString() }
          : d,
      ),
    );
    if (IS_ONLINE) {
      writePending.current += 1;
      dbDeceased
        .update(id, { ...patch, updatedAt: new Date().toISOString() })
        .catch((e) => console.error("update deceased:", e))
        .finally(() => {
          writePending.current = Math.max(0, writePending.current - 1);
        });
    }
  };

  /* ── deceased ── */
  const addDeceased = (r: DeceasedRecord) => {
    setDeceased((p) => [r, ...p]);
    if (IS_ONLINE)
      dbDeceased.create(r).catch((e) => console.error("create deceased:", e));
  };
  const updateDeceased = updDeceased;
  const deleteDeceased = (id: string) => {
    setDeceased((p) => p.filter((d) => d.id !== id));
    if (IS_ONLINE) {
      dbDeceased.delete(id).catch((e) => console.error("delete deceased:", e));
      /* C1 — limpiar asignaciones huérfanas en veladesk-asignaciones */
      dbCollections
        .get<{ deceasedId: string }[]>("veladesk-asignaciones", [])
        .then((all) => {
          const filtered = all.filter((a) => a.deceasedId !== id);
          if (filtered.length !== all.length)
            dbCollections
              .set("veladesk-asignaciones", filtered)
              .catch(console.error);
        })
        .catch(console.error);
    }
  };

  /* ── services ── */
  const addService = (s: FuneralService) => {
    setServices((p) => [s, ...p]);
    if (IS_ONLINE)
      dbServices.create(s).catch((e) => console.error("create service:", e));
  };
  const updateService = (id: string, s: Partial<FuneralService>) => {
    setServices((p) => p.map((x) => (x.id === id ? { ...x, ...s } : x)));
    if (IS_ONLINE)
      dbServices
        .update(id, s)
        .catch((e) => console.error("update service:", e));
  };
  const deleteService = (id: string) => {
    setServices((p) => p.filter((s) => s.id !== id));
    if (IS_ONLINE)
      dbServices.delete(id).catch((e) => console.error("delete service:", e));
  };

  /* ── quotes (local only for now) ── */
  const addQuote = (q: Quote) => setQuotes((p) => [q, ...p]);
  const updateQuote = (id: string, q: Partial<Quote>) =>
    setQuotes((p) => p.map((x) => (x.id === id ? { ...x, ...q } : x)));
  const deleteQuote = (id: string) =>
    setQuotes((p) => p.filter((q) => q.id !== id));

  /* ── helper: descontar stock cuando presupuesto pasa a "aprobado" ── */
  const deductStockForBudget = (b: DeceasedBudget, deceasedName: string) => {
    if (b.status !== "aprobado") return;

    const unmatched: string[] = [];

    setInventory((prevInv) => {
      let next = [...prevInv];
      const logEntries: Omit<InventoryAuditEntry, "id" | "date">[] = [];

      b.items.forEach((budgetItem) => {
        if (!budgetItem.description || budgetItem.description === "__custom__")
          return;
        const nameToMatch = budgetItem.description.trim().toLowerCase();
        const idx = next.findIndex(
          (inv) => inv.name.trim().toLowerCase() === nameToMatch,
        );
        if (idx === -1) {
          /* C3 — registrar item sin coincidencia en inventario */
          unmatched.push(budgetItem.description);
          return;
        }

        const inv = next[idx];
        const newQty = Math.max(0, inv.quantity - budgetItem.quantity);
        next = next.map((item, i) =>
          i === idx
            ? { ...item, quantity: newQty, updatedAt: new Date().toISOString() }
            : item,
        );
        logEntries.push({
          itemId: inv.id,
          itemName: inv.name,
          action: "salida",
          quantityBefore: inv.quantity,
          quantityAfter: newQty,
          notes: `Presupuesto aprobado ${b.number} — ${deceasedName}`,
        });
      });

      lsSave("veladesk-inventory", next);

      // registrar en audit log
      if (logEntries.length > 0) {
        setInventoryLog((prevLog) => {
          const newEntries: InventoryAuditEntry[] = logEntries.map((e) => ({
            ...e,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          }));
          const updated = [...newEntries, ...prevLog].slice(0, 500);
          lsSave("veladesk-inventory-log", updated);
          return updated;
        });
      }

      return next;
    });

    /* C3 — avisar de items sin coincidencia (fuera de setInventory para evitar setState anidado) */
    if (unmatched.length > 0) {
      setStockWarnings(unmatched);
    }
  };

  /* ── budgets (stored inside deceased JSONB) ── */
  const addBudget = (deceasedId: string, b: DeceasedBudget) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, { budgets: [...d.budgets, b] });
    // descontar stock si se crea directamente como aprobado
    if (b.status === "aprobado") {
      deductStockForBudget(b, d.fullName);
    }
  };
  const updateBudget = (deceasedId: string, b: DeceasedBudget) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    const prev = d.budgets.find((x) => x.id === b.id);
    updDeceased(deceasedId, {
      budgets: d.budgets.map((x) => (x.id === b.id ? b : x)),
    });
    // descontar stock solo cuando el estado cambia a "aprobado" por primera vez
    if (b.status === "aprobado" && prev?.status !== "aprobado") {
      deductStockForBudget(b, d.fullName);
    }
  };
  const deleteBudget = (deceasedId: string, budgetId: string) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, {
      budgets: d.budgets.filter((b) => b.id !== budgetId),
    });
  };

  /* ── payments (stored inside deceased JSONB) ── */
  const addPayment = (deceasedId: string, p: PaymentRecord) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, { payments: [...d.payments, p] });
  };
  const deletePayment = (deceasedId: string, paymentId: string) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, {
      payments: d.payments.filter((x) => x.id !== paymentId),
    });
  };

  /* ── tasks (stored inside deceased JSONB) ── */
  const taskUpd = (
    deceasedId: string,
    fn: (t: ProcessTask[]) => ProcessTask[],
  ) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, { tasks: fn(d.tasks) });
  };
  const addTask = (deceasedId: string, task: ProcessTask) =>
    taskUpd(deceasedId, (t) => [...t, task]);
  const updateTask = (deceasedId: string, task: ProcessTask) =>
    taskUpd(deceasedId, (t) => t.map((x) => (x.id === task.id ? task : x)));
  const deleteTask = (deceasedId: string, taskId: string) =>
    taskUpd(deceasedId, (t) => t.filter((x) => x.id !== taskId));
  const setTaskStatus = (
    deceasedId: string,
    taskId: string,
    status: ProcessTask["status"],
  ) =>
    taskUpd(deceasedId, (t) =>
      t.map((x) =>
        x.id === taskId
          ? {
              ...x,
              status,
              actualStart:
                status === "en_curso" && !x.actualStart
                  ? new Date().toISOString()
                  : x.actualStart,
              actualEnd:
                status === "completado"
                  ? new Date().toISOString()
                  : x.actualEnd,
            }
          : x,
      ),
    );

  /* ── catalog ── */
  const saveCatalog = (next: CatalogCategory[]) => {
    setCatalog(next);
    lsSave("veladesk-catalog", next); // persistir SIEMPRE en localStorage
    if (IS_ONLINE) {
      next.forEach((c, i) =>
        dbCatalog
          .upsert(c, i)
          .catch((e) => console.error("upsert catalog:", e)),
      );
    }
  };
  const addCategory = (name: string) =>
    saveCatalog([...catalog, { id: crypto.randomUUID(), name, items: [] }]);
  const updateCategory = (id: string, name: string) =>
    saveCatalog(catalog.map((c) => (c.id === id ? { ...c, name } : c)));
  const deleteCategory = (id: string) => {
    saveCatalog(catalog.filter((c) => c.id !== id));
    if (IS_ONLINE)
      dbCatalog.delete(id).catch((e) => console.error("delete category:", e));
  };
  const addCatalogItem = (categoryId: string, item: Omit<CatalogItem, "id">) =>
    saveCatalog(
      catalog.map((c) =>
        c.id === categoryId
          ? { ...c, items: [...c.items, { ...item, id: crypto.randomUUID() }] }
          : c,
      ),
    );
  const updateCatalogItem = (categoryId: string, item: CatalogItem) =>
    saveCatalog(
      catalog.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)) }
          : c,
      ),
    );
  const deleteCatalogItem = (categoryId: string, itemId: string) =>
    saveCatalog(
      catalog.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c,
      ),
    );

  /* ── users ── */
  const addUser = (u: AppUser) => {
    setUsers((p) => [u, ...p]);
    if (IS_ONLINE)
      dbUsers.upsert(u).catch((e) => console.error("upsert user:", e));
  };
  const updateUser = (id: string, u: Partial<AppUser>) => {
    setUsers((p) => p.map((x) => (x.id === id ? { ...x, ...u } : x)));
    const full = users.find((x) => x.id === id);
    if (IS_ONLINE && full)
      dbUsers
        .upsert({ ...full, ...u })
        .catch((e) => console.error("update user:", e));
  };
  const deleteUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((p) => p.filter((u) => u.id !== id));
    if (IS_ONLINE) {
      dbUsers.delete(id).catch((e) => console.error("delete user:", e));
      if (user?.email)
        dbUsers
          .deleteAuth(user.email)
          .catch((e) => console.error("delete auth user:", e));
    }
  };

  /* ── convenios ── */
  const addConvenio = (c: Convenio) => {
    setConvenios((p) => [c, ...p]);
    if (IS_ONLINE)
      dbConvenios.upsert(c).catch((e) => console.error("upsert convenio:", e));
  };
  const updateConvenio = (id: string, c: Partial<Convenio>) => {
    setConvenios((p) => p.map((x) => (x.id === id ? { ...x, ...c } : x)));
    const full = convenios.find((x) => x.id === id);
    if (IS_ONLINE && full)
      dbConvenios
        .upsert({ ...full, ...c })
        .catch((e) => console.error("update convenio:", e));
  };
  const deleteConvenio = (id: string) => {
    setConvenios((p) => p.filter((c) => c.id !== id));
    if (IS_ONLINE)
      dbConvenios.delete(id).catch((e) => console.error("delete convenio:", e));
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        deceased,
        services,
        quotes,
        users,
        convenios,
        catalog,
        addDeceased,
        updateDeceased,
        deleteDeceased,
        addService,
        updateService,
        deleteService,
        addQuote,
        updateQuote,
        deleteQuote,
        addBudget,
        updateBudget,
        deleteBudget,
        addPayment,
        deletePayment,
        addTask,
        updateTask,
        deleteTask,
        setTaskStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        addUser,
        updateUser,
        deleteUser,
        addConvenio,
        updateConvenio,
        deleteConvenio,
        inventory,
        inventoryLog,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustInventoryStock,
        sucursales,
        addSucursal,
        updateSucursal,
        deleteSucursal,
        stockWarnings,
        clearStockWarnings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
