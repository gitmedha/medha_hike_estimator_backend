const {
    getBonus,
    getBonusDropdown,
    searchBonus,
    createBonus,
    getBonusById,
    getBonusPickLists,
    updateBonus
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
        console.log("service: " + bonusData)
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
        console.log(IDS,Names,Managers);

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

module.exports = {
    fetchAllBonusService,
    searchDropDownService,
    searchBonusService,
    createBonusService,
    getBonusByIdService,
    getPickLists,
    updateBonusService
}