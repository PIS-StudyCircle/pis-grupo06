export function ErrorAlert({ children }) {


  const msgs = Array.isArray(children)
    ? children
    : (children ? String(children).split("\n") : []);

  if (msgs.length === 0) return null;

  return (
    <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
      <ul className="list-disc list-inside space-y-1">
        {msgs.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
}