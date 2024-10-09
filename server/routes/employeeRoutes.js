const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

router.get('/get_employees', employeeController.getEmployees);
module.exports = router;
