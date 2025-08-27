import { useEffect, useState } from "react";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL del back desde .env
  const API_URL =
    import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_URL}/api/v1/articles`, {
          headers: {
            Accept: "application/json", // 👈 forzamos JSON
          },
        });
        if (!res.ok) throw new Error("Error " + res.status);

        const data = await res.json(); // 👈 parsea JSON a objetos JS
        setArticles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [API_URL]);

  if (loading) return <p>Cargando artículos...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  
  return (
    <div>
      <h1>Artículos desde Rails API</h1>
      <p>{articles.message}</p>
    </div>
  );
}