const express = require("express");
let router = express.Router();

let {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

let verify_token = require("../middleware/userVerification");


router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);

module.exports = router;
