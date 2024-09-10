const express = require("express");
const { getAllGuides, login, getGuide,deleteGuide,updateGuide,register, forgetPassword, resetPasswordGuide, sendEmail, resetPassword, verifyOTP} = require('../controllers/guideController')
const { verifyAdmin, verifyUser } = require('../middleware/verifyToken');
// const { resetPassword } = require("../controllers/authController");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getGuide);
router.get('/', verifyAdmin, getAllGuides);
router.put('/:id', verifyAdmin, updateGuide);
router.delete('/:id', verifyAdmin, deleteGuide);
router.post('/forgetpassword', forgetPassword);
router.post('/reset-password/:token', resetPasswordGuide);
router.post('/send-reset-email', sendEmail);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;