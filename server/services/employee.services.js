const employeeModel = require('../models/employee.model');
const moment = require('moment');
const xlsx = require('xlsx');
const db = require('../config/db');


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
const getEmployeeHistoricDetails = async (firstName, lastName,sortBy,sortOrder)=>{
  const result = await employeeModel.getEmployeeHistoricDetails(firstName, lastName,sortBy,sortOrder);
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

const checkIfExists = async(employeeID)=>{
  try {
    const employee = await employeeModel.checkIfExists(employeeID);
    return employee;
  } catch (error) {
    console.log(error);
    throw new Error("Error while checking if employee ID exists"+ error.message);
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

const updateEmployeeService = async (id, employeeData) => {
  try {
      const updatedEmployee = await employeeModel.updateEmployeeQuery(id, employeeData);
      return updatedEmployee;
  } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
  }
};

const deleteEmployeeService = async (id) => {
  try {
      const deletedEmployee = await employeeModel.deleteEmployeeQuery(id);
      return deletedEmployee;
  } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
  }
};

const uploadExcelFile = async (req) => {
  try {

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[1];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const transformedData = data.map((row) => ({
      employee_id: row["Employee ID"],
      first_name: row["First Name"],
      last_name: row["Last Name"],
      email_id: row["Email ID"],
      department: row["Department"],
      title: row["Title"],
      date_of_joining: new Date((row["Date of joining"] - 25569) * 86400 * 1000), // Excel date to JS date
      employee_status: row["Employee Status"],
      employee_type: row["Employee Type"],
      experience: row["Experience"],
      current_band: row["Current Band"],
      gross_monthly_salary_or_fee_rs: row["Gross Monthly Salary/ Fee (Rs.)"]
    }));

    await db("employee_details").insert(transformedData);
    console.log("Data inserted successfully");

    return { message: "Data uploaded and inserted successfully!" };
  } catch (err) {
    console.error(err);
    throw new Error("Error while uploading Excel file: " + err.message);
  }
};

module.exports = {
  getEmployeesService,
  getEmployeeByID,
  searchEmployees,
  searchPickList,
  getEmployeeHistoricDetails,
  getEmployeeDropDowns,
  createEmployee,
  updateEmployeeService,
  deleteEmployeeService,
  checkIfExists,
  uploadExcelFile
};
