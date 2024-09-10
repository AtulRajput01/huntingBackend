const express = require('express');
const { createOutfitter, getAllOutfitters, getOutfitterById, updateOutfitter, deleteOutfitter, deleteAllOutfitters, getOutfittersByArea, loginOutfitter } = require('../controllers/outfitterController');

const router = express.Router();

// CRUD routes
router.post('/create', createOutfitter);
router.get('/getAll', getAllOutfitters);
router.get('/getOutfitter/:id', getOutfitterById);
router.put('/updateOutfitter/:id', updateOutfitter);
router.delete('/deleteOutfitter/:id', deleteOutfitter);
router.delete('/deleteAllOutfitter', deleteAllOutfitters);
router.get('/search', getOutfittersByArea);
router.post('/login', loginOutfitter);

module.exports = router;
