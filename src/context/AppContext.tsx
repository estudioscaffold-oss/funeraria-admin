import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
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
} from "../types";
import {
  mockDeceased,
  mockServices,
  mockCatalog,
  mockUsers,
  mockConvenios,
} from "../utils/mockData";
import {
  dbDeceased,
  dbServices,
  dbUsers,
  dbConvenios,
  dbCatalog,
} from "../lib/db";

const IS_ONLINE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== "REEMPLAZA_CON_TU_URL"
);

interface AppContextType {
  loading: boolean;
  deceased: DeceasedRecord[];
  services: FuneralService[];
  quotes: Quote[];
  users: AppUser[];
  convenios: Convenio[];
  catalog: CatalogCategory[];
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(IS_ONLINE);
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
  const [catalog, setCatalog] = useState<CatalogCategory[]>(
    IS_ONLINE ? [] : mockCatalog,
  );

  /* ── load from Supabase on mount + polling every 3 seconds ── */
  useEffect(() => {
    if (!IS_ONLINE) return;

    const loadAllData = async () => {
      try {
        const [dec, svc, usr, conv, cat] = await Promise.all([
          dbDeceased.getAll(),
          dbServices.getAll(),
          dbUsers.getAll(),
          dbConvenios.getAll(),
          dbCatalog.getAll(),
        ]);
        setDeceased(dec);
        setServices(svc);
        setUsers(usr);
        setConvenios(conv);
        setCatalog(cat.length ? cat : mockCatalog);
        setLoading(false);
      } catch (e) {
        console.error("Supabase load error:", e);
        setLoading(false);
      }
    };

    // Load immediately
    void loadAllData();

    // Poll every 3 seconds for real-time sync
    const pollInterval = setInterval(() => {
      void loadAllData();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

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
      dbDeceased
        .update(id, { ...patch, updatedAt: new Date().toISOString() })
        .catch((e) => console.error("update deceased:", e));
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
    if (IS_ONLINE)
      dbDeceased.delete(id).catch((e) => console.error("delete deceased:", e));
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

  /* ── budgets (stored inside deceased JSONB) ── */
  const addBudget = (deceasedId: string, b: DeceasedBudget) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, { budgets: [...d.budgets, b] });
  };
  const updateBudget = (deceasedId: string, b: DeceasedBudget) => {
    const d = deceased.find((x) => x.id === deceasedId);
    if (!d) return;
    updDeceased(deceasedId, {
      budgets: d.budgets.map((x) => (x.id === b.id ? b : x)),
    });
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
    setUsers((p) => p.filter((u) => u.id !== id));
    if (IS_ONLINE)
      dbUsers.delete(id).catch((e) => console.error("delete user:", e));
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
