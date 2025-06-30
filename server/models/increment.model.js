const db = require('../config/db');
const moment = require('moment-timezone');

const getIncrementData = async (offset, limit, sortBy, sortOrder) => {
    try {
        const rowOffset = offset * limit;

        //Get all distinct appraisal cycles
        const allCycles = db('increment_details')
            .distinct('appraisal_cycle')
            .where('appraisal_cycle', 'like', 'April%-Mar%');

        //Find the maximum (latest) appraisal cycle
        const maxCycle = db.select(db.raw('MAX(appraisal_cycle) as latest_cycle'))
            .from(allCycles.as('all_cycles'));

        // Get all records matching this maximum cycle with pagination
        const incrementData = await db('increment_details')
            .select('*')
            .where('appraisal_cycle', db.raw('(?)', [maxCycle]))
            .offset(rowOffset)
            .limit(limit)
            .modify((queryBuilder) => {
                if (sortBy && sortOrder) {
                    queryBuilder.orderBy(sortBy, sortOrder);
                } else {
                    queryBuilder.orderBy('employee_id', 'asc');
                }
            });

        // Count total records in the latest cycle
        const totalCount = await db('increment_details')
            .count('* as total')
            .where('appraisal_cycle', db.raw('(?)', [maxCycle]));

        return {
            totalCount: totalCount[0].total,
            data: incrementData,
        };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching increment data');
    }
};


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
      console.log(err);
        throw new Error('Error deleting increment data',err);
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
const filterIncrementData = async (fields, values, limit, offset, reviewCycle) => {  
    try {
      if (fields.length !== values.length) {
        throw new Error('Fields and values arrays must have the same length');
      }
  
      const currentDate = new Date();
  
      // Base query for data
      const dataQuery = db('increment_details')
        .join('employee_details', 'increment_details.employee_id', 'employee_details.employee_id')
        .select('increment_details.*')
        .where('increment_details.appraisal_cycle', reviewCycle);
  
      // Base query for count
      const countQuery = db('increment_details')
        .join('employee_details', 'increment_details.employee_id', 'employee_details.employee_id')
        .where('increment_details.appraisal_cycle', reviewCycle);
  
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const value = values[i];
  
        if (field === 'tenure') {
          const [min, max] = value.split('-').map(Number);
  
          dataQuery.whereRaw(
            `EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) BETWEEN ? AND ?`,
            [currentDate, min, max]
          );
          countQuery.whereRaw(
            `EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) BETWEEN ? AND ?`,
            [currentDate, min, max]
          );
        } else if (field === 'current_band') {
          dataQuery.where('employee_details.current_band', value);
          countQuery.where('employee_details.current_band', value);
        } else if (field === 'long_tenure') {
            
            const match = reviewCycle.match(/Mar\s+(\d{4})/i);
            if (!match) throw new Error("Invalid reviewCycle format for long_tenure logic");
          
            const reviewYear = parseInt(match[1]);
            const cutoffDate = new Date(`${reviewYear}-03-31`);
          
            if (value === 'Yes') {
              dataQuery.whereRaw(`EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) >= 4`, [cutoffDate]);
              countQuery.whereRaw(`EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) >= 4`, [cutoffDate]);
            } else if (value === 'No') {
              dataQuery.whereRaw(`EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) < 4`, [cutoffDate]);
              countQuery.whereRaw(`EXTRACT(YEAR FROM AGE(?, employee_details.date_of_joining)) < 4`, [cutoffDate]);
            }
          }
         else {
          dataQuery.where(`increment_details.${field}`, value);
          countQuery.where(`increment_details.${field}`, value);
        }
      }
  
  
      const data = await dataQuery.limit(limit).offset(offset);
      const countResult = await countQuery.count('* as total');
      const total = parseInt(countResult[0].total, 10);
  
      return {
        total,
        data,
      };
    } catch (err) {
      throw new Error(`Error filtering increment data: ${err.message}`);
    }
  };
  
  
  

const searchIncrementData = async(searchField,value,offset,limit,reviewCycle)=>{
    try{
        const incrementData = await db('increment_details')
        .select("*")
        .where(searchField,`${value}`)
        .andWhere('appraisal_cycle', reviewCycle)
        .offset(offset)
        .limit(limit);

        const totalCountResult = await db('increment_details')
        .where(searchField,`${value}`)
        .andWhere('appraisal_cycle', reviewCycle)
        .count('* as total');

        const totalCount = totalCountResult[0].total;

        return {
            totalCount,
            data: incrementData,
        };

    }catch(err){
        console.log("error", err)
        throw new Error(`Error searching increment data: ${err.message}`);
    }
}

