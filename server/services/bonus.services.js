const xlsx = require('xlsx');
const db = require('../config/db')

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
    deleteBonus,
    calculateBonus,
    getAllData,
    updateNormalizedRating
} = require("../models/bonus.model");

const fetchAllBonusService = async(offset,limit,sortBy,sortByOrder)=>{
    try{
        if(isNaN(offset) || isNaN(limit)){
            throw new Error("Invalid offset or limit");
        }

        const bonusData = await getBonus(offset, limit, sortBy, sortByOrder);
        return bonusData;
    } catch(error){
      console.log("errprint",error)
        throw new Error(`Service Error: Unable to fetch bonus data. ${error.message}`);
    }
 }

 const searchDropDownService = async (field,reviewCycle)=>{
    try{
        const dropdownData = await getBonusDropdown(field,reviewCycle);
        const modifiedDropdown = dropdownData.map((dropdown)=>({
            label: dropdown[field],
            value: dropdown[field]
        }))
        return modifiedDropdown;
    } catch(error){
        throw new Error(`Service Error: Unable to fetch dropdown data. ${error.message}`);
    }
 }

 const searchBonusService = async(field,value,reviewCycle,offset,limit)=>{
    try{
        if(isNaN(offset) || isNaN(limit)){
            throw new Error("Invalid offset or limit");
        }
        const bonusData = await searchBonus(field, value, reviewCycle,offset, limit);
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


const getBonusByIdService = async(id,reviewCycle)=>{
    try{
        if(!id){
            throw new Error("Invalid bonus id");
        }
        if(!reviewCycle){
          throw new Error("Invalid review cycle");
        }
        const bonusData = await getBonusById(id,reviewCycle);
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

    for (let i = 0; i < data.length; i++){

      let row = data[i];

      const dataObj = {};
  
  
      let employeeInfo = row.Employee.split(" ");
      let managerInfo = row.Reviewer.split(" ");
  
      dataObj.id = `${employeeInfo[0]}`;
      dataObj.name = `${employeeInfo[1]} ${employeeInfo[2]}`;
      dataObj.manager = `${managerInfo[1]} ${managerInfo[2]}`;
      dataObj.average = parseFloat(row['Final Score']);
      dataObj.kra = parseFloat(row['KRA vs GOALS']);
      dataObj.competency = parseFloat(row.Competency);
      dataObj.review_cycle = row['Appraisal Cycle'];
    await insertBulkData(dataObj);
    }
    return { message: "Data uploaded and inserted successfully!" };

  } catch (error) {
    console.log("error",error)
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

const meanCalculation = async (STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle)=>{
  
  if(!STDEVP){
    //historical data for the same manager
    const historicalRatings = await getHistoricalRatings(managerName,reviewCycle);
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

const standardDevCalculation = async(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle)=>{
  if(!STDEVP){
    const historicalRatings = await getHistoricalRatings(managerName,reviewCycle);
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
    throw new Error("Error while calculating standardized value: ", err.message);
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
          const allRatings = await getAllRatings(reviewCycle);
          
          const mean = await meanCalculation(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle);

          const std = await standardDevCalculation(STDEVP,ratings,peerRatings,allRatings,managerName,reviewCycle);
          const normalizedRating = await calculateStandardizedValue(ratings,mean,std);
          return parseFloat(normalizedRating.toFixed(2));
        }
        else {
          throw new Error("No ratings found for the employee");
        }
        
      } catch (error) {
        console.log(error)
        throw new Error("Error while calculating normalized rating ", error.message);
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
const calculateBonusPercentage = async(ratings,id,reviewCycle) => {
  try{
    const result = await calculateBonus(ratings,id,reviewCycle);
    return result;
  }catch(error){
    console.error('Error in calculateBonusPercentage:', error.message);
    throw error;
  }
}


const BulkBonusRating = async(reviewCycle)=>{
  try {
    const allData = await getAllData(reviewCycle);
    allData.forEach(async bonusData=>{
      
      let data={};
      data.employeeId = bonusData.employee_id;
      data.reviewCycle = bonusData.review_cycle;
      data.managerName = bonusData.manager;
      data.ratings = bonusData.average;
      const normalizedRating = await calculateBonusRating(data);
      await updateNormalizedRating(bonusData.employee_id,bonusData.review_cycle,normalizedRating);
    })

    return allData;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch bulk normalized ratings. ${error.message}`);
  }

};

const BulkBonus = async(reviewCycle)=>{
  try {
    const allData = await getAllData(reviewCycle);
    allData.forEach(async bonusData=>{
      if(bonusData.normalized_ratings && !bonusData.bonus ){
      const bonus = await calculateBonusPercentage(bonusData.normalized_ratings,bonusData.employee_id,bonusData.review_cycle);
      await db('bonus_details').update({ bonus: bonus}).where('id',bonusData.id);
      }
    })

    return allData;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch bulk normalized ratings. ${error.message}`);
  }

}


const getWeightedBonus = async (employee_id, review_cycle) => {
  try {
    if (!employee_id || !review_cycle) {
      throw new Error('Invalid employee_id or review_cycle');
    }

    // Fetch the latest bonus record for the employee
    const bonusRecord = await db('bonus_details')
      .select("*")
      .where('employee_id', employee_id)
      .andWhere('review_cycle', review_cycle)
      .first();

    if (!bonusRecord) {
      throw new Error('No bonus record found for the given review cycle');
    }

    const bonusYearMatch = bonusRecord.review_cycle.match(/\d{4}$/);
    if (!bonusYearMatch) {
      throw new Error('Invalid bonus review cycle format');
    }
    const bonusYear = parseInt(bonusYearMatch[0]);

    const pastIncrement = await db('increment_details')
    .select("*")
    .where('employee_id', employee_id)
    .andWhereRaw(`CAST(RIGHT(appraisal_cycle, 4) AS INT) = ?`, [bonusYear]) // Extract the last 4 characters and cast to INT
    .first();
    if (!pastIncrement || !pastIncrement.increment) {
      return parseFloat(bonusRecord.bonus).toFixed(2);
    }

    const currentBonus = parseFloat(bonusRecord.bonus);
    const pastIncrementValue = parseFloat(pastIncrement.increment);

    // Calculate weighted bonus
    const weightedBonus = (pastIncrementValue * 0.33334) + (currentBonus * 0.66667);
    return weightedBonus.toFixed(2);

  } catch (err) {
    console.error('Error in getWeightedBonus:', err);
    throw new Error('Error fetching weighted bonus');
  }
};


const calculateBulkWeightedBonus = async (reviewCycle)=>{
  try{
    const allData = await getAllData(reviewCycle);
    allData.forEach(async bonusData=>{
      if(bonusData.bonus){
      const weightedBonus = await getWeightedBonus(bonusData.employee_id,bonusData.review_cycle);
      await db('bonus_details').update({ weighted_bonus: parseFloat(weightedBonus)}).where('id',bonusData.id);
      }
    })

    return allData;
  } catch (error) {
    throw new Error(`Service Error: Unable to fetch bulk normalized ratings. ${error.message}`);
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
    calculateBonusRating,
    calculateBonusPercentage,
    BulkBonusRating,
    BulkBonus,
    getWeightedBonus,
    calculateBulkWeightedBonus
}