const CALENDLY_CONFIG = {
  client_id: '5oeRMl6ZqIZBUqR_kMkjnjF88mILCMItd8v5nxlaRjM',
  client_secret: '6RpplMqSjLSOYy8weXHg7T3UhMggUEpb2bMeyI3V0cw',
  redirect_uri: window.location.origin + window.location.pathname,
  scope: 'default'
};

export const generateRandomState = () => {
  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('oauth_state', state);
  return state;
};

export const initializeOAuth = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  return { code, error };
};

export const connectToCalendly = () => {
  if (!CALENDLY_CONFIG.client_id || CALENDLY_CONFIG.client_id === 'TU_CLIENT_ID_AQUI') {
    throw new Error('Por favor configura tu CLIENT_ID de Calendly en el codigo');
  }

  sessionStorage.removeItem('used_oauth_code');
  
  const currentRedirectUri = window.location.origin + window.location.pathname;
  const state = generateRandomState();
  
  console.log('Iniciando OAuth flow...');
  console.log('Redirect URI que se enviara:', currentRedirectUri);
  
  const authUrl = `https://auth.calendly.com/oauth/authorize?` +
    `client_id=${CALENDLY_CONFIG.client_id}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(currentRedirectUri)}&` +
    `scope=${CALENDLY_CONFIG.scope}&` +
    `state=${state}`;
  
  window.location.href = authUrl;
};

export const exchangeCodeForToken = async (code) => {
  const currentRedirectUri = window.location.origin + window.location.pathname;
  
  console.log('Intercambiando codigo por token...');
  console.log('Redirect URI usado:', currentRedirectUri);
  console.log('Codigo OAuth:', code.substring(0, 10) + '...');
  
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CALENDLY_CONFIG.client_id,
      client_secret: CALENDLY_CONFIG.client_secret,
      redirect_uri: currentRedirectUri,
      code: code
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error en token exchange:', response.status, errorText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const tokenData = await response.json();
  console.log('Token recibido exitosamente');
  return tokenData;
};

export const getCurrentUser = async (token) => {
  const response = await fetch('https://api.calendly.com/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error obteniendo usuario: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.resource;
};

export const getAvailability = async (accessToken, user) => {
  if (!accessToken || !user) {
    throw new Error('No hay token de acceso o usuario');
  }

  console.log('Obteniendo disponibilidad para usuario:', user.uri);
  const url = `https://api.calendly.com/user_availability_schedules?user=${encodeURIComponent(user.uri)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', response.status, errorText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('Datos de disponibilidad recibidos:', data);
  
  if (data && data.collection) {
    console.log('Schedules encontrados:', data.collection.length);
    return data.collection;
  } else {
    console.log('No se encontraron schedules en la respuesta');
    throw new Error('No se encontraron horarios de disponibilidad configurados');
  }
};

export const clearOAuthData = () => {
  sessionStorage.removeItem('used_oauth_code');
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('processing_oauth_code');
};