const getSearchDropdowns = async(Field,reviewCycle) => {
    try{
        const searchDropdowns = await db('increment_details')
       .select(Field)
       .distinct()
       .where('appraisal_cycle',reviewCycle)
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
        .select('average','employee_id', 'appraisal_cycle').where('manager', managerName)
        .andWhere('appraisal_cycle',reviewCycle)
        .andWhereNot('employee_id',employeeID);
        console.log(peerRatings)
        const peerRatingsList = peerRatings.map(rating => parseFloat(rating.average));
        return peerRatingsList;

    }catch(err){

        throw new Error('Error fetching peer ratings');
    }
}

const getHistoricalRatings = async (managerName,reviewCycle)=>{
    if (!managerName) {
        throw new Error('Manager name is required');
    }
    if (!reviewCycle) {
        throw new Error('Review cycle is required');
    }

    const newDate = reviewCycle.split('-')[1];


const date = new Date('01 ' + newDate);
const formatted = date.toISOString().split('T')[0]; // '2022-03-01'

    try{
        const historicalRatings = await db('historical_data')
        .select('final_score')
        .where('reviewer', managerName)
        .andWhereRaw(
          "TO_DATE('01 ' || ending_month, 'DD Mon YYYY') <= ?",
          [formatted]
        );
  
        const historicalRatingList = historicalRatings.map(historicalRating=>parseFloat(historicalRating.final_score));
        
        return historicalRatingList;
    }catch(err){
        throw new Error('Error fetching historical ratings');
    }
}

const getAllRatings = async (reviewCycle)=>{
    try{
        const allRatings = await db('increment_details')
        .select('average')
        .andWhere('appraisal_cycle',reviewCycle);
        const allRatingsList = allRatings.map(rating => parseFloat(rating.average));
        return allRatingsList;
    }catch(err){
        throw new Error('Error fetching all ratings');
    }
}

const isOlderEmployee = async (id, countingDateStr) => {
  try {
    const employee = await db('employee_details').where('employee_id', id).first();
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Parse dates in IST (Asia/Kolkata)
    const hireDate = moment(employee.date_of_joining).tz('Asia/Kolkata').startOf('day');
    const countingDate = moment(countingDateStr, 'DD/MM/YYYY').tz('Asia/Kolkata').startOf('day');

    if (!countingDate.isValid()) {
      throw new Error('Invalid counting date format. Use DD/MM/YYYY');
    }

    // Calculate anniversaries in IST
    const fourthAnniversary = moment(hireDate).add(4, 'years');
    const tenthAnniversary = moment(hireDate).add(10, 'years');

    // Check if anniversaries are on or before the counting date
    const completes4Years = fourthAnniversary.isSameOrBefore(countingDate);
    const completes10Years = tenthAnniversary.isSameOrBefore(countingDate);

    return completes4Years || completes10Years;
  } catch (error) {
    return error.message;
  }
};

  

const getIncrement = async (normalizedRating,employeeId,reviewCycle)=> {
    try {
      let increment={};
      if(normalizedRating>2){
        increment.increment_percentage = 12.00
      }
      else {
        
      increment = await db('new_increment_measurements')
        .select('increment_range', 'increment_percentage')
        .where('increment_range', '>=', normalizedRating)
        .orderBy('increment_range', 'asc')
        .first(); 
      }
      if (increment) {
        const isOlder = await isOlderEmployee(employeeId,`30/04/${reviewCycle.split('-')[1].split(' ')[1]}`); // Assuming reviewCycle is in format 'Apr-2024'
        if (isOlder) {  
            const percentage = parseFloat(increment.increment_percentage);
            const updatedPercentage = percentage + 10;
            await db('increment_details')
            .where('employee_id', employeeId)
            .andWhere('appraisal_cycle', reviewCycle)
            .update('inc_adjustments', updatedPercentage);
        }
        await db('increment_details')
        .where('employee_id', employeeId)
        .andWhere('appraisal_cycle', reviewCycle)
        .update('increment', increment.increment_percentage);
        return increment.increment_percentage;
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

const getHistoricalData = async (emplyeeName,sortBy,sortOrder)=>{
    try{
        const historicalData = await db('historical_data').select("*").where('employee', emplyeeName).orderBy(sortBy,sortOrder)
        return historicalData;
    }catch(err){
        console.log(err)
        throw new Error('Error fetching historical data');
    }
}

const getAllInrementData = async (reviewCycle)=>{
    try{
        console.log("reviewCycle",reviewCycle)
        const allIncrementData = await db('increment_details').select("*").where('appraisal_cycle', reviewCycle);
        return allIncrementData;
    }catch(err){
        console.log(err)
        throw new Error('Error fetching all increment data');
    }
}


const createHistoricalRecord = async (data) => {
  try {
    return await db('historical_data').insert(data).returning('*');
  } catch (err) {
    console.error(err);
    throw new Error('Error creating historical record');
  }
};
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
    getWeightedIncrement,
    createHistoricalRecord
}