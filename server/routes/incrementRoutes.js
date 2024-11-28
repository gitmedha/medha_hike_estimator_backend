const express = require('express');
const router = express.Router();
const incrementController = require('../controllers/increment.controller');

// Route to fetch paginated and sorted increment data
router.get('/get-increment-data/:limit/:offset/:sortBy/:sortOrder', incrementController.getIncrementData);

// Route to fetch increment data by ID
router.get('/get-increment-data/:id', incrementController.getIncrementDataById);

// Route to create new increment data
router.post('/create-increment-data', incrementController.createIncrementData);

// Route to update existing increment data by ID
router.put('/edit-increment-data/:id', incrementController.updateIncrementData);

// Route to delete increment data by ID
router.delete('/delete-increment-data/:id', incrementController.deleteIncrementData);

// Route to filter increment data dynamically
router.post('/add-filter-increment-data', incrementController.filterIncrementData);

// Route to search increment data by field and value
router.get('/search-increment-data', incrementController.searchIncrementData);

// Route to get dropdown options for a specific field
router.get('/search-dropdowns/:field', incrementController.getSearchDropdowns);

router.get('/get_increments_picklist', incrementController.getPickList);

module.exports = router;
