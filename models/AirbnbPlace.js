const mongoose = require('mongoose');

const airbnbplaceSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: String,
  address: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  maxCheckInTime: Number,
  minCheckInTime: Number,
  maxGuests: Number,
  price: Number,
});

const airbnbPlaceModel = mongoose.model('airbnbPlaces', airbnbplaceSchema);

module.exports = airbnbPlaceModel;