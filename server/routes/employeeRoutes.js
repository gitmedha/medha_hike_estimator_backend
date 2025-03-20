const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const upload = require('../middlewares/multer');

router.get('/get_employees', employeeController.getEmployees);
router.get('/get_employee/:id', employeeController.getEmployee)
router.post('/search_employees', employeeController.searchEmployees);
router.get('/search_picklist/:dropDownField', employeeController.searchPickList);
router.get('/get_employee_historical_data/:first_name/:last_name/:sortBy/:sortOrder', employeeController.getEmployeeHistoricDetails);
router.get('/get_employee_picklists', employeeController.getEmployeeDropDowns);
router.post('/create_employee', employeeController.createEmployee);
router.put('/edit_employee/:id', employeeController.updateEmployee);
router.delete('/delete_employee/:id', employeeController.deleteEmployee);
router.get('/download_excel', employeeController.downloadExcelFile);
router.post('/upload_excel', upload.single('file'), employeeController.uploadExcelFile);
module.exports = router;
