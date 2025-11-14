export default function TutoringSearchBar({
  query,
  onQueryChange,
  searchBy,
  onSearchByChange,
  options = [
    { value: "course", label: "Materia" },
    { value: "subject", label: "Tema" },
  ],
  placeholder = "Buscar...",
  disabled = false,
}) {
  return (
    <div className="w-full mb-4">
      <div className="flex items-center border border-gray-300 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500">

        <select
          aria-label="Buscar por"
          value={searchBy}
          onChange={(e) => onSearchByChange?.(e.target.value)}
          className="rounded-l-full px-3 py-2 bg-gray-50 text-gray-700 border-r border-gray-300 focus:outline-none"
          disabled={disabled} 
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
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
            type="text"
            value={query}
            onChange={onQueryChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-r-full focus:outline-none"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
