const employeeModel = require('../models/employee.model');
const moment = require('moment');

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

  if (result.data && Array.isArray(result.data)) {
    for (let i = 0; i < result.data.length; i++) {
      const isoDate = result.data[i].date_of_joining;
      if (isoDate) {
        const formattedDate = moment(isoDate).format('YYYY-MM-DD');
        result.data[i].date_of_joining = formattedDate;
      }
    }
  }


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

const searchEmployees = async (searchValue,from,to,limit,size)=>{
  const result = await employeeModel.searchEmployees(searchValue,from,to,limit,size);
  return {
    data: result.data,
    total: result.totalCount
  }
}

const searchPickList = async (dropDownField) => {
  try {
    
  const result = await employeeModel.searchPickList(dropDownField);
  return result.map(employee => ({
    label: employee[dropDownField],
    value: employee[dropDownField]
  }));    
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}
const getEmployeeHistoricDetails = async (firstName, lastName)=>{
  const result = await employeeModel.getEmployeeHistoricDetails(firstName, lastName);
  return result;
}

const getEmployeeDropDowns = async ()=>{
  const result = await employeeModel.getDropDownValues();
  try {
    
  const modifiedDoc = {};
  modifiedDoc.titles = result.title.map(title=>({label:title.title, value: title.title}));
  modifiedDoc.departments = result.department.map(department=> ({label:department.department, value:department.department}))
  modifiedDoc.employeeTypes = result.employeeType.map(employeeType=> ({label:employeeType.employee_type, value:employeeType.employee_type}))
  modifiedDoc.currentBands = result.currentBand.map(currentBand=> ({label:currentBand.current_band, value:currentBand.current_band}))
  return modifiedDoc;
    
  } catch (error) {
    console.log(error);
    throw new Error("Error while processing values"+ error.message);
  }
}

const createEmployee = async(employeeData)=>{
  try {
    const result = await employeeModel.createEmployee(employeeData);
    return {
      data: result
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error while creating employee"+ error.message);
  }

}

module.exports = {
  getEmployeesService,
  getEmployeeByID,
  searchEmployees,
  searchPickList,
  getEmployeeHistoricDetails,
  getEmployeeDropDowns,
  createEmployee
};
