
const Outfitter = require("../models/outfitterModel");
const createError = require("../middleware/error");
const createSuccess = require("../middleware/success");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Animal = require('../models/animalModel');



// Create new outfitter

const createOutfitter = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      image,
      outfitterName,
      description,
      mobileNumber,
      animalId,
      specieId,
      street,
      city,
      addressState,
      zipCode
    } = req.body;

    const existingOutfitter = await Outfitter.findOne({ email });
    if (existingOutfitter) {
      return res.status(400).json({
        message: "Outfitter with this email already exists",
        status: 400
      });
    }

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(400).json({
        message: "Invalid animal selected",
        status: 400
      });
    }

    const specie = animal.subcategories.find((s) => s._id.toString() === specieId);
    if (!specie) {
      return res.status(400).json({
        message: "Invalid species selected",
        status: 400
      });
    }

    const newOutfitter = new Outfitter({
      email,
      password,
      name,
      image,
      outfitterName,
      description,
      mobileNumber,
      animalCategory:animal.name,
      address: {
        street,
        city,
        state: addressState,
        zipCode
      },
      animal: {
        animalId,
        specieId,
      }
    });

    await newOutfitter.save();

    return res.status(201).json({
      message: "Outfitter created successfully",
      status: 201,
      outfitter: newOutfitter
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: 500
    });
  }
};



// Get all outfitters
const getAllOutfitters = async (req, res, next) => {
  try {
    const outfitters = await Outfitter.find();
    return next(createSuccess(200, "All Outfitters", outfitters));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Get outfitter by ID
const getOutfitterById = async (req, res, next) => {
  try {
    const outfitter = await Outfitter.findById(req.params.id);
    if (!outfitter) {
      return next(createError(404, "Outfitter not found"));
    }
    return next(createSuccess(200, "Outfitter found", outfitter));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Update outfitter by ID
const updateOutfitter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedOutfitter = await Outfitter.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOutfitter) {
      return next(createError(404, "Outfitter not found"));
    }
    return next(createSuccess(200, "Outfitter updated successfully", updatedOutfitter));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Delete outfitter by ID
const deleteOutfitter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedOutfitter = await Outfitter.findByIdAndDelete(id);
    if (!deletedOutfitter) {
      return next(createError(404, "Outfitter not found"));
    }
    return next(createSuccess(200, "Outfitter deleted successfully", deletedOutfitter));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// delete all outfitters
const deleteAllOutfitters = async (req, res) => {
  try {
    const result = await Outfitter.deleteMany({});
    res.status(200).json({ message: 'All outfitters deleted successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search outfitters by area (exact match)
// Get animals by area
const getOutfittersByArea = async (req, res, next) => {
    try {
      const { area } = req.query;
      const outfitter = await Outfitter.find({ area });
      if (outfitter.length === 0) {
        return next(createError(404, "No Outfitters Found in this area"));
      }
      return next(createSuccess(200, `Outfitter in area: ${area}`, outfitter));
    } catch (error) {
      return next(createError(500, "Internal Server Error!"));
    }
  };


  // add cookie in local storage
  const loginOutfitter = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
          status: 400
        });
      }
  
      const outfitter = await Outfitter.findOne({ email });
      if (!outfitter) {
        return res.status(401).json({
          message: "Authentication failed. Invalid email or password.",
          status: 401
        });
      }
  
      const isMatch = await bcrypt.compare(password, outfitter.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Authentication failed. Invalid email or password.",
          status: 401
        });
      }
  
      // Ensure you have a JWT secret defined in your environment variables or config
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
      if (!jwtSecret) {
        return res.status(500).json({
          message: "Internal Server Error: JWT secret is not defined",
          status: 500
        });
      }
  
      const token = jwt.sign({ id: outfitter._id }, jwtSecret, { expiresIn: '1h' });
  
      return res.status(200).json({
        message: "Authentication successful",
        status: 200,
        token
      });
    } catch (error) {
      console.error('Error in loginOutfitter:', error);
      return res.status(500).json({
        message: "Internal Server Error",
        status: 500
      });
    }
  };
  

module.exports = { createOutfitter, getAllOutfitters, getOutfitterById, updateOutfitter, deleteOutfitter,
   deleteAllOutfitters, getOutfittersByArea, loginOutfitter
 };
