export default function List({ 
  items, 
  renderItem, 
  loading, 
  error, 
  emptyMessage = "No hay elementos disponibles." 
}) {
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!items || items.length === 0) return <div>{emptyMessage}</div>;

  return (
    <div className="flex flex-col">
      {items.map((item) => renderItem(item))}
    </div>
  );
}
