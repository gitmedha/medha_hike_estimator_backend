const HistoricalService = require('../services/historical.services');

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

    const result = await HistoricalService.getHistoricalDataService(offset,limit,sortBy,sortOrder);

    res.status(200).json(result);
  } catch (error) {

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
module.exports = {
    getHistoricalData,
    getHistoric
};
