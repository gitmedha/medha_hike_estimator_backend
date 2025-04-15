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
            .orderByRaw("CAST(RIGHT(appraisal_cycle, 4) AS INTEGER) DESC")
            .modify((queryBuilder) => {
                if (sortBy && sortOrder) {
                    queryBuilder.orderBy(sortBy, sortOrder);
                }
            });

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

const isOlderEmployee = async (id) => {
    try {
        const employee = await db('employee_details').where('employee_id', id).first();
        if (!employee) {
            throw new Error('Employee not found');
        }

        const currentDate = new Date();
        const hireDate = new Date(employee.date_of_joining);
        console.log("employee.date_of_joining",employee.date_of_joining)
    

        // Calculate the difference in years
        let diffYears = currentDate.getFullYear() - hireDate.getFullYear();

        // Adjust if the employee hasn't reached the anniversary yet this year
        const hasAnniversaryPassed =
            currentDate.getMonth() > hireDate.getMonth() ||
            (currentDate.getMonth() === hireDate.getMonth() && currentDate.getDate() >= hireDate.getDate());

        if (!hasAnniversaryPassed) {
            diffYears--;
        }

        return diffYears == 4;
    } catch (error) {
        return error.message;
    }
};

const getIncrement = async (normalizedRating,employeeId,reviewCycle)=> {
    try {
      const result = await db('increment_measurements')
        .select('increment_range', 'increment_percentage')
        .where('increment_range', '>=', normalizedRating)
        .orderBy('increment_range', 'asc')
        .first(); 

      if (result) {
        const isOlder = await isOlderEmployee(employeeId);
        if (isOlder) {  
            const percentage = parseFloat(result.increment_percentage);
            const updatedPercentage = percentage + 10;
            result.increment_percentage = updatedPercentage; // Add 10% for employees with more than 3 years of experience
        }
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
        const allIncrementData = await db('increment_details').select("*").where('appraisal_cycle', reviewCycle);
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