export function SubmitButton({ text }) {
  return (
    <button
      type="submit"
      className="w-full px-4 py-2 font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
    >
      {text}
    </button>
  );
}