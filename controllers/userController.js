const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require("../models/userModel");
const Animal = require("../models/animalModel")
const Outfitter = require("../models/outfitterModel")
const Role = require("../models/roleModel");
const createError = require("../middleware/error");
const createSuccess = require("../middleware/success");
const bcrypt = require("bcrypt");
const Slot = require("../models/slotModel")
const validator = require('validator');

//to Create user
const register = async (req, res, next) => {
  try {
    if (!validator.isEmail(req.body.email)) { // Email validation
      return next(createError(400, "Invalid email format"));
    }
    if (req.body.password.length < 8) { // Password validation
      return next(createError(400, "Password must be of 3 to 8 characters long"));
    }
    if (req.body.name.length <= 1 || req.body.name.length >= 25) { // Password validation
      return next(createError(400, "Name must be between 2 to 25"));
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(500).json({
        message: "User already exists",
        success: false,
      });
    const role = await Role.find({ role: "User" });
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobileNumber,
      password: hashedPassword,
      roles: role,
    });
    await newUser.save();
    return res.status(200).json("User Signup/Registered Successfully");
  } catch (error) {
    return next(createError(500, "Something went wrong"));
  }
};

//get users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return next(createSuccess(200, "All Users", users));
  } catch (error) {
    return next(createError(500, "Internal Server Error!"));
  }
};

//get user
// const getUser = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return next(createError(404, "User Not Found"));
//     }
//     return next(createSuccess(200, "Single User", user));
//   } catch (error) {
//     return next(createError(500, "Internal Server Error!"));
//   }
// };

//update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await User.findByIdAndUpdate(id, req.body);
    if (!users) {
      return next(createError(404, "User Not Found"));
    }
    return next(createSuccess(200, "User Details Updated", users));
  } catch (error) {
    return next(createError(500, "Internal Server Error!"));
  }
};

// Function to edit user details
const editUser = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from the request parameters
    const { name, email, password, mobileNumber, profileImage } = req.body;
    console.log(id)
    // Find the user by ID
    const user = await User.findById(id);

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the fields that are provided in the request body
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(8);
      user.password = await bcrypt.hash(password, salt);
    }
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (profileImage) user.profileImage = profileImage;

    // Save the updated user
    const updatedUser = await user.save();

    // Exclude the password field from the response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// getting user by id
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and select specific fields
    const user = await User.findById(userId).select('name email mobileNumber profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all the users
// const getAllUsers = async (req, res) => {
//   try {
//     // Find all users and select specific fields
//     const users = await User.find().select('name email mobileNumber');

//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   getUser,
//   getAllUsers
// };



//delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(createError(404, "User Not Found"));
    }
    return next(createSuccess(200, "User Deleted", user));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// forget password
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const ResetPasswordLink = "https://en.wikipedia.org/wiki/Facebook"
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(resetToken);
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      // subject: 'Password Reset',
      // text: `
      //   You requested a password reset. Click the following link to reset your password:
      //   http://${req.headers.host}/reset-password/${resetToken}
      //   If you did not request this, please ignore this email.
      // `,
      subject: "Password Reset",
      html: `<p>valid for 15 minutes.</p>
      <p><a href="${ResetPasswordLink}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>`

    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Error sending email');
      }
      res.status(200).send('Password reset email sent');
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};

const resetPasswordUser = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.password = await bcrypt.hash(newPassword, 12); // Hash the new password
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).send('Password reset successful');
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};


// Adds animal ID as reserve in the user
const addAnimalReserve = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { animalId } = req.params;

    // Find the animal by ID
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return next(createError(404, 'Animal Not Found'));
    }

    // Update the user's reserved animal
    const user = await User.findByIdAndUpdate(
      userId,
      { reserve: animalId },
      { new: true }
    ).populate('reserve'); // Optionally populate the reserved animal details

    res.status(200).json({
      status: 200,
      message: 'Animal reserved successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, 'Something went wrong'));
  }
};

// Function to get the reserved animal for the authenticated user
const getReservedAnimalForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the user and populate the reserved animal details
    const user = await User.findById(userId).populate('reserve');

    if (!user) {
      return next(createError(404, 'User Not Found'));
    }

    if (!user.reserve) {
      return next(createError(404, 'No reserved animal found for this user'));
    }

    res.status(200).json({
      status: 200,
      message: 'Reserved animal retrieved successfully',
      data: user.reserve
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, 'Something went wrong'));
  }
};



// Add an outfitter to user's favorites
const addFavorite = async (req, res, next) => {
  try {
    const outfitterId = req.params.outfitterId;
    const userId = req.user.id; // Extracted from decoded token

    // Check if the outfitter exists
    const outfitter = await Outfitter.findById(outfitterId);
    if (!outfitter) {
      return next(createError(404, 'Outfitter not found'));
    }

    // Construct the favorite object
    const favorite = {
      outfitterId: outfitter._id,
      outfitterName: outfitter.name
    };

    // Find the user by ID and update their favorites
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: favorite } }, // $addToSet prevents duplicates
      { new: true }
    );

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      status: 200,
      message: 'Outfitter added to favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};


// Get user's favorites
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id; // Extracted from decoded token

    // Find the user by ID and populate the favorites field
    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // console.log('User favorites:', user.favorites); // Debugging line

    res.status(200).json({
      status: 200,
      message: 'Favorites retrieved successfully',
      data: user.favorites
    });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};

// liability form submission
const liabilityForm = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's liabilityAcknowledged field to true
    user.liabilityAcknowledged = true;
    await user.save();

    res.json({ message: 'Liability form acknowledged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Function to delete all users
const deleteAllUsers = async (req, res, next) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      status: 200,
      message: 'All users deleted successfully',
      data: result,
    });
  } catch (error) {
    return next(createError(500, 'Internal Server Error'));
  }
};

module.exports = {
  register,
  getUser,
  getAllUsers,
  updateUser,
  editUser,
  forgetPassword,
  deleteUser,
  resetPasswordUser,
  addAnimalReserve,
  addFavorite,
  getFavorites,
  getReservedAnimalForUser,
  liabilityForm,
  deleteAllUsers
};
