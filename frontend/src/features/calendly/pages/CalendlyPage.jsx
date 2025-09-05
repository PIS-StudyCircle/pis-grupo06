import React, { useState, useEffect } from 'react';
import ConnectState from '../components/ConnectState';
import ProcessingState from '../components/ProcessingState';
import AuthenticatedState from '../components/AuthenticatedState';
import { 
  initializeOAuth, 
  connectToCalendly, 
  exchangeCodeForToken, 
  getCurrentUser, 
  getAvailability,
  clearOAuthData 
} from '../services/calendly';

const CalendlyPage = () => {
  const [step, setStep] = useState('connect');
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { code, error } = initializeOAuth();
    
    if (error) {
      setError(`Error de OAuth: ${error}`);
      return;
    }
    
    if (code && step === 'connect') {
      const processedCode = sessionStorage.getItem('processing_oauth_code');
      if (processedCode === code) {
        console.log('⚠️ Código OAuth ya está siendo procesado, ignorando...');
        return;
      }
      
      sessionStorage.setItem('processing_oauth_code', code);
      handleOAuthCallback(code);
    }
  }, [step]);

  const handleOAuthCallback = async (code) => {
    setStep('processing');
    setError(null);
    
    try {
      if (sessionStorage.getItem('used_oauth_code') === code) {
        throw new Error('Código de autorización ya utilizado. Inicia el proceso OAuth nuevamente.');
      }
      
      const tokenData = await exchangeCodeForToken(code);
      
      if (tokenData.access_token) {
        sessionStorage.setItem('used_oauth_code', code);
        sessionStorage.removeItem('processing_oauth_code');
        
        setAccessToken(tokenData.access_token);
        
        const userData = await getCurrentUser(tokenData.access_token);
        setUser(userData);
        
        setStep('authenticated');
        
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error('No se recibió access token');
      }
    } catch (err) {
      console.error('Error en OAuth callback:', err);
      setError('Error conectando con Calendly: ' + err.message);
      setStep('connect');
      sessionStorage.removeItem('processing_oauth_code');
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
      console.error('💥 Error obteniendo disponibilidad:', err);
      setError('Error obteniendo disponibilidad: ' + err.message);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setUser(null);
    setAvailability([]);
    setStep('connect');
    setError(null);
    clearOAuthData();
  };

  const renderContent = () => {
    switch (step) {
      case 'connect':
        return (
          <ConnectState 
            onConnect={handleConnect}
            clientId="5oeRMl6ZqIZBUqR_kMkjnjF88mILCMItd8v5nxlaRjM"
            error={error}
          />
        );
      case 'processing':
        return <ProcessingState />;
      case 'authenticated':
        return (
          <AuthenticatedState
            user={user}
            availability={availability}
            loading={loading}
            onGetAvailability={handleGetAvailability}
            onDisconnect={handleDisconnect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h1 className="text-xl font-bold">Calendly Integration - OAuth Real</h1>
          <p className="text-sm text-gray-600">
            Estado: <span className="font-medium">{step}</span>
          </p>
        </div>
        
        {renderContent()}

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-1">Error:</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default CalendlyPage;