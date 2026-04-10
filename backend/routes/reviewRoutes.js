'use strict';
const express = require('express');
const router  = express.Router({ mergeParams: true }); // inherit :id from parent
const ctrl    = require('../controllers/reviewController');

router.get( '/:id/reviews', ctrl.getReviews);
router.post('/:id/reviews', ctrl.createReview);

module.exports = router;
