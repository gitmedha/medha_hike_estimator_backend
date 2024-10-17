const db = require('../config/db');

/**
 * Fetch employees
 * @param {number} limit - The number of records to fetch
 * @param {number} offset - The number of records to skip
 * @returns {object} - The historical data and total count
 */
const getHistoricalQuery = async (limit, offset) => {
 
  const historicalData = await db('historical_data')
    .select(
      'employee',
      'reviewer',
      'kra_vs_goals',
      'competency',
      'final_score',
      'start_month',
      'ending_month',
      'id'
    )
    .limit(limit)
    .offset(offset);

  const totalCount = await db('historical_data').count('id as total').first();

  return {
    totalCount: totalCount.total,
    data: historicalData,
  };
};

const getHistoricDatabyID = async(id) => {
  const historicData = await db('historical_data').select("*").where('id', id);
  return historicData;
}

module.exports = {
    getHistoricalQuery,
    getHistoricDatabyID
};