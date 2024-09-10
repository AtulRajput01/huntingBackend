const Slot = require('../models/slotModel');
const Outfitter = require("../models/outfitterModel");
const User = require("../models/userModel");
const Booking = require('../models/bookingModel'); // Adjust the path as necessary
const Book = require("../models/bookingModel")
const createError = require("../middleware/error");
const createSuccess = require("../middleware/success");


// Create a new slot for an outfitter
const createSlot = async (req, res) => {
  try {
    const { date, availableSlot, outfitterId } = req.body;

    // Parse and validate the slot creation date
    const slotDate = new Date(date);
    const currentDate = new Date();
    // Set current date to start of the day (00:00:00) for comparison
    currentDate.setHours(0, 0, 0, 0);

    if (slotDate < currentDate) {
      return res.status(400).json({ message: 'Slot date is in the past. Slot cannot be created.' });
    }

    // Create a new slot
    const slot = new Slot({
      date: slotDate, // Use parsed slotDate
      availableSlot,
      outfitter: outfitterId
    });

    const savedSlot = await slot.save();

    // Add slot details to the outfitter's slotData
    const slotDetails = {
      date: savedSlot.date.toISOString().split('T')[0], // Format to YYYY-MM-DD
      availableSlot: savedSlot.availableSlot
    };

    // Update the outfitter's slotData
    await Outfitter.findByIdAndUpdate(outfitterId, {
      $push: { slotData: slotDetails }
    });

    // Fetch outfitter details
    const outfitter = await Outfitter.findById(outfitterId);

    // Respond with success message and slot details
    res.status(201).json({
      message: 'Slot created successfully',
      status: 'success',
      outfitter: {
        name: outfitter.name,
        description: outfitter.description,
        area: outfitter.area,
        image: outfitter.image,
        category: outfitter.category
      },
      slot: {
        date: slotDetails.date,
        availableSlot: slotDetails.availableSlot
      }
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
};


// Get Number of Slots According to the outfitter
const getSlotsByOutfitter = async (req, res) => {
  try {
    const { outfitterId } = req.query;

    // Validate outfitterId
    if (!outfitterId) {
      return res.status(400).json({ message: 'Outfitter ID is required' });
    }

    const outfitter = await Outfitter.findById(outfitterId);
    if (!outfitter) {
      return res.status(404).json({ message: 'Outfitter not found' });
    }

    // Prepare response with outfitter details
    const outfitterDetails = {
      id: outfitter._id,
      name: outfitter.name,
      description: outfitter.description,
      area: outfitter.area,
      location: outfitter.location,
      image: outfitter.image,
      category: outfitter.category
    };

    // Prepare response with slot data
    const slots = outfitter.slotData.map(slot => ({
      date: slot.date.toISOString().split('T')[0], // Date in YYYY-MM-DD format
      availableSlot: slot.availableSlot
    }));

    // Combine outfitter details and slots in the response
    const response = {
      outfitter: outfitterDetails,
      slots: slots
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   fetch slots quantity only
const getSlotsByOutfitterAndDate = async (req, res) => {
  try {
    const { outfitterId, date } = req.query;

    // Validate date
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const outfitter = await Outfitter.findById(outfitterId);
    if (!outfitter) {
      console.log(outfitter)
      return res.status(404).json({ message: 'Outfitter not found' });
    }

    const slot = outfitter.slotData.find(slot => slot.date.toISOString() === new Date(date).toISOString());

    if (!slot) {
      return res.status(404).json({ message: 'No slots found for the specified date and outfitter' });
    }

    res.status(200).json({ availableSlot: slot.availableSlot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   update slots
const updateSlot = async (req, res) => {
  const { outfitter, date, availableSlots } = req.body;

  try {
    let existingSlot = await Slot.findOne({ outfitter, date });

    if (existingSlot) {
      existingSlot.availableSlots = availableSlots;
      await existingSlot.save();
      res.status(200).send('Slots updated successfully');
    } else {
      res.status(404).json({ message: `No slots found for ${outfitter} on ${date}` });
    }
  } catch (err) {
    console.error('Error updating slots:', err);
    res.status(500).send('Error updating slots');
  }
}

//   delete a slot
const deleteSlot = async (req, res) => {
  const { outfitter, date } = req.params; // Assuming outfitter and date are in URL params

  try {
    const deletedSlot = await Slot.findOneAndDelete({ outfitter, date });

    if (deletedSlot) {
      res.status(200).send('Slots deleted successfully');
    } else {
      res.status(404).json({ message: `No slots found for ${outfitter} on ${date}` });
    }
  } catch (err) {
    console.error('Error deleting slots:', err);
    res.status(500).send('Error deleting slots');
  }
}

// Function to book a slot by date
const bookSlotByDate = async (req, res) => {
  try {
    const { outfitterId, date } = req.body;
    const userId = req.user.id; // Assuming user ID is set by verifyToken middleware

    // Parse and validate the booking date
    const bookingDate = new Date(date);
    const currentDate = new Date();
    // Set current date to start of the day (00:00:00) for comparison
    currentDate.setHours(0, 0, 0, 0);

    if (bookingDate < currentDate) {
      return res.status(400).json({ message: 'Booking date is in the past. Booking cannot be done.' });
    }

    // Find the outfitter
    const outfitter = await Outfitter.findById(outfitterId);
    if (!outfitter) {
      return res.status(404).json({ message: 'Outfitter not found' });
    }

    // Find the slot in the Slot model
    const slot = await Slot.findOne({ outfitter: outfitterId, date: bookingDate });
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found for the specified date' });
    }

    // Check if there are available slots
    if (slot.availableSlot <= 0) {
      return res.status(400).json({ message: 'No available slots' });
    }

    // Create a new booking
    const booking = new Booking({
      userId: userId,
      outfitterId: outfitterId,
      slotId: slot._id,
    });

    // Save the booking
    await booking.save();

    // Decrement available slots
    slot.availableSlot -= 1;
    await slot.save();

    // Update the outfitter's slotData
    const slotIndex = outfitter.slotData.findIndex(s => s.date.toISOString().split('T')[0] === date);
    if (slotIndex !== -1) {
      outfitter.slotData[slotIndex].availableSlot = slot.availableSlot;
      await outfitter.save();
    }

    // Save booking to user
    await User.findByIdAndUpdate(userId, {
      $push: { bookings: booking._id }
    });

    res.status(200).json({
      message: 'Booking successful',
      booking: {
        date: slot.date.toISOString().split('T')[0],
        availableSlot: slot.availableSlot,
        outfitter: {
          name: outfitter.name,
          description: outfitter.description,
          area: outfitter.area,
          location: outfitter.location,
          image: outfitter.image,
          category: outfitter.category
        }
      }
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { bookSlotByDate };




// Function to get booking history
const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from decoded token

    // Find bookings for the user and populate outfitter and slot details
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'outfitterId',
        select: 'name description area location image category'
      })
      .populate({
        path: 'slotId',
        select: 'date availableSlot'
      });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    // Prepare the response
    const bookingHistory = bookings.map(booking => ({
      outfitter: booking.outfitterId,
      slot: booking.slotId,
      status: getStatus(booking.slotId.date) // Assuming getStatus function determines status based on date
    }));

    res.status(200).json({ bookings: bookingHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to determine booking status based on current date and booked date
const getStatus = (bookedDate) => {
  const currentDate = new Date();
  bookedDate = new Date(bookedDate);

  if (currentDate <= bookedDate) {
    return 'Yet to Begin';
  } else {
    return 'Completed';
  }
};


const refillSlotQuantity = async (req, res) => {
  try {
    const { outfitterId, date, quantityToAdd } = req.body;

    // Validate the input
    if (!outfitterId || !date || !quantityToAdd) {
      return res.status(400).json({ message: 'Outfitter ID, date, and quantity to add are required' });
    }

    // Convert date string to Date object
    const slotDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if the slot date is in the past
    if (slotDate < currentDate) {
      return res.status(400).json({ message: 'Slot date is in the past. Refill is not possible.' });
    }

    // Find the slot for the given date and outfitter
    let slot = await Slot.findOne({ outfitter: outfitterId, date: slotDate });

    // If slot not found, return error
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found for the specified date' });
    }

    // Increase the availableSlot quantity
    slot.availableSlot += quantityToAdd;
    const savedSlot = await slot.save();

    // Find the outfitter and update the slotData
    const outfitter = await Outfitter.findById(outfitterId);
    const slotIndex = outfitter.slotData.findIndex(s => s.date.toISOString().split('T')[0] === date);

    if (slotIndex !== -1) {
      outfitter.slotData[slotIndex].availableSlot = savedSlot.availableSlot;
    } else {
      // If slot date not found in slotData, add it
      outfitter.slotData.push({
        date: savedSlot.date.toISOString().split('T')[0],
        availableSlot: savedSlot.availableSlot
      });
    }

    await outfitter.save();

    // Respond with success message and slot details
    res.status(200).json({
      message: 'Slot quantity refilled successfully',
      status: 'success',
      outfitter: {
        id: outfitter._id,
        name: outfitter.name,
        description: outfitter.description,
        area: outfitter.area,
        image: outfitter.image,
        category: outfitter.category
      },
      slot: {
        date: savedSlot.date.toISOString().split('T')[0],
        availableSlot: savedSlot.availableSlot
      }
    });
  } catch (error) {
    console.error('Error refilling slot:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
};

module.exports = { refillSlotQuantity };


module.exports = {
  createSlot,
  getSlotsByOutfitterAndDate,
  updateSlot,
  deleteSlot,
  getSlotsByOutfitter,
  bookSlotByDate,
  getBookingHistory,
  refillSlotQuantity
}