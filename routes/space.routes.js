const express = require("express");
const router = express.Router();
const spaceController = require("../controllers/space.controller");
const upload = require("../middlewares/multer.middleware");

// Get all spaces
router.get("/", spaceController.getSpaces);

// Get space count
router.get("/count", spaceController.getSpaceCount);

// Get space by id
router.get("/:spaceId", spaceController.getSpaceById);

// Create space
router.post("/", spaceController.createSpace);

// Update space
router.put("/:spaceId", spaceController.updateSpace);

// Delete space
router.delete("/:spaceId", spaceController.deleteSpace);

module.exports = router;
