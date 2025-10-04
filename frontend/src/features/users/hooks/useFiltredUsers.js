import { useMemo } from "react";

function normalize(str) {
  return str
    .normalize("NFD")               // separa letras de los acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
    .toLowerCase();                  // pasa todo a minúsculas
}

export function useFilteredUsers(users, search) {
  return useMemo(() => {
    if (!search) return users;
    const q = normalize(search);
    return users.filter((u) => normalize(u.name).includes(q) || normalize(u.last_name).includes(q));
  }, [search, users]);
}
