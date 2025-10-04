import { getUsers } from "../services/usersServices";

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
        console.log("Fetched users:", response.users);
        setUsers(response.users);
        setPagination(response.pagination);
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