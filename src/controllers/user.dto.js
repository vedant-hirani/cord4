/**
 * Filters out internal/confidential database attributes from User models.
 * @param {Object} user User schema or raw document
 * @returns {Object} Cleaned DTO representation
 */
export const userDTO = (user) => {
  if (!user) return null;
  
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Maps multiple User documents into filtered DTO shapes.
 * @param {Array} users List of raw user items
 * @returns {Array} Filtered list of user DTOs
 */
export const usersListDTO = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(userDTO);
};

export default {
  userDTO,
  usersListDTO,
};
