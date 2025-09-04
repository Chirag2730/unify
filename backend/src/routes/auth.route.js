import express from "express";
import { login, logout, signup, onboard, verifyOTP, resendOTP } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding",protectRoute,onboard);

//Check if user is logged in or not
router.get("/me",protectRoute, (req, res) => {
    res.status(200).json({ success:true, user: req.user });
})  

export default router;
