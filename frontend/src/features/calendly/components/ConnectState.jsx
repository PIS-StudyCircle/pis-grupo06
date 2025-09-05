import React from 'react';

const ConnectState = ({ onConnect, clientId, error }) => {
  const isConfigured = clientId && clientId !== 'TU_CLIENT_ID_AQUI';

  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Conectar con Calendly</h2>
      <p className="text-gray-600 mb-6">
        Conecta tu cuenta para ver tu disponibilidad real
      </p>
      
      

      <button
        onClick={onConnect}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={!isConfigured}
      >
        🔗 Conectar con Calendly
      </button>

      {!isConfigured && (
        <p className="text-red-600 text-sm mt-2">
          ⚠️ Configura tu CLIENT_ID primero
        </p>
      )}
    </div>
  );
};

export default ConnectState;