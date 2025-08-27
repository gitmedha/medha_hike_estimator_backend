const HistoricalService = require('../services/historical.services');
const { downloadExcel} = require('../utils/downloadExcel');


/**
 * @param {object} req
 * @param {object} res
 */
const getHistoricalData = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'employee';
    const sortOrder = req.query.sortOrder || 'asc';
    const searchField = req.query.searchField || '';
    const searchValue = req.query.searchValue || '';
    const from = req.query.from;
    const to = req.query.to;

    const result = await HistoricalService.getHistoricalDataService(
      offset,
      limit,
      sortBy,
      sortOrder,
      searchField,
      searchValue,
      from,
      to
    );

    res.status(200).json(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: 'Error fetching Historical data', details: error.message });
  }
};

const getHistoric = async (req,res)=>{
  try {
    const { id } = req.params;
    const result = await HistoricalService.getHistoricDatabyID(id);
    res.status(200).json(result);
    
  } catch (error) {
    res.status(500).json({error: 'Error fetching historic data', details: error.message})
  }
}

const searchHistorics = async(req, res) => {
  try {
  const { searchField, searchValue,limit, page } = req.body;

    const result = await HistoricalService.searchHistoric(searchField,searchValue,limit,page);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: 'Error searching historics', details: error.message });
  }
}
const searchPickList = async(req,res) =>{
  try {
    const {dropDownField} = req.params;
    const result = await HistoricalService.searchPickList(dropDownField);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error searching pick list', details: error.message });
  }
}

const getHistoricDropDowns = async(req,res)=>{
  try {
    const result = await HistoricalService.getHistoricsDropDowns();
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({error: "Error while fetching values", details: error.message})
  }
}


const getReporteeDetails = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await HistoricalService.getReporteeDetails(name);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Error getting reportee details", error: error.message})
  }
}

const createHistoric = async(req, res) => {
  try {
    const historicData = req.body;
    const result = await HistoricalService.createHistoric(historicData);
    res.status(201).json(result);
    
  } catch (error) {
    return res.status(400).json({error: "Error creating employee", message: error.message});
  }
}

const updateHistoric = async (req, res) => {
  try {
      const { id } = req.params;
      const historicData = req.body;

      if (!id) {
          return res.status(400).json({ message: "Historic ID is required." });
      }

      const updatedHistoric = await HistoricalService.updateHistoricService(id, historicData);

      if (!updatedHistoric) {
          return res.status(404).json({ message: "Historic data not found." });
      }

      return res.status(200).json({
          message: "Historic data updated successfully.",
          data: updatedHistoric,
      });
  } catch (error) {
      console.error("Error updating historic data:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteHistoric = async (req, res) => {
  try {
      const { id } = req.params;

      if (!id) {
          return res.status(400).json({ message: "Historic ID is required." });
      }

      const deletedEmployee = await HistoricalService.deleteHistoricService(id);

      if (!deletedEmployee) {
          return res.status(404).json({ message: "Historic not found." });
      }

      return res.status(200).json({
          message: "Historic deleted successfully.",
          data: deletedEmployee,
      });
  } catch (error) {
      console.error("Error deleting historic:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const downloadExcelFile = async (req,res)=>{
  try {
    await downloadExcel(req,res,'historical_data');
  } catch (error) {
    res.status(500).json({error: 'Error downloading excel file', details: error.message});
  }
}

const uploadExcelFile = async(req,res)=>{
  try {
    await HistoricalService.uploadExcelFile(req);
    res.status(200).json({message: 'Excel file uploaded successfully'});
  } catch (error) {
    res.status(500).json({error: 'Error uploading excel file', details: error.message});
  }
}


module.exports = {
    getHistoricalData,
    getHistoric,
    searchHistorics,
    searchPickList,
    getHistoricDropDowns,
    getReporteeDetails,
    deleteHistoric,
    updateHistoric,
    createHistoric,
    downloadExcelFile,
    uploadExcelFile
};
