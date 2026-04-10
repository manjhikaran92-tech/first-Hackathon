'use strict';
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/businessController');

// Order matters: /featured must be before /:id
router.get('/',          ctrl.getBusinesses);
router.get('/featured',  ctrl.getFeatured);
router.get('/:id',       ctrl.getBusinessById);
router.get('/:id/nearby', ctrl.getNearby);
router.post('/',         ctrl.createBusiness);

module.exports = router;
