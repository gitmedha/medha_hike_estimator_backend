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
module.exports = {
    getHistoricalDataService,
    getHistoricDatabyID,
    searchHistoric,
    searchPickList
};
