const HistoricalService = require('../services/historical.services');

/**
 * @param {object} req
 * @param {object} res
 */
const getHistoricalData = async (req, res) => {
  try {

    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await HistoricalService.getHistoricalDataService(offset,limit);

    res.status(200).json(result);
  } catch (error) {

    res.status(500).json({ error: 'Error fetching Historical data', details: error.message });
  }
};

module.exports = {
    getHistoricalData,
};
