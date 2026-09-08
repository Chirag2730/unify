import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getUserChannels, 
    createChannel,
    getStreamToken
} from "../controllers/chat.controller.js";

const router = express.Router();

// Apply middleware to all routes
router.use(protectRoute);

router.get("/token", getStreamToken);

// Channel routes
router.get("/channels", getUserChannels);
router.post("/channels", createChannel);


export default router;