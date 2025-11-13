import { useEffect, useCallback, useRef, useState } from 'react';
import { API_BASE, WS_BASE } from "@/shared/config";
import { getConsumer } from "@/channels/consumer";

export const useAvatarEdit = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());

  useEffect(() => {
    let mounted = true;

    const setupChannel = async () => {
      try {
        // Obtener token para ActionCable
        const tokenResp = await fetch(`${API_BASE}/notification_token`, {
          method: "POST",
          credentials: "include",
        });
        
        if (!tokenResp.ok) {
          console.error("Error obteniendo token de notificación");
          return;
        }

        const { notifToken } = await tokenResp.json();

        // Crear consumer con token
        const cable = getConsumer(`${WS_BASE}?notif_token=${encodeURIComponent(notifToken)}`);

        // Suscribirse al canal
        channelRef.current = cable.subscriptions.create(
          { channel: 'AvatarEditChannel' },
          {
            received(data) {
              console.log('Mensaje recibido del canal:', data);

              const { request_uuid, status, image_url, error } = data;

              // Buscar el callback pendiente
              const pendingRequest = pendingRequestsRef.current.get(request_uuid);

              if (pendingRequest) {
                if (status === 'completed') {
                  console.log('Edición completada, imagen recibida:', image_url);
                  pendingRequest.resolve(image_url);
                } else if (status === 'error') {
                  console.error('Error en edición:', error);
                  pendingRequest.reject(new Error(error || 'Error desconocido'));
                }

                // Limpiar request pendiente
                pendingRequestsRef.current.delete(request_uuid);
              } else {
                console.warn('Mensaje recibido para request_uuid desconocido:', request_uuid);
              }
            },

            connected() {
              console.log('Conectado a AvatarEditChannel');
            },

            disconnected() {
              console.log('Desconectado de AvatarEditChannel');
            }
          }
        );
      } catch (err) {
        console.error("Error configurando canal:", err);
      }
    };

    if (mounted) {
      setupChannel();
    }

    // Cleanup al desmontar
    return () => {
      mounted = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  const editAvatar = useCallback(async (imageUrl, prompt) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Descargar imagen y convertir a File
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], "avatar.jpg", { type: imageBlob.type || "image/jpeg" });

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('prompt', prompt);

      // Enviar request inicial
      const response = await fetch(`${API_BASE}/avatars/edit`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setIsProcessing(false);
        throw new Error(errorData.error || 'Error al iniciar la edición');
      }

      const { request_uuid } = await response.json();
      console.log('Job encolado, esperando resultado...', request_uuid);

      // Crear promesa que se resolverá cuando llegue el mensaje por WebSocket
      const result = await new Promise((resolve, reject) => {
        // Guardar los callbacks para este request_uuid
        pendingRequestsRef.current.set(request_uuid, { 
          resolve: (imageUrl) => {
            setIsProcessing(false);
            resolve(imageUrl);
          },
          reject: (error) => {
            setIsProcessing(false);
            reject(error);
          }
        });

        // Timeout de 5 minutos
        setTimeout(() => {
          if (pendingRequestsRef.current.has(request_uuid)) {
            pendingRequestsRef.current.delete(request_uuid);
            setIsProcessing(false);
            reject(new Error('Timeout esperando resultado'));
          }
        }, 5 * 60 * 1000);
      });

      return result;
    } catch (err) {
      setIsProcessing(false);
      setError(err.message);
      throw err;
    }
  }, []);

  const generateAvatar = useCallback(async (prompt) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/avatars/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setIsProcessing(false);
        throw new Error(errorData.error || 'Error al iniciar la generación');
      }

      const { request_uuid } = await response.json();
      console.log('Job de generación encolado...', request_uuid);

      const result = await new Promise((resolve, reject) => {
        pendingRequestsRef.current.set(request_uuid, { 
          resolve: (imageUrl) => {
            setIsProcessing(false);
            resolve(imageUrl);
          },
          reject: (error) => {
            setIsProcessing(false);
            reject(error);
          }
        });

        setTimeout(() => {
          if (pendingRequestsRef.current.has(request_uuid)) {
            pendingRequestsRef.current.delete(request_uuid);
            setIsProcessing(false);
            reject(new Error('Timeout esperando resultado'));
          }
        }, 5 * 60 * 1000);
      });

      return result;
    } catch (err) {
      setIsProcessing(false);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    editAvatar,
    generateAvatar,
    isProcessing,
    error
  };
};

