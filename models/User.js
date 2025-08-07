// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   image:{type:String,required:true},
//   adress:{type:String,required:true},
//   phonenumber:{type:String,required:true},
//   pincode:{type:String,required:true},
//   alternatephonenumber:{type:String},
//   isAdmin: { type: Boolean, default: false },
// });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username:{
    type:String,
    required:true,unique:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
//   image: String,
address: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    phoneNumber: { type: String },
    alternatePhoneNumber: { type: String },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
