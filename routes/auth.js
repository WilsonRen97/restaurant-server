const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("Server is now accepting a request regarding authentication.");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("Connect to auth route successfully.");
});

router.post("/register", async (req, res) => {
  // check if the registering data is valid
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if the email has been registered
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send("This email has been registered!");

  // create a new user
  let { email, username, password, role } = req.body;
  let newUser = new User({
    email,
    username,
    password,
    role,
    likedRestaurants: [], // Initialize as empty array
    createdRestaurants: [],
    visitedRestaurants: [],
  });
  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "User is saved.",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("Error! Cannot store user info.");
  }
});

router.post("/login", async (req, res) => {
  // check if login data is valid
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if we can find the user associated with this email
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res
      .status(401)
      .send("Cannot find this user. Please check if this email is valid.");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "Login Successfully!",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("Your password is incorrect.");
    }
  });
});

module.exports = router;
