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

const getEmployeeByID = async (id)=>{
  console.log(employeeModel.getEmployeebyID);
  const employee = await employeeModel.getEmployeebyID(id);
  return {
    data: employee
  }
}
module.exports = {
  getEmployeesService,
  getEmployeeByID
};
