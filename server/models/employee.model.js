const db = require('../config/db');

/**
 * Fetch employees
 * @param {number} limit - The number of records to fetch
 * @param {number} offset - The number of records to skip
 * @param {string} sortBy - The sort of the employees data
 * @param {string} sortOrder - The sort order of the employees data
 * @returns {object} - The employee data and total count
 */
const getEmployeesQuery = async (limit, offset, sortBy, sortOrder, searchField, searchValue, from, to) => {
  const query = db('employee_details')
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
    .orderBy(sortBy, sortOrder)
    .limit(limit)
    .offset(offset);

  console.log("Search params:", { searchField, searchValue, from, to });

  // Add filtering condition
  if (searchField) {
    if (searchField === 'date_of_joining') {
      if (from && to) {
        console.log("Date range search:", { from, to });
        
        // Convert dates to proper format
        const fromDate = new Date(from);
        const toDate = new Date(to);
        
        if (from === to) {
          // Exact date search
          console.log("Exact date search:", fromDate);
          query.where(db.raw('DATE(date_of_joining)'), '=', db.raw('DATE(?)', [fromDate]));
        } else {
          // Date range search
          query.whereBetween(db.raw('DATE(date_of_joining)'), 
            [db.raw('DATE(?)', [fromDate]), db.raw('DATE(?)', [toDate])]);
        }
      }
    } else if (searchValue) {
      // Non-date field search
      query.where(searchField, '=', searchValue);
    }
  }

  console.log("Final query:", query.toString());
  const employees = await query;

  // total count with filter
  const countQuery = db('employee_details');
  if (searchField) {
    if (searchField === 'date_of_joining') {
      if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        
        if (from === to) {
          countQuery.where(db.raw('DATE(date_of_joining)'), '=', db.raw('DATE(?)', [fromDate]));
        } else {
          countQuery.whereBetween(db.raw('DATE(date_of_joining)'), 
            [db.raw('DATE(?)', [fromDate]), db.raw('DATE(?)', [toDate])]);
        }
      }
    } else if (searchValue) {
      countQuery.where(searchField, '=', searchValue);
    }
  }
  
  const totalCount = await countQuery.count('id as total').first();

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

const getEmployeebyID  = async (id) => {
  try {
    const employees = await db('employee_details')
      .select("*")
      .where('id', id);

    if (!employees || employees.length === 0) {
      throw new Error("Employee not found");
    }

    const employee = employees[0];

    if (employee.date_of_joining) {
      const joinDate = new Date(employee.date_of_joining);
      const today = new Date();

      // Calculate difference in months
      const monthsDiff = 
        (today.getFullYear() - joinDate.getFullYear()) * 12 +
        (today.getMonth() - joinDate.getMonth());

      employee.experience = (monthsDiff / 12).toFixed(1) + " years";
    } else {
      employee.experience = "N/A (No join date)";
    }

    if (employee.date_of_joining && typeof employee.date_of_joining === 'string') {
      employee.date_of_joining = employee.date_of_joining.split('T')[0];
    }
    return employee;

  } catch (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }
};

const searchEmployees = async (searchField, searchValue, limit, offset) => {
  try {
    const sortColumn = [
      'first_name',
      'last_name',
      'email_id',
      'department',
      'title',
      'employee_status',
      'employee_type',
      'employee_id'
    ].includes(searchValue) ? searchValue : 'first_name';

    if (searchField === "date_of_joining") {
      const { from, to } = searchValue;
      
      // Check if from and to dates are the same
      console.log("from", from, "to", to)
      const isSameDate = from === to;
      console.log("isSameDate",isSameDate)

      let query = db('employee_details')
        .select([
          '*',
          db.raw(`TO_CHAR(date_of_joining, 'YYYY-MM-DD') AS date_of_joining`)
        ])
        .orderBy(sortColumn, 'asc')
        .limit(limit)
        .offset(offset);

      let countQuery = db('employee_details')
        .count('* as count');

      if (isSameDate) {
        // For same date, use where clause for exact match
        query = query.where(db.raw(`TO_CHAR(date_of_joining, 'YYYY-MM-DD')`), '=', from);
        countQuery = countQuery.where(db.raw(`TO_CHAR(date_of_joining, 'YYYY-MM-DD')`), '=', from);
      } else {
        // For different dates, use whereBetween
        query = query.whereBetween('date_of_joining', [from, to]);
        countQuery = countQuery.whereBetween('date_of_joining', [from, to]);
      }

      const [employees, totalCount] = await Promise.all([
        query,
        countQuery.first()
      ]);

      return {
        data: employees,
        totalCount: totalCount.count
      };
    } else {
      let Field = searchField;
      if (searchField === "Status") {
        Field = "employee_status";
      } else if (searchField === "Type") {
        Field = "employee_type";
      }

      const employees = await db('employee_details')
        .select([
          '*',
          db.raw(`TO_CHAR(date_of_joining, 'YYYY-MM-DD') AS date_of_joining`)
        ])
        .where(Field, `${searchValue}`)
        .orderBy(sortColumn, 'asc')
        .limit(limit)
        .offset(offset);

      const totalCount = await db('employee_details')
        .count('* as count')
        .where(Field, `${searchValue}`)
        .first();

      return {
        data: employees,
        totalCount: totalCount.count
      };
    }

  } catch (error) {
    throw new Error(error.message);
  }
};

