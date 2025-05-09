const db = require('../config/db');

const getBonus = async (offset, limit, sortBy = 'employee_id', sortByOrder = 'asc') => {
    const rowOffset = offset * limit; // offset is page index (0-based)
    console.log("page offset (pageIndex):", offset);
    console.log("limit:", limit);
    console.log("rowOffset (for DB):", rowOffset);
    try {
        const bonusData = await db
            .select("*")
            .from(function () {
                this.select("bd.*")
                    .from("bonus_details as bd")
                    .modify((queryBuilder) => {
                        queryBuilder.whereRaw(`
                            RIGHT(review_cycle, 4) = (
                                SELECT MAX(RIGHT(review_cycle, 4)) 
                                FROM bonus_details 
                                WHERE employee_id = bd.employee_id
                            )
                        `);
                    })
                    .as("filtered_bonus"); // Alias for filtered dataset
            })
            .offset(rowOffset)
            .limit(limit)
            .orderByRaw("CAST(RIGHT(review_cycle, 4) AS INTEGER) DESC")
            .modify((queryBuilder) => {
                if (sortBy && sortByOrder) {
                    queryBuilder.orderBy(sortBy, sortByOrder);
                }
            });

        // Get total count for pagination
        const totalCountQuery = db("bonus_details").countDistinct("employee_id as total");

        const totalCount = await totalCountQuery;

        return {
            totalCount: totalCount[0].total,
            data: bonusData,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching bonuses", error.message)
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


const getBonusPickLists = async()=>{
    try {
        const IDS = await getBonusDropdown('employee_id');
        const Names = await getBonusDropdown('full_name');
        const Managers = await getBonusDropdown('manager');

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

    const date = new Date('01 ' + newDate);
    const formatted = date.toISOString().split('T')[0]; 

    try{
        console.log("formatted date",formatted);
        const historicalRatings = await db('historical_data')
        .select('*')
        .where('reviewer', managerName)
        .andWhereRaw(
          "TO_DATE('01 ' || ending_month, 'DD Mon YYYY') <= ?",
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
    getAllData
}