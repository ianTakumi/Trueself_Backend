const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage
});

module.exports = upload;
