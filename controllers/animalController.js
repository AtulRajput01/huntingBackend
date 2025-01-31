const animal=require('../models/animalModel');

const addAnimal=async (req,res)=>{
  try{
    const {name}=req.body;
    if(!name){
      res.send('name is required')
    }else{
      const newAnimal=new animal({
        name
      })
      await newAnimal.save();
      res.send('animal added');
    }
  }catch(error){
    res.send('error')
  }
}

const addSpecies = async (req, res) => {
  try {
    const { animalId, specieName, specieImage,description } = req.body;

    const animals = await animal.findById(animalId);
    if (!animal) {
      return res.status(404).send('Animal not found');
    }
 
    animals.subcategories.push({
      spiceName:specieName,
      spiceImage:specieImage,
      description:description
    });
    await animals.save();
    res.status(200).send('Subcategory added');
  } catch (error) {
    res.status(500).send('Error adding subcategory');
  }
};

const getAnimal=async(req,res)=>{
  try{
    const animals = await animal.find();
    res.json({
      data:animals,
      massage:"get all",
      status:200
    })
  }catch(error){
    res.send("error")
  }
}

const getAnimalById=async(req,res)=>{
  try{
    const {id}=req.params;
    const animals = await animal.findById(id);
    const species = animals.subcategories.map(specie => ({
      spiceName: specie.spiceName,
      spiceImage: specie.spiceImage,
      spiceID:specie._id
    }));
    res.json({
      data:species,
      massage:"get all",
      status:200
    })
  }catch(error){
    res.send("error")
  }
}

const deleteAnimals=async(req,res)=>{
  try{
    const {id}=req.params;
    const result=await animal.findByIdAndDelete(id);
    res.send({massage:"Deleted successfully...!"})
  }catch(error){
    res.send({msg:error.massage})
  }
}

const deleteSpecies=async(req,res)=>{
  try{
    const { animalId, id } = req.params;
    const result = await animal.findById(animalId);
    if (!result) {
      return res.status(404).send({ message: "Animal not found" });
    }
    const speciesIndex = result.subcategories.findIndex(
      (species) => species._id.toString() === id
    );

    if (speciesIndex === -1) {
      return res.status(404).send({ message: "Species not found" });
    }
    result.subcategories.splice(speciesIndex, 1);
    await result.save();

    res.send({ message: "Species deleted successfully" });
  }catch(error){
    res.send({massage:error.massage})
  }
}

const getSpecie=async(req,res)=>{
  try{
    const {id}=req.params;
    const reslut=await animal.findById(id)
    res.status(200).json({
      status:200,
      data: reslut.subcategories
    })
  }catch(error){
    res.status(500).json({
      status:500,
      msg:error.massage
    })
  }
}

module.exports={addAnimal,getAnimal,addSpecies,getAnimalById,deleteAnimals,deleteSpecies,getSpecie}