const historicalModel = require('../models/historical.model');
const db = require('../config/db');
const xlsx = require('xlsx');

/**
 * Get Historical employee details
 * @param {number} page - The current page number
 * @param {number} limit - The number of historical data to fetch per page
 * @returns {object} - historical  data and total count
 */
const getHistoricalDataService = async (offset, limit, sortBy, sortOrder, searchField, searchValue, from, to) => {
  const result = await historicalModel.getHistoricalQuery(
    limit, 
    offset, 
    sortBy, 
    sortOrder,
    searchField,
    searchValue,
    from,
    to
  );

  return {
    total: result.totalCount,
    limit,
    data: result.data
  };
};

const getHistoricDatabyID = async (id)=>{
  const historicData = await historicalModel.getHistoricDatabyID(id);
  return {
    data: historicData
  }
}


const searchHistoric = async (searchField,searchValue,limit,size)=>{
  const result = await historicalModel.searchHistoric(searchField,searchValue,limit,size);
  return {
    data: result.data,
    total: result.totalCount
  }
}

const searchPickList = async (dropDownField) => {
  try {
    
  const result = await historicalModel.searchPickList(dropDownField);

  return result
      .filter(historic => historic[dropDownField] && historic[dropDownField].length > 0)
      .map(historic => ({
        label: historic[dropDownField],
        value: historic[dropDownField]
      }));
    
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

const getHistoricsDropDowns = async ()=>{
  const result = await historicalModel.getHistoricalPickList();
  try {
    
  const modifiedDoc = {};
  modifiedDoc.employees = result.employee.map(employee=>({label:employee.employee, value: employee.employee}));
  modifiedDoc.reviewers = result.reviewer.map(reviewer=> ({label:reviewer.reviewer, value:reviewer.reviewer}));
  return modifiedDoc;
    
  } catch (error) {
    console.log(error);
    throw new Error("Error while processing values"+ error.message);
  }
}

const getReporteeDetails = async (name) =>{
  try {

    const reporteeDetails = await historicalModel.getReporteeDetails(name);
    return reporteeDetails;
    
  } catch (error) {
    console.log(error);
    throw new Error('Error while getting reportee details'+ error.message);
  }
}

const createHistoric = async(historicData)=>{
  try {
    const result = await historicalModel.createHistoric(historicData);
    return {
      data: result
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error while creating historic data"+ error.message);
  }

}

const updateHistoricService = async (id, historicData) => {
  try {
      const updatedHistoric = await historicalModel.updateHistoricQuery(id, historicData);
      return updatedHistoric;
  } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
  }
};

const deleteHistoricService = async (id) => {
  try {
      const deletedHistoric = await historicalModel.deleteHistoricQuery(id);
      return deletedHistoric;
  } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
  }
};

const uploadExcelFile = async (req) => {
  try {
    // Get the validated data from the request body (from UploadExcel component)
    const { data: validRows } = req.body;

    if (!validRows || !Array.isArray(validRows)) {
      throw new Error("No valid data received");
    }

    if (validRows.length === 0) {
      return { 
        success: true,
        message: "No data to insert", 
        recordsInserted: 0 
      };
    }

    // Transform data to match your historical_data schema
    const historicalData = validRows.map(row => {      
      return {
        employee_id: row.employee_id,
        employee: row.full_name, // Using full_name from upload as employee name
        reviewer: row.manager,   // Using manager from upload as reviewer
        final_score: parseFloat(row.average) || 0,
        kra_vs_goals: parseFloat(row.kra) || 0,
        competency: parseFloat(row.compentency) || 0,
        start_month: row.start_month,
        ending_month: row.ending_month,
      };
    });

    console.log("historicalData",historicalData)

    // Insert all valid rows directly into historical_data table
    // await db("historical_data").insert(historicalData);
    console.log("Historical data inserted successfully");

    return {
      success: true,
      message: "Historical data inserted successfully!",
      recordsInserted: historicalData.length,
    };
  } catch (err) {
    console.error("Database insertion error:", err);
    
    // Check for specific database errors
    let errorMessage = "Error while inserting historical data";
    
    if (err.code === '23505') { // PostgreSQL unique violation
      errorMessage = "Duplicate historical entry found. Please check your data.";
    } else if (err.code === '23502') { // PostgreSQL not null violation
      errorMessage = "Required fields are missing. Please check your data.";
    } else {
      errorMessage = err.message || "Unknown database error occurred";
    }

    throw new Error(errorMessage);
  }
};

module.exports = {
    getHistoricalDataService,
    getHistoricDatabyID,
    searchHistoric,
    searchPickList,
    getHistoricsDropDowns,
    getReporteeDetails,
    createHistoric,
    updateHistoricService,
    deleteHistoricService,
    uploadExcelFile
};
