const express = require("express");
// const User = require('../models/userModel');

const { getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    editUser,
    register,
    forgetPassword,
    resetPasswordUser,
    addAnimalReserve,
    addFavorite,
    getFavorites,
    getReservedAnimalForUser,
    liabilityForm,
    deleteAllUsers } = require('../controllers/userController')



const { verifyAdmin, verifyUser, verifyToken } = require('../middleware/verifyToken');
const { resetPassword } = require("../controllers/authController");
// const company_route = express();
const router = express.Router();

router.post('/register', register);
router.get('/:id', verifyUser, getUser);
router.get('/', verifyAdmin, getAllUsers);
router.put('/:id', verifyAdmin, updateUser);
router.delete('/:id', verifyAdmin, deleteUser);
router.post('/forgetpassword', forgetPassword);
router.post('/reset-password/:token', resetPasswordUser);
// Endpoint to reserve an animal
router.post('/reserve/:animalId', verifyToken, addAnimalReserve);
// Route to add an outfitter to favorites
router.post('/add-favorite/:outfitterId', verifyToken, addFavorite);
// Route to get user's favorites
router.get('/favorites/:userId', verifyToken, getFavorites);
// Route to get the reserved animal for the authenticated user
router.get('/reserved-animal/:userId', verifyToken, getReservedAnimalForUser);

router.post('/acknowledge-liability', liabilityForm);

// Route to edit user details
router.put('/edit/:id',verifyToken, editUser);

router.delete('/deleteAll', deleteAllUsers);



// router.get('/bookingHistory', verifyToken, getBookingHistory);

module.exports = router;