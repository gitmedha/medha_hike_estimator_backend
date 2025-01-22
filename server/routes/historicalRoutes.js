const express = require('express');
const router = express.Router();
const historicalController = require('../controllers/historical.controller');
const upload = require('../middlewares/multer');


router.get('/get_historical_data', historicalController.getHistoricalData);
router.get('/get_historic/:id', historicalController.getHistoric);
router.post('/search_historics', historicalController.searchHistorics);
router.get('/search_picklist/:dropDownField', historicalController.searchPickList);
router.get('/get_historic_picklist', historicalController.getHistoricDropDowns);
router.get('/get_reportee_details/:name', historicalController.getReporteeDetails);
router.post('/create_historical_data', historicalController.createHistoric);
router.put('/edit_historical_data/:id', historicalController.updateHistoric);
router.delete('/delete_historical_data/:id', historicalController.deleteHistoric);
router.get('/download_excel', historicalController.downloadExcelFile);
router.post('/upload_excel', upload.single('file'), historicalController.uploadExcelFile);

module.exports = router;
