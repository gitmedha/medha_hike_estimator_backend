const db = require('../config/db');

/**
 * Fetch employees
 * @param {number} limit - The number of records to fetch
 * @param {number} offset - The number of records to skip
 * @returns {object} - The employee data and total count
 */
const getEmployeesQuery = async (limit, offset) => {
 
  const employees = await db('employee_details')
    .select(
      'employee_id',
      'first_name',
      'last_name',
      'email_id',
      'department',
      'title',
      'date_of_joining',
      'employee_status',
      'employee_type',
      'id'
    )
    .limit(limit)
    .offset(offset);
  const totalCount = await db('employee_details').count('id as total').first();

  return {
    totalCount: totalCount.total,
    data: employees,
  };
};

/**
 * Fetch employee
 * @param {number} id - the employee id
 * @returns {object} - The employee data
 */

const getEmployeebyID = async(id) => {
  const employee = await db('employee_details').select("*").where('id', id);
  console.log(employee);
  return employee;
}
module.exports = {
  getEmployeesQuery,
  getEmployeebyID
};
