import { Link } from "react-router-dom";
import logo from "@/assets/logo_completo.png";

export function AuthLayout({ title, children, footerText, footerLink, footerLinkText }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Encabezado */}
        <div className="text-center">
          <Link to="/"> 
            <img
              src={logo}
              alt="Study Circle Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto cursor-pointer"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            {title}
          </h1>
        </div>

        {children}

        {/* Enlace para iniciar sesión */}
        <p className="text-sm text-center text-gray-600">
          {footerText}{" "}
          <a
            href={footerLink}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {footerLinkText}
          </a>
        </p>
      </div>
    </div>
  );
}