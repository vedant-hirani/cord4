/**
 * Parses and returns standard pagination parameters with defaults.
 * @param {Object} query Express request query object
 * @returns {Object} Cleaned pagination values
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10)); // Max limit 100
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Formats paginated query results with metadata.
 * @param {Array} docs The database records fetched
 * @param {number} totalCount Total matching items in collection
 * @param {number} page Current page number
 * @param {number} limit Maximum item count per page
 * @returns {Object} Structured pagination result
 */
export const formatPaginatedResult = (docs, totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    results: docs,
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPrevPage,
    },
  };
};

export default {
  getPagination,
  formatPaginatedResult,
};
