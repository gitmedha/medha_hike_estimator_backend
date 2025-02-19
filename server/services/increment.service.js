const incrementModel =  require('../models/increment.model');
const db = require('../config/db');
const xlsx = require('xlsx');

const fetchIncrementData = async (offset, limit, sortBy, sortOrder) => {
    try {
        const result = await incrementModel.getIncrementData(offset, limit, sortBy, sortOrder);
        return result;
    } catch (err) {
        throw new Error(`Service Error: Unable to fetch increment data. ${err.message}`);
    }
};


const fetchIncrementDataById = async (id,review_cycle) => {
    try {
      const result = await incrementModel.getIncrementDataById(id,review_cycle);
      if (!result || result.length === 0) {
        throw new Error(`No increment data found for ID: ${id}`);
      }
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to fetch increment data by ID. ${err.message}`);
    }
  };

  const createNewIncrementData = async (data) => {
    try {
      const newIncrementId = await incrementModel.createIncrementData(data);
      return { id: newIncrementId, message: 'Increment data created successfully' };
    } catch (err) {
      throw new Error(`Service Error: Unable to create increment data. ${err.message}`);
    }
  };

  const updateExistingIncrementData = async (id, data) => {
    try {
      const updatedRowCount = await incrementModel.updateIncrementData(data, id);
      if (updatedRowCount === 0) {
        throw new Error(`No increment data found to update for ID: ${id}`);
      }
      return { id, message: 'Increment data updated successfully' };
    } catch (err) {
      console.log(err)
      throw new Error(`Service Error: Unable to update increment data. ${err.message}`);
    }
  };


  const deleteIncrementDataById = async (id) => {
    try {
      const deletedRowCount = await incrementModel.deleteIncrementData(id);
      if (deletedRowCount === 0) {
        throw new Error(`No increment data found to delete for ID: ${id}`);
      }
      return { id, message: 'Increment data deleted successfully' };
    } catch (err) {
      throw new Error(`Service Error: Unable to delete increment data. ${err.message}`);
    }
  };

  const filterIncrementData = async (fields, values, limit, offset) => {
    try {
      const result = await incrementModel.filterIncrementData(fields, values, limit, offset);
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to filter increment data. ${err.message}`);
    }
  };

  const searchIncrementData = async (field, value, offset, limit) => {
    try {
      console.log(field,value, offset, limit)
      const result = await incrementModel.searchIncrementData(field, value, offset, limit);
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to search increment data. ${err.message}`);
    }
  };

  const getDropdownOptions = async (field) => {
    try {
      const options = await incrementModel.getSearchDropdowns(field);
      return options.map((option) => ({
        label: option[field],
        value: option[field],
      }));
    } catch (err) {
      throw new Error(`Service Error: Unable to fetch dropdown options. ${err.message}`);
    }
  };

  const getPickList = async ()=>{
    try {
      const result = await incrementModel.getPickList();
      const pickList = {
        managers: [],
        IDs: [],
        names: [],
      };
      
      pickList.managers = result.managers.map((item) => ({
        label: item.reviewer,
        value: item.reviewer,
      }));
      
      pickList.IDs = result.employees.map((item) => ({
        label: item.employee_id,
        value: item.employee_id,
      }));
      
      pickList.names = result.employees.map((item) => ({
        label: item.first_name+ " "+ item.last_name,
        value: item.first_name+ " "+ item.last_name,
      }));
      
      return pickList;
      
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }


  const fetchFilterDropdowns = async ()=>{
    try {
      const result = await incrementModel.fetchFilterDropdown();
      const filterDropdowns = {
        new_band: [],
        tenure: [],
        long_tenure: [],
      };
      filterDropdowns.new_band = result.map((item) => ({
        label: item.new_band,
        value: item.new_band,
      }));
      
      filterDropdowns.tenure = result.map((item) => ({
        label: item.tenure,
        value: item.tenure,
      }));
      return filterDropdowns;
      
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }


  const calculateAverage =(values)=>{
    try {
    if (!values || values.length === 0) return 0;
      const sum = values.reduce((acc, value) => acc + value, 0);
      return sum / values.length;
    } catch (error) {
      throw new Error("Calculating average error: " + error.message);
      
    }
  }
  function calculateStandardDeviation(values) {
    try {
      
    if (!values || values.length === 0) return 0;

    const mean = calculateAverage(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const meanSquaredDiff = calculateAverage(squaredDiffs);
    return Math.sqrt(meanSquaredDiff);
    } catch (error) {
      throw new Error("Error while calculating standard deviation"+ error.message);
      
    }
}

const meanCalculation = async (STDEVP,ratings,peerRatings,allRatings,managerName)=>{
  
  if(!STDEVP){
    //historical data for the same manager
    const historicalRatings = await incrementModel.getHistoricalRatings(managerName);
    if(historicalRatings.length){
      //combine average for all the reportees of current ratings and historical ratings
     return calculateAverage([ratings,...peerRatings, ...historicalRatings]);
    }
    else {

      //average for all the employees of the current data
     return calculateAverage([...allRatings])
    }
  }
  else {
  console.log("All average")
   return calculateAverage([ratings,...peerRatings]);
  }
}

const standardDevCalculation = async(STDEVP,ratings,peerRatings,allRatings,managerName)=>{
  if(!STDEVP){
    const historicalRatings = await incrementModel.getHistoricalRatings(managerName);
    if(historicalRatings.length){
      return calculateStandardDeviation([ratings,...peerRatings,...historicalRatings]);
    }else {
      return calculateStandardDeviation([...allRatings])
    }
  }else {
   return calculateStandardDeviation([ratings,...peerRatings]);
  }

}

function calculateStandardizedValue(value, mean, stdDev) {
  try{
    if (stdDev === 0) {
      throw new Error("Standard deviation is zero, cannot standardize.");
  }
  return (value - mean) / stdDev;
  }catch(err){
    throw new Error("Error while calculating standardized value: "+ err.message);
  }

}

const getNormalizedRating = async (data)=>{
  try {
    const ratings = data.ratings ? Number(data.ratings):0;
    const {reviewCycle,employeeId,managerName} = data;
    if(ratings){

      //peer ratings for the same manager
      const peerRatings = await incrementModel.getPeerRatings(managerName, employeeId,reviewCycle);

      //population standard deviation for the all reportees

      const STDEVP = await calculateStandardDeviation([ratings,...peerRatings]);
    
      const allRatings = await incrementModel.getAllRatings();      
      const mean = await meanCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);
      const std = await standardDevCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);
      const normalizedRating = await calculateStandardizedValue(ratings,mean,std);
      
      
      return parseFloat(normalizedRating.toFixed(2));
    }
    else {
      throw new Error("No ratings found for the employee");
    }
    
  } catch (error) {
    console.log(error)
    throw new Error("Error while calculating normalized rating "+ error.message);
  }
}

const getIncrement = async(normalizedRating,employeeId,reviewCycle)=>{
  try {
    const result = await incrementModel.getIncrement(normalizedRating,employeeId,reviewCycle);
    return result;
  } catch (error) {
    console.log(error, "error")
    throw new Error(`Service Error: Unable to fetch increment data. ${error.message}`);
  }
}

const getWeightedIncrement = async (id,biAnnualIncrement,annualIncrement)=>{
  try {
    const result = await incrementModel.getWeightedIncrement(id,biAnnualIncrement,annualIncrement);
    return result;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch weighted increment data. ${error.message}`);
  }
}

