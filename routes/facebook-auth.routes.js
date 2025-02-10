const express = require("express");
const router = express.Router();
const passport = require("../configs/passport.config");

// login and register with Facebook
router.get(
  "/auth",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);

module.exports = router;
