const express = require('express');
const router = express.Router();
const { getAllBookings } = require('../controllers/bookingController'); // Adjust the path as necessary

// Route to get all bookings
router.get('/', getAllBookings);

module.exports = router;
