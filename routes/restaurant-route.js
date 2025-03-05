const router = require("express").Router();
const Restaurant = require("../models").restaurant;
const User = require("../models").user;
const passport = require("passport");
require("../config/passport")(passport);

router.use((req, res, next) => {
  console.log("Restaurant route is now accepting a request.");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("Connect to restaurant route successfully!");
});

// use restaurant name to find the restaurant
router.get("/findByName/:theName", async (req, res) => {
  let { theName } = req.params;
  try {
    //
    let restaurantFound = await Restaurant.findOne({
      name: { $regex: theName, $options: "i" },
    })
      .populate({
        path: "comment",
        select: "text date createdBy",
        populate: {
          path: "createdBy",
          select: "username",
        },
      })
      .exec();
    console.log(restaurantFound);
    return res.send(restaurantFound);
  } catch (e) {
    console.log("No");
    return res.status(500).send({ message: "Error fetching restaurant." });
  }
});

// use restaurant to find the restaurant
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    const restaurantFound = await Restaurant.findById(_id).populate({
      path: "comment",
      select: "text date createdBy",
      populate: {
        path: "createdBy",
        select: "username",
      },
    });

    console.log(restaurantFound);
    return res.send(restaurantFound);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Error fetching restaurant." });
  }
});

// get all comments accociated with a specific restaurant
router.get("/:restaurantId/comments", async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: "comments",
      populate: { path: "createdBy", select: "username" },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json(restaurant.comment);
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/savelist/:restaurantId/:userId/:listType",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { restaurantId, userId, listType } = req.params;
    console.log(restaurantId, " ", userId, " ", listType);
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      if (listType === "favorites") {
        user.likedRestaurants.push(restaurantId);
      } else if (listType === "visited") {
        user.visitedRestaurants.push(restaurantId);
      }
      await user.save();
      res.json({
        message: "Restaurant list updated successfully!",
        user: user,
      });
    } catch (error) {
      console.error("Error updating user's restaurant list:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

router.put(
  "/deletelist/:restaurantId/:userId/:listType",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { restaurantId, userId, listType } = req.params;
    console.log(restaurantId, " ", userId, " ", listType);
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      if (listType === "favorites") {
        user.likedRestaurants.remove(restaurantId);
      } else if (listType === "visited") {
        user.visitedRestaurants.remove(restaurantId);
      }
      await user.save();
      res.json({
        message: "Restaurant list updated successfully!",
        user: user,
      });
    } catch (error) {
      console.error("Error updating user's restaurant list:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// edit a restaurant's description
router.put(
  "/:id/description",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    try {
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found." });
      }
      restaurant.description = description;
      await restaurant.save();

      res.json({ message: "Description updated successfully!" });
    } catch (error) {
      console.error("Error updating description:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// get random 3 restaurant's information
router.get("/gallery/random-restaurants", async (req, res) => {
  try {
    const randomRestaurants = await Restaurant.aggregate([
      { $sample: { size: 3 } },
    ]);
    res.json(randomRestaurants);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch random restaurants" });
  }
});

router.get("/favrestaurant/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const { listType } = req.query;
    console.log("User ID:", userID);
    console.log("listtype:", listType);
    // Find the user by ID
    const user = await User.findById(userID);
    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let userFavRestaurants;
    if (listType === "favorites") {
      userFavRestaurants = await Restaurant.find({
        _id: { $in: user.likedRestaurants },
      });
      console.log("fav");
    } else if (listType === "visited") {
      userFavRestaurants = await Restaurant.find({
        _id: { $in: user.visitedRestaurants },
      });
    }

    // Retrieve user's favorite restaurants
    console.log("User's favorite restaurants:", userFavRestaurants);
    // Check if visitedRestaurants exists or is empty
    // Send successful response
    res.status(200).json(userFavRestaurants);
  } catch (err) {
    console.error("Error fetching favorite restaurants:", err.message);
    res.status(500).json({ message: "Failed to fetch favorite restaurants" });
  }
});
module.exports = router;
