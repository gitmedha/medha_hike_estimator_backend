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

const searchHistorics = async(req, res) => {
  try {
  let searchValue = from = to = null;
  const { limit, page } = req.body;
  if(req.body.searchValue){
    searchValue = req.body.searchValue;
  }
  if(req.body.from){
    from = req.body.from;
  }
  if(req.body.to){
    to = req.body.to;
  }

    const result = await HistoricalService.searchHistoric(searchValue,from,to,limit,page);
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

module.exports = {
    getHistoricalData,
    getHistoric,
    searchHistorics,
    searchPickList
};
