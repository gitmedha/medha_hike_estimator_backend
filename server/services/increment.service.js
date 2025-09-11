const incrementModel =  require('../models/increment.model');
const db = require('../config/db');
const xlsx = require('xlsx');

const fetchIncrementData = async (offset, limit, sortBy, sortOrder, filters={}) => {
    try {
        const result = await incrementModel.getIncrementData(offset, limit, sortBy, sortOrder, filters);
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
      console.log(err);
      throw new Error(`Service Error: Unable to delete increment data. ${err.message}`);
    }
  };

  const filterIncrementData = async (fields, values, limit, offset,reviewCycle) => {
    try {
      const result = await incrementModel.filterIncrementData(fields, values, limit, offset,reviewCycle);
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to filter increment data. ${err.message}`);
    }
  };

  const searchIncrementData = async (field, value, offset, limit,reviewCycle) => {
    try {
      const result = await incrementModel.searchIncrementData(field, value, offset, limit,reviewCycle);
      return result;
    } catch (err) {
      console.log(err)
      throw new Error(`Service Error: Unable to search increment data. ${err.message}`);
    }
  };

  const getDropdownOptions = async (field,reviewCycle) => {
    try {
      const options = await incrementModel.getSearchDropdowns(field,reviewCycle);
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

const meanCalculation = async (STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle)=>{
  // If standard deviation is 0, try to include historical ratings if available

  if(!STDEVP){
    //historical data for the same manager
    const historicalRatings = await incrementModel.getHistoricalRatings(managerName,reviewCycle);
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
   return calculateAverage([ratings,...peerRatings]);
  }
}

const standardDevCalculation = async(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle)=>{
  if(!STDEVP){
    const historicalRatings = await incrementModel.getHistoricalRatings(managerName,reviewCycle);
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

      console.log("ratings",ratings)
      //peer ratings for the same manager
      const peerRatings = await incrementModel.getPeerRatings(managerName, employeeId,reviewCycle);

      console.log("peerRatings",peerRatings)

      //population standard deviation for the all reportees

      const STDEVP =  calculateStandardDeviation([ratings,...peerRatings]);


      console.log("STDEVP",STDEVP)
    
      const allRatings = await incrementModel.getAllRatings(reviewCycle);      
      const mean = await meanCalculation(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle);
      const std = await standardDevCalculation(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle);
      console.log("mean",mean)
      console.log("std",std)
      
      const normalizedRating = calculateStandardizedValue(ratings,mean,std,reviewCycle);
      
      
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

const getWeightedIncrement = async (id,appraisal_cycle)=>{
  try {
    const result = await incrementModel.getWeightedIncrement(id,appraisal_cycle);
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

const getHistoricalData = async (employeeName,sortBy,sortOrder)=>{
  try {
    const result = await incrementModel.getHistoricalData(employeeName,sortBy,sortOrder);
    return result;
  } catch (error) {
    console.log(error)
    throw new Error(`Service Error: Unable to fetch historical data. ${error.message}`);
  }
}

const getBulkNormalizedRatings = async(reviewCycle)=>{
  try {
    const allIncrementData = await incrementModel.getAllInrementData(reviewCycle);
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

const getBulkIncrement = async (reviewCycle)=>{
  try {
    const allIncrementData = await incrementModel.getAllInrementData(reviewCycle);
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

    const reviewCycle = validRows[0]['review_cycle'];
    if (!reviewCycle) {
      throw new Error("Missing review cycle in data");
    }

    // ✅ Check if data already exists for this review cycle
    const existing = await db('increment_details')
      .where('appraisal_cycle', reviewCycle)
      .first();

    if (existing) {
      throw new Error(`Data for review cycle "${reviewCycle}" already exists.`);
    }

    // Transform data to match your database schema
    const incrementData = validRows.map(row => ({
      employee_id: row.employee_id,
      full_name: row.full_name,
      manager: row.manager,
      kra_vs_goals: parseFloat(row.kra) || 0,
      compentency: parseFloat(row.compentency) || 0,
      average: parseFloat(row.average) || 0,
      normalize_rating: parseFloat(row.normalized_ratings) || 0,
      increment: parseFloat(row.increment) || 0,
      weighted_increment: parseFloat(row.weighted_increment) || 0,
      long_tenure: row.long_tenure === 'true' || row.long_tenure === true || row.long_tenure === '1',
      current_band: row.current_band,
      current_salary: parseFloat(row.current_salary) || 0,
      new_band: row.new_band,
      new_salary: parseFloat(row.new_salary) || 0,
      appraisal_cycle: row.review_cycle // Note: mapping review_cycle to appraisal_cycle
    }));

    // Insert all valid rows directly into increment_details table
    await db("increment_details").insert(incrementData);
    console.log("Increment data inserted successfully");

    return {
      success: true,
      message: "Increment data inserted successfully!",
      recordsInserted: incrementData.length
    };
  } catch (err) {
    console.error("Database insertion error:", err);
    
    // Check for specific database errors
    let errorMessage = "Error while inserting increment data";
    
    if (err.code === '23505') { // PostgreSQL unique violation
      errorMessage = "Duplicate increment entry found. Please check your data.";
    } else if (err.code === '23502') { // PostgreSQL not null violation
      errorMessage = "Required fields are missing. Please check your data.";
    } else if (err.code === '22007') { // PostgreSQL invalid datetime format
      errorMessage = "Invalid date format. Please use YYYY-MM-DD format.";
    } else {
      errorMessage = err.message || "Unknown database error occurred";
    }

    throw new Error(errorMessage);
  }
};

const getBulkWeightedIncrement = async (reviewCycle)=>{
  try {
    const allIncrementData = await incrementModel.getAllInrementData(reviewCycle);
    allIncrementData.forEach(async incrementData=>{
    if(incrementData.increment){
      const weightedIncrement = await incrementModel.getWeightedIncrement(incrementData.employee_id,incrementData.appraisal_cycle);
      await db("increment_details").update({weighted_increment:parseFloat(weightedIncrement)}).where({id: incrementData.id});
    }
    })
    return allIncrementData;
  } catch (error) {
    console.log("error",error)
    throw new Error(`Service Error: Unable to fetch bulk weighted increment data. ${error.message}`);
  }
}
const transferIncrementToHistorical = async (reviewCycle) => {
  if (!reviewCycle) {
    throw new Error("Review cycle is required to transfer increment data to historical.");
  }
  const [startMonth, endMonth] = reviewCycle.split("-").map(part => part.trim());

  try {
    const allIncrementData = await incrementModel.getAllInrementData(reviewCycle);
    if (allIncrementData.length === 0) {
      throw new Error(`No increment data found for review cycle: ${reviewCycle}`);
    }

    for (const incrementRecord of allIncrementData) {
     
      const historicalRecord = {
        employee_id: incrementRecord.employee_id,
        employee: incrementRecord.full_name,
        kra_vs_goals: incrementRecord.kra_vs_goals,
        competency: incrementRecord.compentency,
        final_score: incrementRecord.average,
        start_month: startMonth,
        ending_month: endMonth,
        reviewer: incrementRecord.manager
      };

      await incrementModel.createHistoricalRecord(historicalRecord);      
      console.log(`Transferred record for employee ${incrementRecord.employee_id} to historical data`);
    }

    return { 
      message: `Increment data for review cycle ${reviewCycle} transferred to historical successfully`,
      count: allIncrementData.length 
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Service Error: Unable to transfer increment data to historical. ${error.message}`);
  }
}

const getPicklistValues = async(field)=>{
  try { 
    const result = await incrementModel.getPicklistValues(field);
    return result.map((item) => ({
      label: item[field],
      value: item[field],
    }));
  } catch (error) {
    throw new Error(`Service Error: ${error.message}`);
  }
}
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
    uploadExcelFile,
    getBulkWeightedIncrement,
    getWeightedIncrement,
    transferIncrementToHistorical
  };