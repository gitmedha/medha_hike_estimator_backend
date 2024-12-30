const xlsx = require('xlsx');

const {
    getBonus,
    getBonusDropdown,
    searchBonus,
    createBonus,
    getBonusById,
    getBonusPickLists,
    updateBonus,
    insertBulkData,
    getPeerRatings,
    getAllRatings,
    getHistoricalRatings,
    deleteBonus
} = require("../models/bonus.model");

const fetchAllBonusService = async(offset,limit,sortBy,sortByOrder)=>{
    try{
        if(isNaN(offset) || isNaN(limit)){
            throw new Error("Invalid offset or limit");
        }

        const bonusData = await getBonus(offset, limit, sortBy, sortByOrder);
        return bonusData;
    } catch(error){
        throw new Error(`Service Error: Unable to fetch bonus data. ${error.message}`);
    }
 }

 const searchDropDownService = async (field)=>{
    try{
        const dropdownData = await getBonusDropdown(field);
        const modifiedDropdown = dropdownData.map((dropdown)=>({
            label: dropdown[field],
            value: dropdown[field]
        }))
        return modifiedDropdown;
    } catch(error){
        throw new Error(`Service Error: Unable to fetch dropdown data. ${error.message}`);
    }
 }

 const searchBonusService = async(field,value,offset,limit)=>{
    try{
        if(isNaN(offset) || isNaN(limit)){
            throw new Error("Invalid offset or limit");
        }
        const bonusData = await searchBonus(field, value, offset, limit);
        return bonusData;
    }
    catch(e){
        console.error('Error in searchBonusService:', e.message);
        throw e;
    }
 }

 const createBonusService = async(bonusData)=>{
    try{
        const result = await createBonus(bonusData);
        return result;
    } catch(error){
        console.error('Error in createBonusService:', error.message);
        throw error;
    }
 }


const getBonusByIdService = async(id)=>{
    try{
        if(!id){
            throw new Error("Invalid bonus id");
        }
        const bonusData = await getBonusById(id);
        return bonusData;
    } catch(error){
        console.error('Error in getBonusByIdService:', error.message);
        throw error;
    }
 
}

const getPickLists = async ()=>{
    try{
        const pickLists =  {

        }
        const {IDS,Names,Managers} = await getBonusPickLists();

        pickLists.IDS = IDS.map((entity)=>({
            label: entity.employee_id,
            value: entity.employee_id
        }))
        pickLists.Names = Names.map((entity)=>({
            label: entity.full_name,
            value: entity.full_name
        }))

        pickLists.Managers = Managers.map((entity)=>({
            label: entity.manager,
            value: entity.manager
        }))

        return pickLists;
    } catch(error){
        console.error('Error in getPickLists:', error.message);
        throw error;
    }
 }
 const updateBonusService = async(id,body)=>{
    try{
        if(!id){
            throw new Error("Invalid bonus id");
        }
        const result = await updateBonus(id,body);
        return result;
    } catch(error){
        console.error('Error in updateBonusService:', error.message);
        throw error;
    }
 }


 const uploadBonusData = async (req) => {
    try {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
  
      const requiredFields = {
        id: '__EMPTY',
        name: '__EMPTY_1',
        kra: 'Apr - Mar 2023',
        competency: '__EMPTY_2',
        average: '__EMPTY_3',
        manager: '__EMPTY_4',
      };
  
      const filteredDataDynamic = [];
      for (const row of data.slice(1)) {
        const result = {};
        let isValid = true;
  
        for (const [key, value] of Object.entries(requiredFields)) {
          result[key] = row[value];
  
          if (!result[key]) {
            isValid = false;
          }
        }
  
        if (isValid) {
          filteredDataDynamic.push(result);
        }
  
        if (result.id === "M0135") {
          break;
        }
      }
  
      for (const row of filteredDataDynamic) {
        await insertBulkData(row);
      }
  
    } catch (error) {
      console.error('Error in uploadBonusData:', error.message);
      throw error;
    }
  };

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
    const historicalRatings = await getHistoricalRatings(managerName);
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
    const historicalRatings = await getHistoricalRatings(managerName);
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
  try{
    if (stdDev === 0) {
      throw new Error("Standard deviation is zero, cannot standardize.");
  }
  return (value - mean) / stdDev;
  }catch(err){
    throw new Error("Error while calculating standardized value: "+ error.message);
  }

}

const calculateBonusRating = async (data)=>{
    try {
        const ratings = data.ratings ? Number(data.ratings):0;
        const {reviewCycle,employeeId,managerName} = data;
        if(ratings){
    
          //peer ratings for the same manager
          const peerRatings = await getPeerRatings(managerName, employeeId,reviewCycle);
    
          //population standard deviation for the all reportees
    
          const STDEVP = await calculateStandardDeviation([ratings,...peerRatings]);
        
          const allRatings = await getAllRatings();
          
          const mean = await meanCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);
          const std = await standardDevCalculation(STDEVP,ratings,peerRatings,allRatings,managerName);
          const normalizedRating = await calculateStandardizedValue(ratings,mean,std);
         
          // await incrementModel.updateNormalizedRatings(employeeId,normalizedRating.toFixed(2),reviewCycle);
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

const deleteBonusService = async (id)=>{
  try{
    if(!id){
        throw new Error("Invalid bonus id");
    }
    await deleteBonus(id);
    return true;
  } catch(error){
    console.error('Error in deleteBonusService:', error.message);
    throw error;
  }
 
}

module.exports = {
    fetchAllBonusService,
    searchDropDownService,
    searchBonusService,
    createBonusService,
    getBonusByIdService,
    getPickLists,
    updateBonusService,
    deleteBonusService,
    uploadBonusData,
    calculateBonusRating
}