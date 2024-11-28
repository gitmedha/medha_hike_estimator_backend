const incrementModel =  require('../models/increment.model');

const fetchIncrementData = async (offset, limit, sortBy, sortOrder) => {
    try {
        const result = await incrementModel.getIncrementData(offset, limit, sortBy, sortOrder);
        return result;
    } catch (err) {
        throw new Error(`Service Error: Unable to fetch increment data. ${err.message}`);
    }
};


const fetchIncrementDataById = async (id) => {
    try {
      const result = await incrementModel.getIncrementDataById(id);
      if (!result || result.length === 0) {
        throw new Error(`No increment data found for ID: ${id}`);
      }
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to fetch increment data by ID. ${err.message}`);
    }
  };

  const createNewIncrementData = async (data) => {
    try {
      const newIncrementId = await incrementModel.createIncrementData(data);
      return { id: newIncrementId, message: 'Increment data created successfully' };
    } catch (err) {
      throw new Error(`Service Error: Unable to create increment data. ${err.message}`);
    }
  };

  const updateExistingIncrementData = async (id, data) => {
    try {
      const updatedRowCount = await incrementModel.updateIncrementData(data, id);
      if (updatedRowCount === 0) {
        throw new Error(`No increment data found to update for ID: ${id}`);
      }
      return { id, message: 'Increment data updated successfully' };
    } catch (err) {
      console.log(err)
      throw new Error(`Service Error: Unable to update increment data. ${err.message}`);
    }
  };


  const deleteIncrementDataById = async (id) => {
    try {
      const deletedRowCount = await incrementModel.deleteIncrementData(id);
      if (deletedRowCount === 0) {
        throw new Error(`No increment data found to delete for ID: ${id}`);
      }
      return { id, message: 'Increment data deleted successfully' };
    } catch (err) {
      throw new Error(`Service Error: Unable to delete increment data. ${err.message}`);
    }
  };

  const filterIncrementData = async (fields, values, limit, offset) => {
    try {
      const result = await incrementModel.filterIncrementData(fields, values, limit, offset);
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to filter increment data. ${err.message}`);
    }
  };

  const searchIncrementData = async (field, value, offset, limit) => {
    try {
      const result = await incrementModel.searchIncrementData(field, value, offset, limit);
      return result;
    } catch (err) {
      throw new Error(`Service Error: Unable to search increment data. ${err.message}`);
    }
  };

  const getDropdownOptions = async (field) => {
    try {
      const options = await incrementModel.getSearchDropdowns(field);
      return options.map((option) => ({
        label: option[field],
        value: option[field],
      }));
    } catch (err) {
      throw new Error(`Service Error: Unable to fetch dropdown options. ${err.message}`);
    }
  };

  const getPickList = async ()=>{
    try {
      const result = await incrementModel.getPickList();
      const pickList = {
        managers: [],
        IDs: [],
        names: [],
      };
      
      pickList.managers = result.managers.map((item) => ({
        label: item.reviewer,
        value: item.reviewer,
      }));
      
      pickList.IDs = result.employees.map((item) => ({
        label: item.employee_id,
        value: item.employee_id,
      }));
      
      pickList.names = result.employees.map((item) => ({
        label: item.first_name+ " "+ item.last_name,
        value: item.first_name+ " "+ item.last_name,
      }));
      
      return pickList;
      
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }

  module.exports = {
    fetchIncrementData,
    fetchIncrementDataById,
    createNewIncrementData,
    updateExistingIncrementData,
    deleteIncrementDataById,
    filterIncrementData,
    searchIncrementData,
    getDropdownOptions,
    getPickList
  };