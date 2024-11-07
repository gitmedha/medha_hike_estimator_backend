const db = require('../config/db');

/**
 * Fetch employees
 * @param {number} limit - The number of records to fetch
 * @param {number} offset - The number of records to skip
 * @param {string} sortBy - The sort of the employees data
 * @param {string} sortOrder - The sort order of the employees data
 * @returns {object} - The employee data and total count
 */
const getEmployeesQuery = async (limit, offset,sortBy,sortOrder) => {
 
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
    ).orderBy(sortBy,sortOrder)
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
  return employee;
}

const searchEmployees = async(searchValue,from,to,limit,size)=>{
try {
  const sortColumn = ['first_name', 'last_name', 'email_id', 'department', 'title', 'employee_status', 'employee_type'].includes(searchValue)
  ? searchValue
  : 'first_name';

  if( from & to){

  }
  else {
    const employees = await db('employee_details')
                            .select("*")
                            .where('first_name', 'like', `%${searchValue}%`)
                            .orWhere('last_name', 'like', `%${searchValue}%`)
                            .orWhere('email_id', 'like', `%${searchValue}%`)
                            .orWhere('department', 'like', `%${searchValue}%`)
                            .orWhere('title', 'like', `%${searchValue}%`)
                            .orWhere('employee_status', 'like', `%${searchValue}%`)
                            .orWhere('employee_type', 'like', `%${searchValue}%`)
                            .orderBy(sortColumn,'asc')
                            .limit(limit)
                            .offset(size*limit);

    const totalCount = await db('employee_details')
                            .count('* as count')
                            .where('first_name', 'like', `%${searchValue}%`)
                            .orWhere('last_name', 'like', `%${searchValue}%`)
                            .orWhere('email_id', 'like', `%${searchValue}%`)
                            .orWhere('department', 'like', `%${searchValue}%`)
                            .orWhere('title', 'like', `%${searchValue}%`)
                            .orWhere('employee_status', 'like', `%${searchValue}%`)
                            .orWhere('employee_type', 'like', `%${searchValue}%`)
                            .first();
                        
    return {
      data:employees,
      totalCount: totalCount.count
    };
  }

} catch (error) {
  throw new Error(error.message);
}
}

const searchPickList = async (dropField)=>{

    try {
        const dropDown = await db('employee_details')
        .select(dropField)
        .orderBy(dropField, 'asc')
        .distinct()
        .offset(0)
        .limit(100);
        return dropDown;
    }
   
    catch(error) {
      throw new Error(error.message);
    }
}

const getEmployeeHistoricDetails = async (firstName,lastName) =>{
  try {
    const historicalDetails = await db('historical_data')
                   .select('kra_vs_goals', 'employee', 'ending_month', 'final_score', 'competency', 'start_month', 'reviewer', 'id')
                   .where('employee', `${firstName} ${lastName}`);    

                   console.log(historicalDetails);
                   
    return historicalDetails;
  } catch (error) {
    throw new Error(error.message);
  }
}
module.exports = {
  getEmployeesQuery,
  getEmployeebyID,
  searchEmployees,
  searchPickList,
  getEmployeeHistoricDetails
};
