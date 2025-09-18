export function ErrorAlert({ children }) {

  const msgs = Array.isArray(children)
    ? children
    : (children ? String(children).split("\n") : []);

  if (msgs.length === 0) return null;

  return (
    <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm flex flex-col items-center justify-center text-center">
      <ul className="list-disc list-outside pl-5 space-y-2">
        {msgs.map((m, i) => (
          <li key={i} className="leading-snug text-left">{m}</li>
        ))}
      </ul>
    </div>
  );
}