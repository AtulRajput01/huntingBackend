// routes/slotRoutes.js
const express = require('express');
const router = express.Router();
const { createSlot, getSlotsByOutfitterAndDate, updateSlot, deleteSlot, getSlotsByOutfitter, bookSlotByDate, getBookingHistory, refillSlotQuantity } = require('../controllers/slotController');

const { verifyToken } = require('../middleware/verifyToken');

// Route to create slots
router.post('/createSlot', createSlot);

// Route to fetch slots
router.get('/fetch', getSlotsByOutfitterAndDate);

// Route to update slots
router.put('/update', updateSlot);

// Route to delete slots
router.delete('/delete/:outfitter/:date', deleteSlot);


// Route to get slot dates by outfitterId
router.get('/slot-Avail', getSlotsByOutfitter);

// POST route to book a slot by date
router.post('/slots/book',verifyToken, bookSlotByDate);

router.get('/bookingHistory', verifyToken, getBookingHistory);

router.post('/refill-slot-quantity', refillSlotQuantity);


module.exports = router;
