const incrementService = require('../services/increment.service');


const getIncrementData = async (req, res) => {
    const { offset, limit, sortBy, sortOrder } = req.params;
    try {
      const result = await incrementService.fetchIncrementData(Number(offset), Number(limit), sortBy, sortOrder);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const getIncrementDataById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await incrementService.fetchIncrementDataById(id);
      if (result.length === 0) {
        return res.status(404).json({ message: 'Increment data not found' });
      }
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching increment data by ID:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const createIncrementData = async (req, res) => {
    const incrementData = req.body;
    try {
      const result = await incrementService.createNewIncrementData(incrementData);
      return res.status(201).json(result);
    } catch (err) {
      console.error('Error creating increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const updateIncrementData = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const result = await incrementService.updateExistingIncrementData(id, updatedData);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error updating increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const deleteIncrementData = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await incrementService.deleteIncrementDataById(id);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error deleting increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };
  const filterIncrementData = async (req, res) => {
    const { fields, values, limit, offset } = req.body;
    try {
      const result = await incrementService.filterIncrementData(fields, values, limit, offset);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error filtering increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const searchIncrementData = async (req, res) => {
    const { field, value, offset, limit } = req.query;
    try {
      const result = await incrementService.searchIncrementData(field, value, Number(offset), Number(limit));
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error searching increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const getSearchDropdowns = async (req, res) => {
    const { field } = req.params;
    try {
      const result = await incrementService.getDropdownOptions(field);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching dropdown options:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const getPickList = async(req, res)=>{
    try {
      const result = await incrementService.getPickList();
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching pick list', details: error.message });
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
    getPickList
}