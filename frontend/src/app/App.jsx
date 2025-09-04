import React from 'react';
// 1. Importa las herramientas de react-router-dom
import { Routes, Route, Navigate } from 'react-router-dom';

// 2. Importa tus dos componentes de formulario
import LoginForm from '/src/features/users/LoginForm';
import RegisterForm from '/src/features/users/RegisterForm'; // Asegúrate de que la ruta sea correcta

function App() {
  return (
    // 3. Define tus rutas dentro del componente <Routes>
    <Routes>
      {/* Ruta para la página de Login */}
      <Route path="/login" element={<LoginForm />} />

      {/* Ruta para la página de Registro */}
      <Route path="/register" element={<RegisterForm />} />

      {/* Ruta por defecto: si alguien entra a la raíz "/", lo redirigimos a /login */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;