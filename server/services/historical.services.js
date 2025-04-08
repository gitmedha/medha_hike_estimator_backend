const historicalModel = require('../models/historical.model');
const db = require('../config/db');
const xlsx = require('xlsx');

/**
 * Get Historical employee details
 * @param {number} page - The current page number
 * @param {number} limit - The number of historical data to fetch per page
 * @returns {object} - historical  data and total count
 */
const getHistoricalDataService = async (offset, limit,sortBy,sortOrder) => {

  const result = await historicalModel.getHistoricalQuery(limit, offset,sortBy,sortOrder);

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
  return result.map(historic => ({
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

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    for (let row of data){
    const dataObj = {}
    let employeeInfo = row.Employee.split(" ");
    let managerInfo = row.Reviewer.split(" ");
    let duration = row['Appraisal Cycle'].split(" ");
    let start_month = duration[0];
    let end_month = duration[1];
    dataObj.employee_id = `${employeeInfo[0]}`;
    dataObj.employee = `${employeeInfo[1]} ${employeeInfo[2]}`;
    dataObj.reviewer = `${managerInfo[1]} ${managerInfo[2]}`;
    dataObj.final_score = parseFloat(row['Final Score']);
    dataObj.kra_vs_goals = parseFloat(row['KRA vs GOALS']);
    dataObj.competency = parseFloat(row.Competency);
    dataObj.start_month = start_month;
    dataObj.ending_month = end_month;

    await db("historical_data").insert(dataObj);
    }
    return { message: "Data uploaded and inserted successfully!" };
  } catch (err) {
    console.error(err);
    throw new Error("Error while uploading Excel file: " + err.message);
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
