const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "restaurateur"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likedRestaurants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  ],
  createdRestaurants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  ],
  visitedRestaurants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  ],
});

// instance methods
userSchema.methods.isCustomer = function () {
  return this.role == "customer";
};

userSchema.methods.isRestaurateur = function () {
  return this.role == "restaurateur";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// mongoose middlewares
userSchema.pre("save", async function (next) {
  // this 代表 mongoDB 內的 document
  if (this.isNew || this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
