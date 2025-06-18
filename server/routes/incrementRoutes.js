const express = require('express');
const router = express.Router();
const incrementController = require('../controllers/increment.controller');
const upload = require('../middlewares/multer');


// Route to fetch paginated and sorted increment data
router.get('/get-increment-data/:limit/:offset/:sortBy/:sortOrder', incrementController.getIncrementData);

// Route to fetch increment data by ID
router.get('/get-increment-data/:id/:review_cycle', incrementController.getIncrementDataById);

// Route to create new increment data
router.post('/create-increment-data', incrementController.createIncrementData);

// Route to update existing increment data by ID
router.put('/edit-increment-data/:id', incrementController.updateIncrementData);

// Route to delete increment data by ID
router.delete('/delete-increment-data/:id', incrementController.deleteIncrementData);

// Route to filter increment data dynamically
router.post('/add-filter-increment-data/:offset/:limit', incrementController.filterIncrementData);

// Route to search increment data by field and value
router.post('/search-increment-data', incrementController.searchIncrementData);

// Route to get dropdown options for a specific field
router.get('/search-dropdowns/:field/:reviewCycle', incrementController.getSearchDropdowns);

router.get('/get_increments_picklist', incrementController.getPickList);

router.get('/get_filter_picklist', incrementController.fetchFilterDropdown);

router.post('/calculate_normalized_rating', incrementController.getNormalizedRating);

router.post('/get_increment', incrementController.getIncrement);

router.post('/get_weighted_increment', incrementController.getWeightedIncrement);

router.get('/get_increment_by_review_cycle/:id/:review_cycle', incrementController.getIncrementDataById);

router.post('/get_historical_data_increment', incrementController.getHistoricalData);

router.get('/calculate_bulk_normalized_rating',incrementController.getBulkNormalizedRatings);

router.get('/calculate_bulk_increment',incrementController.getBulkIncrement);

router.get('/download_excel', incrementController.downloadExcelFile);

router.post('/upload_excel', upload.single('file'), incrementController.uploadExcelFile);

router.get('/calculate_bulk_weighted_increment', incrementController.getBulkWeightedIncrement);

router.post('/get_weighted_increment', incrementController.getWeightedIncrement);

router.get('/review-cycle-dropdowns/:id', incrementController.getAllReviewCycles)

router.get('/get_data_by_review_cycle/:id/:review_cycle',incrementController.getIncrementDataById);

router.get('/get_all_review_cycles',incrementController.getAllCycles);

router.get('/get_increment_by_appraisal_cycle',incrementController.getIncrementDataByReviewCycle);

router.get('/transfer_increment_to_historical/:review_cycle', incrementController.transferIncrementToHistorical);




module.exports = router;
