import { useEffect, useState } from "react";
import { signIn as apiSignIn, signup as apiSignup, signOut as apiSignOut, deleteAccount as apiDeleteAccount } from "./services/auth.api";
import { getItem, saveItem, removeItem } from "@/shared/utils/storage";
import { API_BASE } from "@/shared/config";
import { Ctx } from "./hooks/user_context";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => { hydrate(); }, []);

  async function hydrate() {
    try {
      const cached = getItem("user", null);
      if (cached) setUser(cached);

      const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        saveItem("user", data.user);
      } else {
        setUser(null);
        removeItem("user");
      }
    } finally {
      setBooting(false);
    }
  }

  async function handleAuth(fn, ...args) {
    const u = await fn(...args);
    setUser(u || null);
    if (u) saveItem("user", u);
    else removeItem("user");
    return u;
  }

  const signIn = (form) => handleAuth(apiSignIn, form);
  const signup = (form) => handleAuth(apiSignup, form);

  async function signOut() {
    try {
      await apiSignOut();
    } finally {
      removeItem("user");
      setUser(null);
    }
  }

  const deleteAccount = async (form) => {
    await apiDeleteAccount(form);
    setUser(null); 
  };

  return (
    <Ctx.Provider value={{ user, booting, signIn, signup, signOut, deleteAccount }}>
      {children}
    </Ctx.Provider>
  );
}
