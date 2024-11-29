const db = require('../config/db');

const getIncrementData = async(offset,limit,sortBy,sortOrder)=>{
    try{
        const incrementData = await db('increment_details')
       .select("*")
       .offset(offset)
       .limit(limit)
       .orderBy(sortBy,sortOrder);

       const totalCount = await db('increment_details').count("* as total");
       return {
            totalCount: totalCount[0].total,
            data: incrementData
       };
    }catch(err){
        throw new Error('Error fetching increment data');
    }
}

const getIncrementDataById = async(id)=>{
    try{
        const incrementData = await db('increment_details').select("*").where('id', id);
        return incrementData;
    }catch(err){
        throw new Error('Error fetching increment data by ID');
    }
}

const createIncrementData = async(incrementData)=>{
    try{
        const newIncrement = await db('increment_details').insert(incrementData).returning('id');
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
        // const pickList = await db('increment_details').select("manager","employee_id", "full_name").distinct().offset(0).limit(100);
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
    fetchFilterDropdown
}