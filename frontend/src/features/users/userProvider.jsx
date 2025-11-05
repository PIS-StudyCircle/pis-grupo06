import { useEffect, useState, useCallback } from "react";
import { signIn as apiSignIn, signup as apiSignup, signOut as apiSignOut, resetPassword as apiResetPassword } from "./services/auth.api";
import { getItem, saveItem, removeItem } from "@/shared/utils/storage";
import { API_BASE } from "@/shared/config";
import { Ctx } from "@context/UserContext";
import { getCurrentUser } from "./services/usersServices";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => { hydrate(); }, []);

  async function hydrate() {
    const cached = getItem("user", null);
    if (cached) setUser(cached);

    try {
      const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" });
      if (res.ok) {
        const { user: fetchedUser } = await res.json();
        setUser(fetchedUser);
        saveItem("user", fetchedUser);
      } else {
        setUser(null);
        removeItem("user");
      }
    } catch (err) {
      console.error("Error al obtener el usuario:", err);
      setUser(null);
      removeItem("user");
    } finally {
      setBooting(false);
    }
  }

  const refetchCurrentUser = useCallback(async () => {
    try {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
      saveItem("user", fetchedUser);
      return fetchedUser;
    } catch (err) {
      console.error("Error al obtener el usuario:", err);
      setUser(null);
      removeItem("user");
      return null;
    }
  }, []);

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
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      removeItem("user");
      setUser(null);
    }
  }

  const forgotPassword = async (formData) => {
    const response = await fetch(`${API_BASE}/users/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email: formData.email } }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "La solicitud falló");
    }
  };

  const resetPassword = async (formData) => {
    const data = await apiResetPassword(formData);
    const unpackedUser = data.user.data.attributes;
    setUser(unpackedUser);
    saveItem("user", unpackedUser);
    saveItem("token", data.token);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    saveItem("user", updatedUser);
  };

  return (
    <Ctx.Provider value={{ user, booting, signIn, signup, signOut, forgotPassword, resetPassword, updateUser, refetchCurrentUser }}>
      {children}
    </Ctx.Provider>
  );
}
