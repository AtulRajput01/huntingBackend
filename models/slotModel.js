// models/Slot.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slotSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  availableSlot: {
    type: Number,
    required: true,
    default: 0
  },
  outfitter: {
    type: Schema.Types.ObjectId,
    ref: 'Outfitter',
    required: true
  }
});

module.exports = mongoose.model('Slot', slotSchema);
