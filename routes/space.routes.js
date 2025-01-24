const express = require("express");
const router = express.Router();
const spaceController = require("../controllers/space.controller");
const upload = require("../middlewares/multer.middleware");

// Get all spaces
router.get("/", spaceController.getSpaces);

// Create space
router.post("/", spaceController.createSpace);

// Update space
router.put("/:spaceId", spaceController.updateSpace);

// Delete space
router.delete("/:spaceId", spaceController.deleteSpace);

module.exports = router;
