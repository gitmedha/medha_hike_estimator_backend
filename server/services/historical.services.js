const historicalModel = require('../models/historical.model');

/**
 * Get Historical employee details
 * @param {number} page - The current page number
 * @param {number} limit - The number of historical data to fetch per page
 * @returns {object} - historical  data and total count
 */
const getHistoricalDataService = async (offset, limit) => {

  const result = await historicalModel.getHistoricalQuery(limit, offset);

  return {
    total: result.totalCount,
    limit,
    data: result.data
  };
};

module.exports = {
    getHistoricalDataService,
};
