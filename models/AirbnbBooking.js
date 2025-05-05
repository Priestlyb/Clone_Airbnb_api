const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  airbnbPlaces: {type:mongoose.Schema.Types.ObjectId, required:true, ref:'airbnbPlaces'},
  airbnbUsers: {type:mongoose.Schema.Types.ObjectId, required:true},
  checkIn: {type:Date, required:true},
  checkOut: {type:Date, required:true},
  name: {type:String, required:true},
  phone: {type:String, required:true},
  price: Number,
});

const BookingModel = mongoose.model('airbnbBooking', bookingSchema);

module.exports = BookingModel;