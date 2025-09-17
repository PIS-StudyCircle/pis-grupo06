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

  const forgotPassword = async (formData) => {

  try {
    const response = await fetch('http://localhost:3000/api/v1/users/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user: {
          email: formData.email
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "La solicitud falló");
    }

    const data = await response.json();

  } catch (error) {
    throw new Error("No se pudo procesar la solicitud. Verifica el email e inténtalo de nuevo.");
  }
  };

 const resetPassword = async (formData) => {

  try {
    const response = await fetch(`${API_BASE}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          reset_password_token: formData.reset_password_token,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessages = Object.entries(errorData.errors).map(([field, messages]) => `${field} ${messages.join(', ')}`);
      throw new Error(errorMessages.join('; '));
    }
    
    return true;

  } catch (error) {
    throw error; 
  }
};

  return (
    <Ctx.Provider value={{ user, booting, signIn, signup, signOut, forgotPassword, resetPassword }}>
      {children}
    </Ctx.Provider>
  );
}
