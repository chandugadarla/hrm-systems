export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems,
  itemsPerPage = 8,
}) {
  if (!totalItems || totalItems <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="employees-pagination pagination">
      <div className="pagination-summary">
        Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong>
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          Previous
        </button>
        <span className="pagination-page">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
