// import basic modules
const serverless = require("serverless-http");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const router = express.Router();

// routes
const authRoute = require("../routes").auth;
const restaurantRoute = require("../routes").restaurant;
const commentRoute = require("../routes").comment;

// passport and cors
const passport = require("passport");
require("../config/passport")(passport);
const cors = require("cors");

// connect to mongodb atlas
mongoose
  .connect(process.env.MONGODB_URII)
  .then(() => {
    console.log("Connected to MongoDB Atlas...");
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB Atlas:", e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

router.use("/user", authRoute);
router.use("/restaurants", restaurantRoute);
router.use(
  "/comments",
  passport.authenticate("jwt", { session: false }),
  commentRoute
);

app.use("/.netlify/functions/api", router);

// Export as a Netlify function
module.exports.handler = serverless(app);
