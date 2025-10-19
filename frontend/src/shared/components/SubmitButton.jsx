export function SubmitButton({ text, className = "", fullWidth = true, ...props }) {
  const base =
    "px-4 py-2 font-semibold text-white bg-gray-900 rounded-md " +
    "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900";
  const width = fullWidth ? "w-full" : "";

  return (
    <button type="submit" className={`${base} ${width} ${className}`} {...props}>
      {text}
    </button>
  );
}