const searchPickList = async (dropField)=>{

    try {
        const dropDown = await db('employee_details')
        .select(dropField)
        .orderBy(dropField, 'asc')
        .distinct()
        return dropDown;
    }
   
    catch(error) {
      throw new Error(error.message);
    }
}

const getEmployeeHistoricDetails = async (firstName,lastName,sortBy,sortOrder) =>{
  try {
    const historicalDetails = await db('historical_data')
                   .select('kra_vs_goals', 'employee', 'ending_month', 'final_score', 'competency', 'start_month', 'reviewer', 'id')
                   .where('employee', `${firstName} ${lastName}`)
                   .orderBy(sortBy,sortOrder);    

    
    return historicalDetails;
  } catch (error) {
    throw new Error(error.message);
  }
}

const getDropDownValues = async ()=>{
  try {
    const department = await db('employee_details').select('department').distinct().offset(0).limit(100);
    const title = await db('employee_details').select('title').distinct().offset(0).limit(100);
    const employeeStatus = await db('employee_details').select('employee_status').distinct().offset(0).limit(100);
    const employeeType = await db('employee_details').select('employee_type').distinct().offset(0).limit(100);
    const currentBand = await db('employee_details').select('current_band').distinct().offset(0).limit(100);
    return {
      department,
      title,
      employeeStatus,
      employeeType,
      currentBand
    }
  }catch(e){
    throw new Error(e.message);
  }
}
const checkIfExists = async(employeeId) =>{
  try {
    const employee = await db('employee_details').select("*").where('employee_id', employeeId);
    return employee;
  } catch (error) {
    throw new Error(error.message);
  }
}
function convertExperienceToMonths(experienceString) {
  // Extract years and months from the string
  const yearMatch = experienceString.match(/(\d+)\s*year/);
  const monthMatch = experienceString.match(/(\d+)\s*month/);
  
  const years = yearMatch ? parseInt(yearMatch[1]) : 0;
  const months = monthMatch ? parseInt(monthMatch[1]) : 0;
  
  return (years * 12) + months;
}
const createEmployee = async (employeeData) => {
  try {
        const experienceInMonths = convertExperienceToMonths(employeeData.experience);

    const [newEmployee] = await db('employee_details')
      .insert({
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email_id: employeeData.email_id,
        department: employeeData.department,
        title: employeeData.title,
        date_of_joining: employeeData.date_of_joining,
        employee_status: employeeData.employee_status,
        employee_type: employeeData.employee_type,
        current_band: employeeData.current_band,
        employee_id: employeeData.employee_id,
        experience: experienceInMonths
      })
      .returning('*');  

    console.log(newEmployee);
    return newEmployee;
  } catch (e) {
    throw new Error(e.message);
  }
};

const updateEmployeeQuery = async (id, employeeData) => {
         if (employeeData.experience) {
        employeeData.experience = convertExperienceToMonths(employeeData.experience);
      }
  try {
      const [updatedEmployee] = await db('employee_details')
          .where({ id })
          .update(employeeData, ['*']);

      return updatedEmployee || null;
  } catch (error) {
      throw new Error(`Model Error: ${error.message}`);
  }
};

const deleteEmployeeQuery = async (id) => {
  try {
      const [deletedEmployee] = await db('employee_details')
          .where({ id })
          .update({ employee_status: 'Inactive' }, ['*']);

      return deletedEmployee || null;
  } catch (error) {
      throw new Error(`Model Error: ${error.message}`);
  }
};

const uploadBulkData = async (employeeData)=>{
  try {
    const [newEmployee] = await db('employee_details')
      .insert({
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email_id: employeeData.email_id,
        department: employeeData.department,
        title: employeeData.title,
        date_of_joining: employeeData.date_of_joining,
        employee_status: employeeData.employee_status,
        employee_type: employeeData.employee_type,
        current_band: employeeData.current_band,
        employee_id: employeeData.employee_id,
        experience: employeeData.experience
      })
      .returning('*');  

    console.log(newEmployee);
    return newEmployee;
  } catch (e) {
    throw new Error(e.message);
  }
}

module.exports = {
  getEmployeesQuery,
  getEmployeebyID,
  searchEmployees,
  searchPickList,
  getEmployeeHistoricDetails,
  getDropDownValues,
  createEmployee,
  updateEmployeeQuery,
  deleteEmployeeQuery,
  checkIfExists
};
