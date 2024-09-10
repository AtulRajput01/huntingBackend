const mongoose = require('mongoose');
const Booking = require('../models/bookingModel'); // Adjust the path as necessary

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email') // Populate user data
      .populate('outfitterId', 'name description location') // Populate outfitter data
      .populate('slotId', 'date availableSlot'); // Populate slot data

    res.status(200).json({
      status: 200,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = { getAllBookings };
