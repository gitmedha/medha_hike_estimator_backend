const db = require('../config/db');
const moment  = require('moment');

const getBonus = async (offset, limit, sortBy = 'employee_id', sortByOrder = 'asc') => {
    const rowOffset = offset * limit;
    
    try {
        // Get all distinct review cycles
        const allCycles = db('bonus_details')
            .distinct('review_cycle')
            .where('review_cycle', 'like', 'April%-Sep%');

        // Find the maximum (latest) review cycle
        const maxCycle = db.select(db.raw('MAX(review_cycle) as latest_cycle'))
            .from(allCycles.as('all_cycles'));

        // Get all records matching this maximum cycle with pagination
        const bonusData = await db('bonus_details')
            .select('*')
            .where('review_cycle', db.raw('(?)', [maxCycle]))
            .offset(rowOffset)
            .limit(limit)
            .orderBy('employee_id', sortByOrder) // Default sort
            .modify((queryBuilder) => {
                if (sortBy !== 'employee_id') { // Only modify if sorting by other field
                    queryBuilder.orderBy(sortBy, sortByOrder);
                }
            });

        // Count total records in the latest cycle
        const totalCount = await db('bonus_details')
            .count('* as total')
            .where('review_cycle', db.raw('(?)', [maxCycle]));

        return {
            totalCount: totalCount[0].total,
            data: bonusData,
        };
    } catch (error) {
        console.error("Error fetching bonuses:", error);
        throw new Error("Error fetching bonuses: " + error.message);
    }
};



const getBonusDropdown = async (field,reviewCycle)=>{
    try{
        const dropDown = await db('bonus_details')
       .select(field)
       .distinct()
         .where('review_cycle',reviewCycle)
    .orderBy(field, 'asc');

        return dropDown;
    }
    catch(error){
        throw new Error(error.message);
    }
}

const searchBonus = async (searchField, value, reviewCycle,offset = 0, limit = 10) => {
    console.log('searchField:', searchField, 'value:', value, 'reviewCycle:', reviewCycle, 'offset:', offset, 'limit:', limit);
    try {
        const bonusData =  await db('bonus_details').select("*").where(`${searchField}`, `${value}`)
        .andWhere('review_cycle',reviewCycle)
        .offset(offset)
        .limit(limit);
        return {
            data: bonusData,
            totalCount: bonusData.length
        }

    } catch (err) {
        console.error('Error searching increment data:', err.message);
        throw new Error(`Error searching increment data: ${err.message}`);
    }
};

const createBonus = async (bonusData) => {
    try {
        const result = await db('bonus_details').insert(bonusData).returning('employee_id');
        return {
            data: result
        }
    } catch (error) {
        console.log(error)
        throw new Error(`Error creating bonus data: ${error.message}`);
    }
}

const getBonusById =async (id,reviewCycle)=>{
    try {
        
      const bonusData = await db('bonus_details')
        .select(
          'bonus_details.*',
          'employee_details.department',
          'employee_details.title',
          'employee_details.employee_status'
        )
        .innerJoin(
          'employee_details',
          'bonus_details.employee_id',
          'employee_details.employee_id'
        )
        .where('bonus_details.employee_id', id)
        .andWhere('bonus_details.review_cycle',reviewCycle)
      return bonusData;
    } catch (err) {
      console.error(err);
      throw new Error('Error fetching increment data by ID');
    }
}


const getBonusPickLists = async(reviewCycle)=>{
    try {
        const IDS = await getBonusDropdown('employee_id',reviewCycle);
        const Names = await getBonusDropdown('full_name',reviewCycle);
        const Managers = await getBonusDropdown('manager',reviewCycle);

        return {
            IDS,
            Names,
            Managers
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching bonus picklists');
    }
}

const updateBonus = async (id,updateData)=>{
    try{
        const updatedBonus = await db('bonus_details').where('id', id).update(updateData);
        return updatedBonus;
    } catch(error){
        throw new Error(error.message);
    }
}

const insertBulkData = async(data)=>{
    try{

        await db('bonus_details').insert({
            employee_id: data.id,
            full_name: data.name,
            kra: parseFloat(parseFloat(data.kra).toFixed(1)),
            compentency: parseFloat(parseFloat(data.competency).toFixed(1)),
            average: parseFloat(parseFloat(data.average).toFixed(1)),
            review_cycle: data.review_cycle,
            manager: data.manager,
        });
        return;
    
    } catch(error){
        console.log("this", error)
        throw new Error(error.message);
    }

}

const getPeerRatings = async (managerName,employeeID,reviewCycle)=>{
    try{
        if (!managerName) {
            throw new Error('Manager name is required');
        }
        const peerRatings = await db('bonus_details')
        .select('average').where('manager', managerName)
        .andWhere('review_cycle',reviewCycle)
        .andWhereNot('employee_id',employeeID);
        const peerRatingsList = peerRatings.map(rating => parseFloat(rating.average));
        return peerRatingsList;

    }catch(err){
        console.log(err);
        throw new Error('Error fetching peer ratings');
    }
}

const getAllRatings = async (reviewCycle)=>{
    try{
        const allRatings = await db('bonus_details')
        .select('average')
        .where('review_cycle',reviewCycle);
        const allRatingsList = allRatings.map(rating => parseFloat(rating.average));
        return allRatingsList;
    }catch(err){
        throw new Error('Error fetching all ratings',err);
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

    const formatted = moment(`01 ${newDate}`, 'DD MMM YYYY').format('YYYY-MM-DD');

    try{
        const historicalRatings = await db('historical_data')
        .select('*')
        .where('reviewer', managerName)
        .andWhereRaw(
          "TO_DATE('01 ' || ending_month, 'DD Mon YYYY') < ?",
          [formatted]
        );
        
        const historicalRatingList = historicalRatings.map(historicalRating=>parseFloat(historicalRating.final_score));
        return historicalRatingList;
    }catch(err){
        console.log(err);
        throw new Error('Error fetching historical ratings');
    }
}

const deleteBonus = async (id)=>{
    try{
        const deletedBonus = await db('bonus_details').where('id', id).del();
        return deletedBonus;
    } catch(error){
        throw new Error(error.message);
    }
 
}

const updateNormalizedRating = async(id,reviewCycle,ratings) => {
    try {
        const updatedRatings = await db('bonus_details').update({ normalized_ratings: ratings})
        .where('employee_id',id)
        .andWhere('review_cycle', reviewCycle)
        .returning('employee_id');
        return updatedRatings;
    } catch (error) {
        throw new Error(`Error updating normalized ratings: ${error.message}`);
    }
}

const calculateBonus = async (normalizedRating, id, reviewCycle) => {
    try {
        const result = await db('bonus_measurements')
            .select('ratings', 'bonus')
            .where('ratings', '>=', normalizedRating)
            .first();

        if (result) {
            await db('bonus_details')
                .where('employee_id', id)
                .andWhere('review_cycle', reviewCycle)
                .update('bonus', result.bonus);

            return result.bonus;
        }

        return null;

    } catch (error) {
        throw new Error("Error Fetching bonus: " + error.message);
    }
};




const getAllData = async (reviewCycle)=>{
    try{
        const allData = await db('bonus_details').select("*").where('review_cycle',reviewCycle);
        return allData;
    }catch(err){
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
    updateNormalizedRating,
    calculateBonus,
    getAllData,
    createHistoricalRecord
}