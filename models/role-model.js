const { Schema, model } = require("mongoose");

//category


const roleSchema = new Schema({
    name: { type: String, required: true },
   
    url: { type: String },
    status: { type: String },
    createdBy :{ type: String},
   

});


const Role = new model('role', roleSchema);




module.exports = { Role};



