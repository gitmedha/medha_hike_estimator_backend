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

const searchHistoric = async(searchField,searchValue,limit,size)=>{
  try {
    const sortColumn = ['employee', 'reviewer', 'kra_vs_goals', 'competency', 'final_score', 'start_month', 'ending_month','id'].includes(searchValue)
    ? searchValue
    : 'employee';
    const historics = await db('historical_data')
    .select("*")
    .where(`${searchField}`,`${searchValue}`)
    .orderBy(sortColumn,'asc')
    .limit(limit)
    .offset(size*limit);

const totalCount = await db('historical_data')
    .count('* as count')
    .where(`${searchField}`,`${searchValue}`)
    .first();

return {
data:historics,
totalCount: totalCount.count
};
  
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
          return dropDown;
      }
     
      catch(error) {
        throw new Error(error.message);
      }
  }

const getHistoricalPickList = async()=>{
  try {
    const employee = await db('historical_data').select('employee').distinct().offset(0).limit(100);
    const reviewer = await db('historical_data').select('reviewer').distinct().offset(0).limit(100);
    return {
      employee,
      reviewer,
    }
    
  } catch (error) {
    throw new Error(error.message);
  }
}

const getReporteeDetails = async (name)=>{
  try {
    const manager = await db('historical_data').select('*').distinct().where('reviewer', name);
    const uniqueEmployees = manager.reduce((acc, item) => {
      if (!acc.some(existingItem => existingItem.employee === item.employee)) {
        acc.push(item);
      }
      return acc;
    }, []);
    
    const reporteeData = [];
    for(let i=0; i<uniqueEmployees.length; i++){
      const reportee = await db('employee_details').select('first_name', 'last_name', 'employee_id', 'email_id')
      .whereRaw("CONCAT(first_name, ' ', last_name) = ?", [uniqueEmployees[i].employee]);

      reporteeData.push(...reportee);
    }

    return reporteeData;
    
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching reportee details", error.message);
  }

}

const createHistoric = async (historicData) => {
  try {
    const [newHistoric] = await db('historical_data')
      .insert({
        employee: historicData.employee,
        reviewer: historicData.reviewer,
        kra_vs_goals: historicData.kra_vs_goals,
        competency: historicData.competency,
        final_score: historicData.final_score,
        start_month: historicData.start_month,
        ending_month: historicData.ending_month
      })
      .returning('*');  

    return newHistoric;
  } catch (e) {
    throw new Error(e.message);
  }
};

const updateHistoricQuery = async (id, historicData) => {
  try {
      const [updatedHistoricalData] = await db('historical_data')
          .where({ id })
          .update(historicData, ['*']);

      return updatedHistoricalData || null;
  } catch (error) {
      throw new Error(`Model Error: ${error.message}`);
  }
};

const deleteHistoricQuery = async (id) => {
  try {
      const [deletedHistoric] = await db('historical_data')
          .where({ id })
          .del(['*']);

      return deletedHistoric || null;
  } catch (error) {
      throw new Error(`Model Error: ${error.message}`);
  }
};

module.exports = {
    getHistoricalQuery,
    getHistoricDatabyID,
    searchHistoric,
    searchPickList,
    getHistoricalPickList,
    getReporteeDetails,
    createHistoric,
    updateHistoricQuery,
    deleteHistoricQuery
};