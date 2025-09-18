import React from 'react';
import { useNavigate } from 'react-router-dom';


const VisitorWelcomePage = () => {
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-[995px] w-full text-center space-y-8">
        
        {/* Título principal */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">¡Hola!</h1>
          <h2 className="text-3xl font-semibold text-gray-700">
            Nos alegra que estés acá
          </h2>
        </div>

        {/* Descripción */}
        <div className="space-y-6 px-4">
          <p className="text-xl text-gray-600 leading-relaxed">
            Study Circle es una aplicación pensada para estudiantes que
            quieren aprender y compartir conocimiento de forma sencilla.
          </p>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Podés crear o unirte a tutorías, elegir tus materias de interés
            y encontrar el espacio ideal para estudiar en comunidad,
            ayudando y recibiendo ayuda en el camino.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-4 pt-6">
          <button
            onClick={() => navigate('/registrarse')}
            className="w-full max-w-xs mx-auto block bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Registrarse
          </button>
          
          <button
            onClick={() => navigate('/iniciar_sesion')}
            className="w-full max-w-xs mx-auto block bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorWelcomePage;
  
