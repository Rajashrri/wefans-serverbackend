const express = require("express");
const router = express.Router();
const authcontrollers = require("../controllers/auth-controller");
const {signupSchema , loginSchema } =require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");
const  authMiddleware = require("../middlewares/auth-middleware");


router.route("/").get(authcontrollers.home);

router
    .route("/register")
    .post(validate(signupSchema),authcontrollers.register);

router.route("/login").post(validate(loginSchema), authcontrollers.login);
router.route("/verify-otp").post(authcontrollers.verifyOtp);
router.route("/resend-login-otp").post(authcontrollers.resendLoginOtp);
router.route("/forgot-password").post(authcontrollers.forgotPassword);
router.route("/verify-forgot-otp").post(authcontrollers.verifyForgotOtp);
router.route("/resend-forgot-otp").post(authcontrollers.resendForgotOtp);

router.get("/getdataByid/:id", authcontrollers.getdataByid);

router.route("/verify-reset-token").post(authcontrollers.verifyResetToken);
router.route("/reset-password").post(authcontrollers.resetPassword);
router.route("/logout").post(authcontrollers.logout);

router.route("/user").get(authMiddleware, authcontrollers.user);
module.exports = router;