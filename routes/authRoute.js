const express = require('express');
const { register,login, loginAdmin, sendEmail, resetPassword,verifyOTP, logout } = require('../controllers/authController')

//as User
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login-admin', loginAdmin);
router.post('/send-email',sendEmail)
router.post("/resetPassword", resetPassword);
router.post("/verifyOTP", verifyOTP);
router.post('/logout', logout);


module.exports = router;