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
        const [newIncrement] = await db('increment_details').insert(incrementData);
        return newIncrement;
    }catch(err){
        throw new Error('Error creating increment data');
    }
}
const updateIncrementData = async(updatedData,id)=>{
    try{
        const [updatedIncrement] = await db('increment_details').where('id', id).update(updatedData);
        return updatedIncrement;
    }catch(err){
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
            total: totalCount,
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

module.exports = {
    getIncrementData,
    getIncrementDataById,
    createIncrementData,
    updateIncrementData,
    deleteIncrementData,
    filterIncrementData,
    searchIncrementData,
    getSearchDropdowns,
}