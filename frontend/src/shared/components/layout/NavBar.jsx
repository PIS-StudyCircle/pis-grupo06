// src/shared/components/layout/NavBar.jsx
import { Link } from 'react-router-dom';
import SearchInput from '../SearchInput';
import { useState } from "react";


const NavBar = ({ toggleSidebar }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsDropdownOpen(false);
        // Aquí puedes agregar la lógica de logout
    };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#00173D] shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Menu button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md border-none"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <img src="/icon_sin_fondo.png" alt="Mi imagen" style={{width: '60px',height: '60px'}}/>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* User menu */}
            {isAuthenticated ? (
              // 🔹 Menú de usuario si está logueado
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-2 text-white rounded-lg hover:bg-[#041E49] transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">A</span>
                  </div>
                  <span className="hidden md:block font-medium">Admin</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ver Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 🔹 Links de inicio de sesión / registro si NO está logueado
              <div className="flex gap-4 text-white">
                <button className="hover:underline">Iniciar sesión</button>
                <button className="hover:underline">Registrarse</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;