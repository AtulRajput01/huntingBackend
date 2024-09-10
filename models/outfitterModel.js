const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Defining the slot schema as a subdocument
const slotSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  availableSlot: {
    type: Number,
    required: true,
    default: 0
  }
});

// Defining the address schema as a subdocument
const addressSchema = new Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  }
});

const outfitterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  outfitterName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  mobileNumber: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  animalCategory:{
    type:String,
    require:true
  },
  address: addressSchema, 
  slotData: [slotSchema],  
  image: {
    type: String,
    required: false
  },
  animal: {
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal'
    },
    specieId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal'
    },
  }
});

// Pre-save middleware to hash the password before saving
outfitterSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const Outfitter = mongoose.model('Outfitter', outfitterSchema);

module.exports = Outfitter;
