class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  /**
   * Helper that builds and returns standard JSON success responses.
   * Optionally takes a DTO mapping function to transform raw data before response formatting.
   * @param {Object} res Express response object
   * @param {*} data Success payload data
   * @param {string} [message='Success'] Success message string
   * @param {number} [statusCode=200] HTTP Status Code
   * @param {Function} [dto=null] Optional DTO mapping callback function
   * @returns {Object} Express JSON response
   */
  static success(res, data, message = 'Success', statusCode = 200, dto = null) {
    const formattedData = (dto && typeof dto === 'function') ? dto(data) : data;
    const response = new ApiResponse(statusCode, formattedData, message);
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Error', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors.length > 0 ? errors : undefined,
    });
  }
}

export default ApiResponse;
