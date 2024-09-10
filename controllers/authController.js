const User = require('../models/userModel');
const Guide = require('../models/guideModel');
const Role = require('../models/roleModel');
const createError = require('../middleware/error')
const createSuccess = require('../middleware/success')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const validator = require('validator');


//to Create user
const register = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, name } = req.body;
    if (!validator.isEmail(email)) {
      return next(createError(400, "Invalid email format"));
    }

    if (password.length < 8) {
      return next(createError(400, "Password must be at least 8 characters long"));
    }

    if (password !== confirmPassword) {
      return next(createError(400, "Passwords do not match"));
    }

    if (name.length <= 1 || name.length >= 25) {
      return next(createError(400, "Name must be between 2 to 25 characters long"));
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(500).json({
        status: 500,
        message: "User already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    return next(createSuccess(200, "User SignUp Successful!", newUser));
  } catch (error) {
    return next(createError(500, "Something went wrong"));
  }
};

//to login
const login = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found"
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Password is Incorrect"
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({
        status: 200,
        message: "Login Success",
        token,
        data: user
      });

  } catch (error) {
    console.error("Login error:", error);
    return next(createError(500, "Something went wrong"));
  }
};

//to login of Guide
// const loginGuide = async (req, res, next) => {
//   try {
//     let user = await User.findOne({ email: req.body.email });

//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: "User Not Found"
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         status: 401,
//         message: "Password is Incorrect"
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin, roles: user.roles },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.cookie("access_token", token, { httpOnly: true })
//       .status(200)
//       .json({
//         status: 200,
//         message: "Login Success",
//         token,
//         data: user
//       });

//   } catch (error) {
//     console.error("Login error:", error);
//     return next(createError(500, "Something went wrong"));
//   }
// };



//Register Admin


// this is the admin login

const loginAdmin = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const adminEmail = 'admin@hunt30.com';
      const adminPassword = 'admin';
  
      if (email !== adminEmail || password !== adminPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({
          status: 200,
          message: "Login Success",
          token,
          data: { email: adminEmail, role: 'admin' }
        });
    } catch (error) {
      return next(createError(500, "Something went wrong"))
    }
};

//sendresetmail
const sendEmail = async (req, res, next) => {
  const email = req.body.email;
  try {

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    let guide=[];
    let user = await User.findOne({ email });
    let userType = "user";
    if (!user) {
      guide = await Guide.findOne({ email });
      userType = "guide";
    }

    if (!user && !guide) {
      return next(createError(401, "Invalid Email"));
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    if(userType=="user"){
    user.otp = otp;
    user.otpExpiration = Date.now() + 15 * 60 * 1000;
    await user.save();
    }else{
      guide.otp = otp;
      guide.otpExpiration = Date.now() + 15 * 60 * 1000;
    await guide.save();
    }

    const ResetPasswordLink = `http://13.200.240.28:3000/reset-password?token=${otp}`;
    
    const mailTransporter = nodemailer.createTransport({
      service: "GMAIL",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailDetails = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p>
      <p><a href="${ResetPasswordLink}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>`
    };

    mailTransporter.sendMail(mailDetails);
    res.json({
      status: 200,
      success: true,
      message: "OTP sent to your mail"
    })
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).send("Internal Server Error");
  }
};

const verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  try {
    let guide=[];
    let user = await User.findOne({ otp, otpExpiration: { $gt: Date.now() } });
    let userType = "user";
    if (!user) {
      guide = await Guide.findOne({ otp, otpExpiration: { $gt: Date.now() } });
      userType = "guide";
    }

    if (!user && !guide) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if(userType=="user"){
      user.otp = undefined;
      user.otpExpiration = undefined;
      await user.save();
    }else{
      guide.otp = undefined;
      guide.otpExpiration = undefined;
      await guide.save();
    }


    const token = jwt.sign({ email:user ? user.email : guide.email}, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({
      status: 200,
      success: true,
      message: "OTP Verified successfully!",
      token:token
    })
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return next(createError(500, "Internal Server Error"));
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decodedToken.email;
    let guide=[];
    let user = await User.findOne({ email: userEmail });
    let userType = "user";
    if (!user) {
      guide = await Guide.findOne({ email: userEmail });
      userType = "guide";
    }

    if (!user && !guide) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    if(userType=="user"){
      user.password = hashedPassword;
      await user.save();
    }else{
      guide.password = hashedPassword;
      await guide.save();
    }
    res.json({
      status: 200,
      success: true,
      message: "Password reset Successfully!"
    })
  } catch (error) {
    console.error("Error resetting password:", error);
    return next(createError(500, "Internal Server Error"));
  }
};


const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return next(createSuccess(200, "Logged out Succeessfully!"));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, loginAdmin, sendEmail, resetPassword, verifyOTP, logout }