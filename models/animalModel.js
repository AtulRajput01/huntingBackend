const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animalSchema = new Schema(
{
  name:{type:String,require:true},
  subcategories: [
    {
      spiceName: { type: String, require: false },
      spiceImage:[{type:String, require: false}],
      description:{type:String,require:false}
    }
  ]
}
);

module.exports = mongoose.model('Animal', animalSchema);
