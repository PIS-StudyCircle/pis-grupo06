// src/shared/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: '📊'
    },
    {
      title: 'Cursos',
      path: '/courses',
      icon: '📚'
    },
    {
      title: 'Estudiantes',
      path: '/students',
      icon: '👥'
    },
    {
      title: 'Profesores',
      path: '/teachers',
      icon: '👨‍🏫'
    },
    {
      title: 'Reportes',
      path: '/reports',
      icon: '📈'
    },
    {
      title: 'Configuración',
      path: '/settings',
      icon: '⚙️'
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:pt-20">
          <h2 className="text-xl font-semibold text-gray-800">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sección inferior (opcional) */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuario</p>
                <p className="font-medium text-gray-800">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;