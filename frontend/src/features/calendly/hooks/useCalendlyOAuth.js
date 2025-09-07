import { useState, useEffect } from "react";
import {
  initializeOAuth,
  connectToCalendly,
  exchangeCodeForToken,
  getCurrentUser,
  getAvailability,
  getEvents,
  clearOAuthData,
} from "../services/calendly";

export default function useCalendlyOAuth() {
  const [step, setStep] = useState("connect");
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [events, setEvents] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    const { code, error } = initializeOAuth();

    if (error) {
      setError(`Error de OAuth: ${error}`);
      return;
    }

    if (code && step === "connect") {
      const processedCode = sessionStorage.getItem("processing_oauth_code");
      if (processedCode === code) {
        console.log("⚠️ Código OAuth ya está siendo procesado, ignorando...");
        return;
      }

      sessionStorage.setItem("processing_oauth_code", code);
      handleOAuthCallback(code);
    }
  }, [step]);

  const handleOAuthCallback = async (code) => {
    setStep("processing");
    setError(null);

    try {
      if (sessionStorage.getItem("used_oauth_code") === code) {
        throw new Error(
          "Código de autorización ya utilizado. Inicia el proceso OAuth nuevamente."
        );
      }

      const tokenData = await exchangeCodeForToken(code);

      if (tokenData.access_token) {
        sessionStorage.setItem("used_oauth_code", code);
        sessionStorage.removeItem("processing_oauth_code");

        setAccessToken(tokenData.access_token);

        const userData = await getCurrentUser(tokenData.access_token);
        setUser(userData);

        setStep("authenticated");

        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error("No se recibió access token");
      }
    } catch (err) {
      console.error("Error en OAuth callback:", err);
      setError("Error conectando con Calendly: " + err.message);
      setStep("connect");
      sessionStorage.removeItem("processing_oauth_code");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleConnect = () => {
    try {
      connectToCalendly();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGetAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      const availabilityData = await getAvailability(accessToken, user);
      setAvailability(availabilityData);
    } catch (err) {
      console.error("💥 Error obteniendo disponibilidad:", err);
      setError("Error obteniendo disponibilidad: " + err.message);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetEvents = async () => {
    setEventsLoading(true);
    setError(null);

    try {
      const eventsData = await getEvents(accessToken, user);
      setEvents(eventsData);
    } catch (err) {
      console.error("💥 Error obteniendo eventos:", err);
      setError("Error obteniendo eventos: " + err.message);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setUser(null);
    setAvailability([]);
    setEvents([]);
    setStep("connect");
    setError(null);
    clearOAuthData();
  };

  return {
    step,
    user,
    availability,
    events,
    accessToken,
    error,
    loading,
    eventsLoading,
    handleConnect,
    handleGetAvailability,
    handleGetEvents,
    handleDisconnect,
    setError,
  };
}
