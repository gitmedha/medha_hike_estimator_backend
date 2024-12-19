const express = require('express');
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
    calculateBonus
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


module.exports = router;