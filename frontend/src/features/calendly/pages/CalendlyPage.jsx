import React from "react";
import ConnectState from "../components/ConnectState";
import ProcessingState from "../components/ProcessingState";
import AuthenticatedState from "../components/AuthenticatedState";
import useCalendlyOAuth from "../hooks/useCalendlyOAuth";

export default function CalendlyPage() {
  const {
    step,
    user,
    availability,
    loading,
    error,
    handleConnect,
    handleGetAvailability,
    handleDisconnect,
    setError,
  } = useCalendlyOAuth();

  const renderContent = () => {
    switch (step) {
      case "connect":
        return (
          <ConnectState
            onConnect={handleConnect}
            clientId="5oeRMl6ZqIZBUqR_kMkjnjF88mILCMItd8v5nxlaRjM"
            error={error}
          />
        );
      case "processing":
        return <ProcessingState />;
      case "authenticated":
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
}
