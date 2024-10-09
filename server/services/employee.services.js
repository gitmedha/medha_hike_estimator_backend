const employeeModel = require('../models/employee.model');

/**
 * Get paginated employee details
 * @param {number} page - The current page number
 * @param {number} limit - The number of employees to fetch per page
 * @returns {object} - The paginated employee data and total count
 */
const getEmployeesService = async (offset, limit) => {


  const result = await employeeModel.getEmployeesQuery(limit, offset);

  return {
    total: result.totalCount,
    limit,
    data: result.data
  };
};

module.exports = {
  getEmployeesService,
};
