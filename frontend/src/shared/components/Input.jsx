import { useState } from "react";
import EyeOpen from "@/assets/eye_open.svg";
import EyeClosed from "@/assets/eye_closed.svg";

export function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  className = "",
  error,
}) {
  const baseClass =
    "block w-full px-3 py-2 pr-10 rounded-md shadow-sm focus:ring-1";
  const normalClass =
    "border border-gray-300 placeholder-gray-400 font-light focus:ring-indigo-500 focus:border-indigo-500";

  const errorClass =
    "border border-red-500 placeholder-red-400 focus:ring-red-500 focus:border-red-500";

  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={id}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${baseClass} text-gray-900 font-light ${
            error ? errorClass : normalClass
          } ${className}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <img
              src={show ? EyeOpen : EyeClosed}
              alt={show ? "Hide password" : "Show password"}
              className="h-5 w-5 filter invert-[60%] sepia-[10%] saturate-[200%] hue-rotate-200 brightness-95 contrast-90"
            />
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          aria-live="polite"
          className="mt-1 pl-3 text-sm font-normal text-left text-[#d93025]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
