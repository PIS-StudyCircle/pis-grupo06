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
  maxLength
}) {
  const baseClass =
    "block w-full px-3 py-2 pr-10 rounded-md shadow-sm focus:ring-1";
  const normalClass =
    "border border-gray-300 placeholder-gray-400 font-light focus:ring-indigo-500 focus:border-indigo-500";
  const errorClass =
    "border border-red-500 placeholder-red-400 focus:ring-red-500 focus:border-red-500";

  const [show, setShow] = useState(false);
  const [preview, setPreview] = useState(null);
  const isPassword = type === "password";
  const isFile = type === "file";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(e);
    }
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="flex justify-start ml-1 block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {!isFile && (
          <>
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
              maxLength={maxLength}
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
          </>
        )}

        {isFile && (
          <div className="flex items-center gap-3">
            <label
              htmlFor={id}
              className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition"
            >
              <span className="text-sm text-gray-600">
                Cargar imagen
              </span>
              <input
                id={id}
                name={id}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required={required}
                aria-invalid={!!error}
              />
            </label>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-12 w-12 object-cover rounded-md border border-gray-300"
              />
            )}
          </div>
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
