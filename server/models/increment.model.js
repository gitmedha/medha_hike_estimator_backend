const db = require('../config/db');

const getIncrementData = async(offset,limit,sortBy,sortOrder)=>{
    try{

       const incrementData = await db
            .select("*")
            .from(function () {
                this.select("id.*")
                    .from("increment_details as id")
                    .whereRaw(`
                        RIGHT(appraisal_cycle, 4) = (
                            SELECT MAX(RIGHT(appraisal_cycle, 4)) 
                            FROM increment_details 
                            WHERE employee_id = id.employee_id
                        )
                    `)
                    .as("latest_increment");
            })
            .offset(offset)
            .limit(limit)
            .orderByRaw("CAST(RIGHT(appraisal_cycle, 4) AS INTEGER) DESC");

        const totalCount = await db("increment_details")
            .countDistinct("employee_id as total");

        return {
            totalCount: totalCount[0].total,
            data: incrementData,
        };
    }catch(err){
        throw new Error('Error fetching increment data');
    }
}

const getIncrementDataById = async (id,review_cycle) => {
    try {
        console.log(id,review_cycle)
        const ifExists = (await db('increment_details').select('*').where('employee_id',id)).length && (await db('employee_details').select('*').where('employee_id',id)).length;
        if(!ifExists) throw new Error('Employee not found');

      const incrementData = await db('increment_details')
        .select(
          'increment_details.*',
          'employee_details.department',
          'employee_details.title',
          'employee_details.employee_status'
        )
        .innerJoin(
          'employee_details',
          'increment_details.employee_id',
          'employee_details.employee_id'
        )
        .where('increment_details.employee_id', id)
        .andWhere('increment_details.appraisal_cycle',review_cycle);
  
      return incrementData;
    } catch (err) {
      console.error(err);
      throw new Error('Error fetching increment data by ID');
    }
  };
  

const createIncrementData = async(incrementData)=>{
    try{
        const newIncrement = await db('increment_details').insert(incrementData).returning('employee_id');
        return newIncrement;
    }catch(err){
        console.log(err);
        throw new Error('Error creating increment data');
    }
}
const updateIncrementData = async(updatedData,id)=>{
    try{
        const updatedIncrement= await db('increment_details').where('id', id).update(updatedData);
        return updatedIncrement;
    }catch(err){
        console.log(err);
        throw new Error('Error updating increment data');
    }
}

const deleteIncrementData = async(id)=>{
    try{
        const deletedIncrement = await db('increment_details').where('id', id).del();
        return deletedIncrement;
    }catch(err){
        throw new Error('Error deleting increment data');
    }
}

const fetchFilterDropdown = async()=>{
    try {
        picklistFields = await db('increment_details').select('new_band','tenure').distinct().whereNotNull('new_band','tenure');
        return picklistFields;
    } catch (error) {
        throw new Error(`Error fetching filter dropdown data: ${error.message}`);
    }
}
const filterIncrementData = async (fields,values,limit,offset) =>{
    try{
        if (fields.length !== values.length) {
            throw new Error('Fields and values arrays must have the same length');
        }
        const baseQuery = db('increment_details');

        fields.forEach((field, index) => {
            baseQuery.where(field, values[index]);
        });

        const paginatedData = await baseQuery
        .clone()
        .select("*")
        .limit(limit)
        .offset(offset);

        return {
            total: paginatedData.length,
            data: paginatedData,
        };
    }catch(err){
        throw new Error(`Error filtering increment data: ${err.message}`);
    }
}

const searchIncrementData = async(searchField,value,offset,limit)=>{
    try{
        const isNumeric = typeof value === 'number';

        const incrementData = await db('increment_details')
        .select("*")
        .where(searchField, isNumeric ? '=' : 'ilike', isNumeric ? value : `%${value}%`)
        .offset(offset)
        .limit(limit);

        const totalCountResult = await db('increment_details')
        .where(searchField, isNumeric ? '=' : 'ilike', isNumeric ? value : `%${value}%`)
        .count('* as total');

        const totalCount = totalCountResult[0].total;

        return {
            totalCount,
            data: incrementData,
        };

    }catch(err){
        throw new Error(`Error searching increment data: ${err.message}`);
    }
}

const getSearchDropdowns = async(Field) => {
    try{
        const searchDropdowns = await db('increment_details')
       .select(Field)
       .distinct()
       .orderBy(Field, 'asc');
       return searchDropdowns;
    }catch(err){
        throw new Error("Error while fetching search picklist" + err.message)
    }
}


const getPickList = async()=>{
    try{
        const employees = await db('employee_details').select("employee_id", "first_name", "last_name").distinct();
        const managers = await db('historical_data').select('reviewer').distinct();
        return {
            employees:employees,
            managers:managers
        };
    }catch(err){
        throw new Error('Error fetching picklist values');
    }
}


const getEmployeeRating = async (employeeId)=>{
    try{
        const employeeRating = await db('increment_details')
        .select('average')
        .where('employee_id ',employeeId)
        // .andWhere('appraisal_cycle',reviewCycle)
        return employeeRating;
    }catch(err){
        console.log(err);
        throw new Error('Error fetching employee ratings');
    }
}

const getPeerRatings = async (managerName,employeeID,reviewCycle)=>{
    try{
        if (!managerName) {
            throw new Error('Manager name is required');
        }
        const peerRatings = await db('increment_details')
        .select('average').where('manager', managerName)
        .andWhere('appraisal_cycle',reviewCycle)
        .andWhereNot('employee_id',employeeID);
        const peerRatingsList = peerRatings.map(rating => parseFloat(rating.average));
        return peerRatingsList;

    }catch(err){

        throw new Error('Error fetching peer ratings');
    }
}

