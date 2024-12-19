const db = require('../config/db');

const getBonus = async(offset,limit,sortBy,sortByOrder)=>{
    try{
        const bonusData = await db('bonus_details')
       .select("*")
       .offset(offset)
       .limit(limit)
       .orderBy(sortBy,sortByOrder);

       const totalCount = await db('bonus_details').count("* as total");
       return {
            totalCount: totalCount[0].total,
            data: bonusData
       };

    }
    catch(error){
        throw new Error(error.message);
    }
}

const getBonusDropdown = async (field)=>{
    try{
        const dropDown = await db('bonus_details')
       .select(field)
       .distinct()
       .orderBy(field, 'asc');

        return dropDown;
    }
    catch(error){
        throw new Error(error.message);
    }
}

const searchBonus = async (searchField, value, offset = 0, limit = 10) => {
    try {
        const bonusData =  await db('bonus_details').select("*").where(`${searchField}`, `${value}`)
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
        const result = (await db('bonus_details').insert(bonusData)).returning('employee_id')
        return {
            data: result
        }
    } catch (error) {
        throw new Error(`Error creating bonus data: ${error.message}`);
    }
}

const getBonusById =async (id)=>{
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
        .where('bonus_details.employee_id', id);
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
module.exports = {
    getBonus,
    getBonusDropdown,
    searchBonus,
    createBonus,
    getBonusById,
    getBonusPickLists,
    updateBonus
}