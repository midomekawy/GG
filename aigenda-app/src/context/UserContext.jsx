import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "aigendaUserProfile";

const UserContext = createContext(null);

function readStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { displayName: "", avatarUrl: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { displayName: "", avatarUrl: null };
    }
    return {
      displayName:
        parsed.displayName != null ? String(parsed.displayName) : "",
      avatarUrl: parsed.avatarUrl ?? null,
    };
  } catch {
    return { displayName: "", avatarUrl: null };
  }
}

function UserProvider({ children }) {
  const [displayName, setDisplayName] = useState(
    () => readStoredProfile().displayName
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => readStoredProfile().avatarUrl
  );

  const setUser = useCallback((name, url) => {
    const nextName = name ?? "";
    const nextUrl = url ?? null;
    setDisplayName(nextName);
    setAvatarUrl(nextUrl);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ displayName: nextName, avatarUrl: nextUrl })
      );
    } catch {
      // ignore quota / private mode
    }
  }, []);

  const clearUser = useCallback(() => {
    setDisplayName("");
    setAvatarUrl(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
  }, []);

  const value = useMemo(
    () => ({
      displayName,
      avatarUrl,
      setUser,
      clearUser,
    }),
    [displayName, avatarUrl, setUser, clearUser]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export default UserProvider;

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
