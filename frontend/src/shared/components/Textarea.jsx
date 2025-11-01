// src/shared/ui/Textarea.jsx
export function Textarea({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  className = "",
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="flex justify-start ml-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      />
    </div>
  );
}
