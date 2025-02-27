const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  image: String,
  michelin_type: String,
  description: [{ type: String }],
  comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
