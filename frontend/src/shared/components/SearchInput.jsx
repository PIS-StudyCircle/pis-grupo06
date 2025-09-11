export default function SearchInput({
  id = "search-input",
  name = "search",
  value,
  onChange,
  placeholder = "Buscar..."
}) {
  return (
    <div className="relative w-full mb-4">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
        />
      </svg>

      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}
