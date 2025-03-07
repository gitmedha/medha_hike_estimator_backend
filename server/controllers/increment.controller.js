const incrementService = require('../services/increment.service');
const incrementModel = require('../models/increment.model');
const { downloadExcel} = require('../utils/downloadExcel');
const db = require('../config/db');



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
    const { id,review_cycle} = req.params;
    try {
      const result = await incrementService.fetchIncrementDataById(id,decodeURIComponent(review_cycle));
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
    const { fields, values } = req.body;
    const { limit, offset} = req.params;
    try {
      const result = await incrementService.filterIncrementData(fields, values, limit, offset);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error filtering increment data:', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  const searchIncrementData = async (req, res) => {
    const { field, value, offset, limit } = req.body;
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

  const fetchFilterDropdown = async(req, res) => {
    try {
      const result = await incrementService.fetchFilterDropdowns();
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching filter dropdown:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  const getNormalizedRating = async (req,res)=>{
    try {
      const result = await incrementService.getNormalizedRating(req.body);
      await incrementModel.updateNormalizedRatings(req.body.employeeId,result.toFixed(2),req.body.reviewCycle);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching normalized rating', details: error.message });
    }
  }

  const getIncrement = async (req, res) => {
    const { normalizedRating ,employeeId,reviewCycle} = req.body;
    try {
      const result = await incrementService.getIncrement(normalizedRating,employeeId,reviewCycle);
      if (result.length === 0) {
        return res.status(404).json({ message: 'Increment not found' });
      }
      return res.status(200).json({ message:"Inrement calculated successfully", data: `${result}%` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

const getWeightedIncrement = async(req, res) => {
  const {employee_id, reviewCycle} = req.body;
  try {
    const result = await incrementService.getWeightedIncrement(employee_id,reviewCycle);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Weighted Increment not found' });
    }
    if (isNaN(parseFloat(result))) {
      return res.status(404).json({ message: 'Weighted Increment not found' });
  }
  await db('increment_details').where({employee_id: employee_id, appraisal_cycle: reviewCycle}).update({weighted_increment: parseFloat(result)});
 
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching weighted increment:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

const getIncrementByReviewCycle = async(req,res)=>{
  const {employeeID, reviewCycle } = req.body;
  try {
    const result = await incrementService.getIncrementDataByReviewCycle(employeeID,reviewCycle);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Increment not found for the given review cycle' });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching increment by review cycle:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

const getHistoricalData = async(req,res)=>{
  const { employeeName } = req.body;
  try {
    const result = await incrementService.getHistoricalData(employeeName);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Historical data not found for the given employee and review cycle' });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching historical data:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

const getBulkNormalizedRatings = async(req, res) => {
  try {
    const result = await incrementService.getBulkNormalizedRatings();
    return res.status(200).json(result);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });    
  }
};

const getBulkIncrement = async (req,res)=>{
  try {
    const result = await incrementService.getBulkIncrement();
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching bulk increment:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

const downloadExcelFile = async (req,res)=>{
  try {
    await downloadExcel(req,res,'increment_details');
  } catch (error) {
    res.status(500).json({error: 'Error downloading excel file', details: error.message});
  }
}

const uploadExcelFile = async(req,res)=>{
  try {
    await incrementService.uploadExcelFile(req);
    res.status(200).json({message: 'Excel file uploaded successfully'});
  } catch (error) {
    res.status(500).json({error: 'Error uploading excel file', details: error.message});
  }
}
const getBulkWeightedIncrement = async(req,res)=>{
  try {
    const result = await incrementService.getBulkWeightedIncrement();
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching bulk weighted increment:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

const getAllReviewCycles = async(req,res)=>{
  const {id} = req.params;
  try {
  
      const result = await db('increment_details').select('appraisal_cycle').where('employee_id',id);
      const picklistArray = result.map(cycle=>({label:cycle.appraisal_cycle, value:cycle.appraisal_cycle}));
      return res.status(200).json(picklistArray);
  } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
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
    getNormalizedRating,
    getIncrement,
    getWeightedIncrement,
    getIncrementByReviewCycle,
    getHistoricalData,
    getBulkNormalizedRatings,
    getBulkIncrement,
    uploadExcelFile,
    downloadExcelFile,
    getBulkWeightedIncrement,
    getAllReviewCycles
}

