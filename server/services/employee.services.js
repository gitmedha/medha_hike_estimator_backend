const employeeModel = require('../models/employee.model');

/**
 * Get paginated employee details
 * @param {number} page - The current page number
 * @param {number} limit - The number of employees to fetch per page
 * @param {string} sortBy - The sort of the employees data
 * @param {string} sortOrder - The sort order of the employees data
 * @returns {object} - The paginated employee data and total count
 */
const getEmployeesService = async (offset, limit,sortBy,sortOrder) => {

  const result = await employeeModel.getEmployeesQuery(limit, offset,sortBy,sortOrder);

  return {
    total: result.totalCount,
    limit,
    data: result.data
  };
};

const getEmployeeByID = async (id)=>{
  const employee = await employeeModel.getEmployeebyID(id);
  return {
    data: employee
  }
}

const searchEmployees = async (searchValue,from,to)=>{
  const result = await employeeModel.searchEmployees(searchValue,from,to);
  return {
    data: result.data,
    total: result.totalCount
  }
}

const searchPickList = async (dropDownField) => {
  const result = await employeeModel.searchPickList(dropDownField);
  return result.data.map(employee => ({ label: employee.dropDownField, value: employee.dropDownField }));
}
module.exports = {
  getEmployeesService,
  getEmployeeByID,
  searchEmployees,
  searchPickList
};
