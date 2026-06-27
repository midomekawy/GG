import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ID_KEY = "aigendaActiveWorkspaceId";
const META_KEY = "aigendaActiveWorkspaceMeta";

const WorkspaceContext = createContext(null);

function readStoredId() {
  const raw = localStorage.getItem(ID_KEY);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readStoredMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    return o;
  } catch {
    return null;
  }
}

function WorkspaceProvider({ children }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(
    () => readStoredId()
  );
  const [meta, setMeta] = useState(() => readStoredMeta());

  const persist = useCallback((id, nextMeta) => {
    if (id != null) {
      localStorage.setItem(ID_KEY, String(id));
    } else {
      localStorage.removeItem(ID_KEY);
    }
    if (nextMeta && typeof nextMeta === "object") {
      localStorage.setItem(META_KEY, JSON.stringify(nextMeta));
    } else {
      localStorage.removeItem(META_KEY);
    }
  }, []);

  const setActiveWorkspace = useCallback(
    (ws) => {
      if (!ws || ws.id == null) {
        setActiveWorkspaceIdState(null);
        setMeta(null);
        persist(null, null);
        return;
      }
      const id = Number(ws.id);
      if (!Number.isFinite(id) || id <= 0) {
        setActiveWorkspaceIdState(null);
        setMeta(null);
        persist(null, null);
        return;
      }
      const nextMeta = {
        name: ws.name != null ? String(ws.name) : "",
        description: ws.description != null ? String(ws.description) : "",
        iconCode: ws.iconCode ?? null,
        visibility: ws.visibility,
      };
      setActiveWorkspaceIdState(id);
      setMeta(nextMeta);
      persist(id, nextMeta);
    },
    [persist]
  );

  const clearActiveWorkspace = useCallback(() => {
    setActiveWorkspaceIdState(null);
    setMeta(null);
    persist(null, null);
  }, [persist]);

  const activeWorkspace = useMemo(() => {
    if (activeWorkspaceId == null) return null;
    return {
      id: activeWorkspaceId,
      name: meta?.name ?? "",
      description: meta?.description ?? "",
      iconCode: meta?.iconCode ?? null,
      visibility: meta?.visibility,
    };
  }, [activeWorkspaceId, meta]);

  const value = useMemo(
    () => ({
      activeWorkspaceId,
      activeWorkspace,
      setActiveWorkspace,
      clearActiveWorkspace,
    }),
    [
      activeWorkspaceId,
      activeWorkspace,
      setActiveWorkspace,
      clearActiveWorkspace,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export default WorkspaceProvider;

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
