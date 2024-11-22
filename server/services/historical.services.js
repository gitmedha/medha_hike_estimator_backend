const historicalModel = require('../models/historical.model');

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


const searchHistoric = async (searchValue,from,to,limit,size)=>{
  const result = await historicalModel.searchHistoric(searchValue,from,to,limit,size);
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

module.exports = {
    getHistoricalDataService,
    getHistoricDatabyID,
    searchHistoric,
    searchPickList,
    getHistoricsDropDowns,
    getReporteeDetails,
    createHistoric,
    updateHistoricService,
    deleteHistoricService
};
