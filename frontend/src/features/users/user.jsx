import { createContext, useContext, useEffect, useState } from "react";
import { signIn as apiSignIn, signup as apiSignup, signOut as apiSignOut } from "./services/auth.api";
import { getToken, setToken } from "./services/https";

const Ctx = createContext(null);
export const useUser = () => useContext(Ctx);

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStoredUser() {
  try { sessionStorage.removeItem("user"); } catch {}
}

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    hydrate();
  }, []);

  async function hydrate() {
    try {
      const token = getToken();
      const stored = readStoredUser();

      if (token && stored) {
        setUser(stored);
      } else if (!token && stored) {
        clearStoredUser();
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setBooting(false);
    }
  }

  async function signIn(email, password) {
    const u = await apiSignIn({ email, password });
    setUser(u || null);
  }

  async function signup(form) {
    const u = await apiSignup(form);
    setUser(u || null);
  }

  async function signOut() {
    try {
      await apiSignOut();
    } finally {
      clearStoredUser();
      setToken(null);
      setUser(null);
    }
  }

  return (
    <Ctx.Provider value={{ user, booting, signIn, signup, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
