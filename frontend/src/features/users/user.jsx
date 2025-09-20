import { useEffect, useState } from "react";
import { signIn as apiSignIn, signup as apiSignup, signOut as apiSignOut } from "./services/auth.api";
import { getItem, saveItem, removeItem } from "@/shared/utils/storage";
import { API_BASE } from "@/shared/config";
import { Ctx } from "./hooks/user_context";

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
    const response = await fetch(`${API_BASE}/users/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          reset_password_token: formData.reset_password_token,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field} ${messages.join(", ")}`);
      throw new Error(errorMessages.join("; "));
    }

    return true;
  };

  return (
    <Ctx.Provider value={{ user, booting, signIn, signup, signOut, forgotPassword, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}
