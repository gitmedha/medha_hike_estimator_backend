const express = require('express');
const upload = require('../middlewares/multer');

const router = express.Router();

const {
    fetchAllBonus,
    fetchBonusById,
    createBonus,
    updateBonus,
    deleteBonus,
    searchDropDown,
    searchBonus,
    loadDropDown,
    normalizedRating,
    calculateBonus,
    uploadBonusFile,
    bulkRating,
    calculateBulkBonus,
    downloadPgToXl
} = require('../controllers/bonus.controller');

// Fetch all bonus data
router.get('/get_bonuses/:limit/:offset/:sortBy/:sortOrder', fetchAllBonus);

// Fetch bonus data by ID

router.get('/fetch-bonus/:id', fetchBonusById);

// Create new bonus data
router.post('/create-bonus', createBonus);

//Update bonus data

router.put('/update-bonus/:id', updateBonus);

// Delete bonus data

router.delete('/delete-bonus/:id', deleteBonus);

// Search Dropdown 

router.get('/search-dropdown/:field',searchDropDown);

//search bonus

router.post('/search',searchBonus);

//bonus dropdowns 

router.get('/bonus-dropdowns', loadDropDown);

//calculate normalized rating

router.post('/get_normalized_rating',normalizedRating);

//calculate bonus

router.post('/calculate_bonus',calculateBonus);

// Upload bonus excel data

router.post('/upload_bonus_data', upload.single('file'),uploadBonusFile);

// Bulk Rating

router.get('/calculate_bulk_normalized_rating',bulkRating);

router.get('/calculate_bulk_bonus',calculateBulkBonus);

router.get('/download_excel', downloadPgToXl);

module.exports = router;