const express = require('express');
const router = express.Router();


const {sendAuthUrl,zohoAuthToken,getEmployeeDetailsFromZoho} = require('../controllers/zoho.controller');

router.get('/', sendAuthUrl);

router.get('/callback',zohoAuthToken);

router.get('/employees',getEmployeeDetailsFromZoho)


module.exports = router;