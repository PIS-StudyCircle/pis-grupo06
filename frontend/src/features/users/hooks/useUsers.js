import { API_BASE } from "@/shared/config";
import { getUsers } from "../services/usersServices";

const API_URL = `${API_BASE}/users/list`;

import { useState, useEffect } from "react";

export const useUsers = (initialPage = 1, perPage = 20, initialRole = "") => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getUsers(page, perPage, search, role);
        setUsers(response.data);
        setPagination({
          page: response.page,
          perPage: response.per_page,
          total: response.total,
          totalPages: response.total_pages,
        });
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, perPage, search, role]);

  return {
    users,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    role,
    setRole,
  };
};

export const useTutors = (initialPage = 1, perPage = 20) => {
  return useUsers(initialPage, perPage, "tutor");
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error(`Error al obtener usuario con id ${id}`);
  return await response.json();
};
