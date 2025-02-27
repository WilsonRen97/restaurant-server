const router = require("express").Router();
const Comment = require("../models").comment;
const Restaurant = require("../models").restaurant;

router.use((req, res, next) => {
  console.log("Comment route is now accepting a request.");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("Connect to comment route successfully!");
});

router.post("/:restaurantId", async (req, res) => {
  const { content, user } = req.body;
  const { restaurantId } = req.params;
  console.log({ content, user, restaurantId });
  try {
    const newComment = new Comment({
      text: content,
      createdBy: user,
      restaurant: restaurantId,
    });
    const savedComment = await newComment.save();
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { comment: savedComment._id },
    });

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: savedComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
});

module.exports = router;
