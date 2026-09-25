import { useMemo, useState } from "react";

export function usePagination(items = [], itemsPerPage = 8) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safeCurrentPage, itemsPerPage]);

  return {
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  };
}

export default usePagination;
