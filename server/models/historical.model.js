const db = require('../config/db');

/**
 * Fetch employees
 * @param {number} limit - The number of records to fetch
 * @param {number} offset - The number of records to skip
 * @returns {object} - The historical data and total count
 */
const getHistoricalQuery = async (limit, offset,sortBy,sortOrder) => {
 
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
    .orderBy(sortBy,sortOrder)
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

const searchHistoric = async(searchValue,from,to,limit,size)=>{
  try {
    const sortColumn = ['employee', 'reviewer', 'kra_vs_goals', 'competency', 'final_score', 'start_month', 'ending_month','id'].includes(searchValue)
    ? searchValue
    : 'employee';
  
    if( from & to){
  
    }
    else {
      console.log(await db('historical_data').select("*").where('employee', searchValue))
      const historics = await db('historical_data')
                              .select("*")
                              .where('employee', 'like', `%${searchValue}%`)
                              .orWhere('reviewer', 'like', `%${searchValue}%`)
                              .orWhere('kra_vs_goals', 'like', `%${searchValue}%`)
                              // .orWhere('competency',`%${searchValue}%`)
                              // .orWhere('final_score',`%${searchValue}%`)
                              .orWhere('start_month', 'like', `%${searchValue}%`)
                              .orWhere('ending_month', 'like', `%${searchValue}%`)
                              .orderBy(sortColumn,'asc')
                              .limit(limit)
                              .offset(size*limit);
  
      const totalCount = await db('historical_data')
                              .count('* as count')
                              .where('employee', 'like', `%${searchValue}%`)
                              .orWhere('reviewer', 'like', `%${searchValue}%`)
                              .orWhere('kra_vs_goals', 'like', `%${searchValue}%`)
                              // .orWhere('competency', `%${searchValue}%`)
                              // .orWhere('final_score',`%${searchValue}%`)
                              .orWhere('start_month', 'like', `%${searchValue}%`)
                              .orWhere('ending_month', 'like', `%${searchValue}%`)
                              .first();
                          
      return {
        data:historics,
        totalCount: totalCount.count
      };
    }
  
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
  }
  
  const searchPickList = async (dropField)=>{
  
      try {
          const dropDown = await db('historical_data')
          .select(dropField)
          .orderBy(dropField, 'asc')
          .distinct()
          .offset(0)
          .limit(100);
          return dropDown;
      }
     
      catch(error) {
        throw new Error(error.message);
      }
  }


module.exports = {
    getHistoricalQuery,
    getHistoricDatabyID,
    searchHistoric,
    searchPickList
};