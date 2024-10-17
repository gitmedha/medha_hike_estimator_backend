const employeeService = require('../services/employee.services');

/**
 * @param {object} req
 * @param {object} res
 */
const getEmployees = async (req, res) => {
  try {

    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const result = await employeeService.getEmployeesService(offset,limit);

    res.status(200).json(result);
  } catch (error) {

    res.status(500).json({ error: 'Error fetching employees', details: error.message });
  }
};

const getEmployee = async (req,res)=>{
  try {
    const { id } = req.params;
    const result = await employeeService.getEmployeeByID(id);
    res.status(200).json(result);
    
  } catch (error) {
    res.status(500).json({error: 'Error fetching employee', details: error.message})
  }
}

module.exports = {
  getEmployees,
  getEmployee
};
