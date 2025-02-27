// import basic modules
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

// routes
const authRoute = require("./routes").auth;
const restaurantRoute = require("./routes").restaurant;
const commentRoute = require("./routes").comment;

// passport and cors
const passport = require("passport");
require("./config/passport")(passport);
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

app.use("/api/user", authRoute);

app.use("/api/restaurants", restaurantRoute);

app.use(
  "/api/comments",
  passport.authenticate("jwt", { session: false }),
  commentRoute
);

app.listen(8080, () => {
  console.log("後端伺服器聆聽在port 8080...");
});
