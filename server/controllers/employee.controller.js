const employeeService = require('../services/employee.services');
const { downloadExcel} = require('../utils/downloadExcel');
const db = require('../config/db');

/**
 * @param {object} req
 * @param {object} res
 */
const createEmployee = async(req, res) => {
  try {

    const employeeData = req.body;
    const employee = employeeService.checkIfExists(employeeData.employee_id);
    console.log(employee);

    if(employee.length){
     return res.status(400).json({error:'Duplicate entry', message: 'Employee already exists'})
    }
    
    const result = await employeeService.createEmployee(employeeData);
    return res.status(201).json(result);
    
  } catch (error) {
    return res.status(500).json({error: "Error creating employee", message: error.message});
  }
}

/**
 * @param {object} req
 * @param {object} res
 */
const getEmployees = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'employee_id';
    const sortOrder = req.query.sortOrder || 'asc';

    const searchField = req.query.searchField || '';
    const searchValue = req.query.searchValue || '';
    const from = req.query.from;
    const to = req.query.to;

    const result = await employeeService.getEmployeesService(
      offset,
      limit,
      sortBy,
      sortOrder,
      searchField,
      searchValue,
      from,
      to
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employees', details: error.message });
  }
};


const getEmployee = async (req,res)=>{
  try {
    const { id } = req.params;
    const result = await employeeService.getEmployeeByID(id);
    res.status(200).json(result);
    
  } catch (error) {
    res.status(500).json({error: 'Error fetching employee', details: error.message})
  }
}

const searchEmployees = async(req, res) => {
  try {
  const { searchField, searchValue,limit, size } = req.body;

    const result = await employeeService.searchEmployees(searchField,searchValue,limit,size);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: 'Error searching employees', details: error.message });
  }
}
const searchPickList = async(req,res) =>{
  try {
    const {dropDownField} = req.params;
    const result = await employeeService.searchPickList(dropDownField);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error searching pick list', details: error.message });
  }
}

const getEmployeeHistoricDetails = async (req, res) => {
  try {
    const { first_name,last_name ,sortBy,sortOrder} = req.params;
    const result = await employeeService.getEmployeeHistoricDetails(first_name,last_name,sortBy,sortOrder);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employee historical details', details: error.message });
  }
}

const getEmployeeDropDowns = async(req,res)=>{
try {
  const result = await employeeService.getEmployeeDropDowns();
  res.status(200).json(result);
} catch (error) {
  res.status(500).json({error: 'Error fetching employee drop downs', details: error.message})
}
}

const updateEmployee = async (req, res) => {
  try {
      const { id } = req.params;
      const employeeData = req.body;

      if (!id) {
          return res.status(400).json({ message: "Employee ID is required." });
      }

      const updatedEmployee = await employeeService.updateEmployeeService(id, employeeData);

      if (!updatedEmployee) {
          return res.status(404).json({ message: "Employee not found." });
      }

      return res.status(200).json({
          message: "Employee updated successfully.",
          data: updatedEmployee,
      });
  } catch (error) {
      console.error("Error updating employee:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteEmployee = async (req, res) => {
  try {
      const { id } = req.params;

      if (!id) {
          return res.status(400).json({ message: "Employee ID is required." });
      }

      const deletedEmployee = await employeeService.deleteEmployeeService(id);

      if (!deletedEmployee) {
          return res.status(404).json({ message: "Employee not found." });
      }

      return res.status(200).json({
          message: "Employee deleted successfully.",
          data: deletedEmployee,
      });
  } catch (error) {
      console.error("Error deleting employee:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};

const downloadExcelFile = async (req,res)=>{
  try {
    await downloadExcel(req,res,'employee_details');
  } catch (error) {
    res.status(500).json({error: 'Error downloading excel file', details: error.message});
  }
}

const uploadExcelFile = async (req, res) => {
  try {
    // Get the validated data from the request body
    const { data: validRows } = req.body;

    if (!validRows || !Array.isArray(validRows)) {
      return res.status(400).json({ 
        success: false,
        error: "No valid data received" 
      });
    }

    if (validRows.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No data to insert", 
        recordsInserted: 0 
      });
    }

    // Insert all valid rows directly
    await db("employee_details").insert(validRows);
    console.log("Data inserted successfully");

    return res.status(200).json({
      success: true,
      message: "Data inserted successfully!",
      recordsInserted: validRows.length
    });
  } catch (err) {
    console.error("Database insertion error:", err);
    
    // Check for specific database errors
    let errorMessage = "Error while inserting data";
    
    if (err.code === '23505') { // PostgreSQL unique violation
      errorMessage = "Duplicate employee ID found. Please check your data.";
    } else if (err.code === '23502') { // PostgreSQL not null violation
      errorMessage = "Required fields are missing. Please check your data.";
    } else if (err.code === '22007') { // PostgreSQL invalid datetime format
      errorMessage = "Invalid date format. Please use YYYY-MM-DD format.";
    } else {
      errorMessage = err.message || "Unknown database error occurred";
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};


module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  searchEmployees,
  searchPickList,
  getEmployeeHistoricDetails,
  getEmployeeDropDowns,
  updateEmployee,
  deleteEmployee,
  downloadExcelFile,
  uploadExcelFile
};