const getIncrementDataByReviewCycle = async (employeeID,reviewCycle)=>{
  try {
    const result = await incrementModel.getIncrementDataByReviewCycle(employeeID,reviewCycle);
    return result;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch increment data. ${error.message}`);
  }
}

const getHistoricalData = async (employeeName)=>{
  try {
    const result = await incrementModel.getHistoricalData(employeeName);
    return result;
  } catch (error) {
    console.log(error)
    throw new Error(`Service Error: Unable to fetch historical data. ${error.message}`);
  }
}

const getBulkNormalizedRatings = async()=>{
  try {
    const allIncrementData = await incrementModel.getAllInrementData();
    allIncrementData.forEach(async incrementData=>{
      
      let data={};
      data.employeeId = incrementData.employee_id;
      data.reviewCycle = incrementData.appraisal_cycle;
      data.managerName = incrementData.manager;
      data.ratings = incrementData.average;
      const normalizedRating = await getNormalizedRating(data);
      await incrementModel.updateNormalizedRatings(incrementData.employee_id,normalizedRating,incrementData.appraisal_cycle);


    })

    return allIncrementData;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch bulk normalized ratings. ${error.message}`);
  }

};

const getBulkIncrement = async ()=>{
  try {
    const allIncrementData = await incrementModel.getAllInrementData();
    allIncrementData.forEach(async incrementData=>{
    if(incrementData.normalize_rating && !incrementData.increment){
      const increment = await getIncrement(incrementData.normalize_rating,incrementData.employee_id,incrementData.appraisal_cycle);
      await db("increment_details").update({increment}).where({id:incrementData.id});
    }
    })
    return allIncrementData;
  } catch (error) {
    console.log("error",error)
    throw new Error(`Service Error: Unable to fetch bulk increment data. ${error.message}`);
  }
}

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
    dataObj.employee_id = `${employeeInfo[0]}`;
    dataObj.full_name = `${employeeInfo[1]} ${employeeInfo[2]}`;
    dataObj.manager = `${managerInfo[1]} ${managerInfo[2]}`;
    dataObj.average = parseFloat(row['Final Score']);
    dataObj.kra_vs_goals = parseFloat(row['KRA vs GOALS']);
    dataObj.compentency = parseFloat(row.Competency);
    dataObj.appraisal_cycle = row['Appraisal Cycle'] ? row['Appraisal Cycle'] : "April-Sep 2024";

    await db('increment_details').insert(dataObj);
    }
    return { message: "Data uploaded and inserted successfully!" };
  } catch (err) {
    console.error(err);
    throw new Error("Error while uploading Excel file: " + err.message);
  }
};
  module.exports = {
    fetchIncrementData,
    fetchIncrementDataById,
    createNewIncrementData,
    updateExistingIncrementData,
    deleteIncrementDataById,
    filterIncrementData,
    searchIncrementData,
    getDropdownOptions,
    getPickList,
    fetchFilterDropdowns,
    getNormalizedRating,
    getIncrement,
    getIncrementDataByReviewCycle,
    getHistoricalData,
    getBulkNormalizedRatings,
    getBulkIncrement,
    uploadExcelFile
  };