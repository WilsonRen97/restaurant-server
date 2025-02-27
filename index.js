// import basic modules
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

// connect to mongodb atlas
mongoose
  .connect(process.env.MONGODB_URII)
  .then(() => {
    console.log("Connected to MongoDB Atlas...");
  })
  .catch((e) => {
    console.error("Error connecting to MongoDB Atlas:", e);
  });

app.listen(8080, () => {
  console.log("後端伺服器聆聽在port 8080...");
});
