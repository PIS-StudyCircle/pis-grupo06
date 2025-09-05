import React from 'react';

const ProcessingState = () => {
  return (
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <h2 className="text-xl font-semibold mt-4">Procesando OAuth...</h2>
      <p className="text-gray-600">Intercambiando código por access token</p>
    </div>
  );
};

export default ProcessingState;