const express = require("express");
const router = express.Router();
const {addAnimal,getAnimal,addSpecies,getAnimalById,deleteAnimals,deleteSpecies}=require('../controllers/animalController')

router.post('/addAnimal',addAnimal)
router.post('/addSpecies',addSpecies)
router.get('/getAnimal',getAnimal)
router.get('/getAnimal/:id',getAnimalById)
router.delete('/deleteAnimals/:id',deleteAnimals)
router.delete('/deleteSpecies/:animalId/:id',deleteSpecies)


module.exports = router;
