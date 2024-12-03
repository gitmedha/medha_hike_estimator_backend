const incrementModel =  require('../models/increment.model');

const fetchIncrementData = async (offset, limit, sortBy, sortOrder) => {
    try {
        const result = await incrementModel.getIncrementData(offset, limit, sortBy, sortOrder);
        return result;
    } catch (err) {
        throw new Error(`Service Error: Unable to fetch increment data. ${err.message}`);
    }
};


const fetchIncrementDataById = async (id) => {
    try {
      const result = await incrementModel.getIncrementDataById(id);
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
      console.log(result)
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
    if(historicalRatings){
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

const standardDevCalculation = async(STDEVP,ratings,peerRatings,allRatings,managerName)=>{
  if(!STDEVP){
    const historicalRatings = await incrementModel.getHistoricalRatings(managerName);
    console.log(historicalRatings)
    if(historicalRatings){
      return calculateStandardDeviation([ratings,...peerRatings,...historicalRatings]);
    }else {
      return calculateStandardDeviation([...allRatings])
    }
  }else {
   return calculateStandardDeviation([ratings,...peerRatings]);
  }

}

function calculateStandardizedValue(value, mean, stdDev) {
  if (stdDev === 0) {
      throw new Error("Standard deviation is zero, cannot standardize.");
  }
  return (value - mean) / stdDev;
}

const getNormalizedRating = async (data)=>{
  try {
    const ratings = data.ratings ? Number(data.ratings):0;
    const {reviewCycle,employeeId,managerName} = data

    // const ratings = data.employeeRating = 3.1 manager name Byomkesh Mishra this is testing when historical data is available 
    // const ratings = 4.4 
    //manager name Saurabh rai when historical data is not available

    if(ratings){

      //peer ratings for the same manager
      const peerRatings = await incrementModel.getPeerRatings(managerName, employeeId,reviewCycle);

      // const peerRatings = [3.0,3.9,3.7,3.6] - Byomkesh Mishra reportee data
      // const peerRatings = [3.5,3.0,2.7,4.1]
      // const peerRatings = [3.5,4.0,3.0,3.3] - Saurabh Rai reportee data

      //population standard deviation for the all reportees

      const STDEVP = await calculateStandardDeviation([ratings,...peerRatings]);

      const allRatings = await incrementModel.getAllRatings();
      
      const mean = await meanCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);
      const std = await standardDevCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);

      const normalizedRating = await calculateStandardizedValue(ratings,mean,std);
      
      await incrementModel.updateNormalizedRatings(employeeId,normalizedRating.toFixed(2),reviewCycle)
      return parseFloat(normalizedRating.toFixed(2));
    }
    else {
      throw new Error("No ratings found for the employee");
    }
    
  } catch (error) {
    console.log(error)
    throw new Error("Error while calculating normalized rating"+ error.message);
  }
}

const getIncrement = async(normalizedRating,employeeId,reviewCycle)=>{
  try {
    const result = await incrementModel.getIncrement(normalizedRating,employeeId,reviewCycle);
    return result;
  } catch (error) {
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
    getIncrement
  };