const getHistoricalRatings = async (managerName)=>{
    try{
        const historicalRatings = await db('historical_data').select('final_score').where('reviewer',managerName);
        const historicalRatingList = historicalRatings.map(historicalRating=>parseFloat(historicalRating.final_score));
        return historicalRatingList;
    }catch(err){
        throw new Error('Error fetching historical ratings');
    }
}

const getAllRatings = async ()=>{
    try{
        const allRatings = await db('increment_details')
        .select('average')
        // .andWhere('appraisal_cycle',reviewCycle);
        const allRatingsList = allRatings.map(rating => parseFloat(rating.average));
        return allRatingsList;
    }catch(err){
        throw new Error('Error fetching all ratings');
    }
}

const getIncrement = async (normalizedRating,employeeId,reviewCycle)=> {
    console.log(normalizedRating)
    try {
      const result = await db('increment_measurements')
        .select('increment_range', 'increment_percentage')
        .where('increment_range', '>=', normalizedRating)
        .orderBy('increment_range', 'asc')
        .first(); 

      if (result) {
        await db('increment_details')
        .where('employee_id', employeeId)
        .andWhere('appraisal_cycle', reviewCycle)
        .update('increment', result.increment_percentage);
        return result.increment_percentage;
      }
  
      return null;
    } catch (error) {
      console.error('Error querying the database:', error);
      throw error;
    }
  }

const updateNormalizedRatings = async (employeeID,rating,reviewCycle) =>{
    try{
        const updatedRating = await db('increment_details')
        .where('employee_id', employeeID)
        .andWhere('appraisal_cycle',reviewCycle)
        .update('normalize_rating', rating);

        return updatedRating;
    }catch(err){
        console.log(err);
        throw new Error('Error updating normalized rating');
    }
}

function findLesserYearData(records, currentAppraisalCycle) {
    try{
        
    const currentYear = parseInt(currentAppraisalCycle.split(' ')[1]);
    for (const record of records) {
      const year = parseInt(record.appraisal_cycle.split(' ')[1]);
    
      if (year < currentYear) {
        return record;
      }
    }
  
    return null;

    }catch(e){
        console.log(e);
        throw new Error('Error finding lesser year data');
    }
  }

  
  const getWeightedIncrement = async (employee_id, review_cycle) => {
    try {
        
      if (!employee_id || !review_cycle) {
        throw new Error('Invalid employee_id or review_cycle');
      }
      
  
      // Fetch the latest increment record for the employee
      const incrementRecord = await db('increment_details')
        .select("*")
        .where('employee_id', employee_id)
        .andWhere('appraisal_cycle', review_cycle)
        .first();
  
      if (!incrementRecord) {
        throw new Error('No increment record found for the given review cycle');
      }

  
      // Extract the increment year (last 4 digits)
      const incrementYearMatch = incrementRecord.appraisal_cycle.match(/\d{4}$/);
      if (!incrementYearMatch) {
        throw new Error('Invalid increment review cycle format');
      }
      const incrementYear = parseInt(incrementYearMatch[0]); // e.g., 2024
  
      // Fetch the most recent past bonus where the ending year is LESS THAN the current increment year
      const pastBonusRecord = await db('bonus_details')
        .select("*")
        .where('employee_id', employee_id)
        .andWhereRaw(`CAST(RIGHT(review_cycle, 4) AS INT) < ?`, [incrementYear])
        .orderByRaw(`CAST(RIGHT(review_cycle, 4) AS INT) DESC`)
        .first();
  
      if (!pastBonusRecord || !pastBonusRecord.bonus) {
        return parseFloat(incrementRecord.increment).toFixed(2); // Return only the current increment if no past bonus exists
      }
  
      const currentIncrement = parseFloat(incrementRecord.increment);
      const pastBonus = parseFloat(pastBonusRecord.bonus);
  
      // Calculate weighted increment
      const weightedIncrement = (pastBonus * 0.33334) + (currentIncrement * 0.66667);
      return weightedIncrement.toFixed(2);
  
    } catch (err) {
      console.error('Error in getWeightedIncrement:', err);
      throw new Error('Error fetching weighted increment');
    }
  };
  


const getIncrementDataByReviewCycle = async(employeeID,reviewCycle)=>{
    try{
        const incrementData = await db('increment_details').select("*").where('appraisal_cycle', reviewCycle).andWhere('employee_id', employeeID)
        return incrementData;
    }catch(err){
        throw new Error('Error fetching increment data by review cycle');
    }
}

const getHistoricalData = async (emplyeeName)=>{
    try{
        const historicalData = await db('historical_data').select("*").where('employee', emplyeeName);
        return historicalData;
    }catch(err){
        console.log(err)
        throw new Error('Error fetching historical data');
    }
}

const getAllInrementData = async ()=>{
    try{
        const allIncrementData = await db('increment_details').select("*");
        return allIncrementData;
    }catch(err){
        throw new Error('Error fetching all increment data');
    }
}

module.exports = {
    getIncrementData,
    getIncrementDataById,
    createIncrementData,
    updateIncrementData,
    deleteIncrementData,
    filterIncrementData,
    searchIncrementData,
    getSearchDropdowns,
    getPickList,
    fetchFilterDropdown,
    getPeerRatings,
    getHistoricalRatings,
    getAllRatings,
    getIncrement,
    updateNormalizedRatings,
    getIncrementDataByReviewCycle,
    getHistoricalData,
    getAllInrementData,
    getWeightedIncrement
}