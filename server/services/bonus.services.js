const xlsx = require('xlsx');

const {
    getBonus,
    getBonusDropdown,
    searchBonus,
    createBonus,
    getBonusById,
    getBonusPickLists,
    updateBonus,
    insertBulkData
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


 const uploadBonusData = async (req) => {
    try {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
  
      const requiredFields = {
        id: '__EMPTY',
        name: '__EMPTY_1',
        kra: 'Apr - Mar 2023',
        competency: '__EMPTY_2',
        average: '__EMPTY_3',
        manager: '__EMPTY_4',
      };
  
      const filteredDataDynamic = [];
      for (const row of data.slice(1)) {
        const result = {};
        let isValid = true;
  
        for (const [key, value] of Object.entries(requiredFields)) {
          result[key] = row[value];
  
          if (!result[key]) {
            isValid = false;
          }
        }
  
        if (isValid) {
          filteredDataDynamic.push(result);
        }
  
        if (result.id === "M0135") {
          break;
        }
      }
  
      // Insert filtered data in bulk
      for (const row of filteredDataDynamic) {
        await insertBulkData(row);
      }
  
    } catch (error) {
      console.error('Error in uploadBonusData:', error.message);
      throw error;
    }
  };
  

module.exports = {
    fetchAllBonusService,
    searchDropDownService,
    searchBonusService,
    createBonusService,
    getBonusByIdService,
    getPickLists,
    updateBonusService,
    uploadBonusData
}