import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  acceptFriendRequest, 
  getFriendRequests, 
  getMyFriends, 
  getOutgoingFriendReqs, 
  getRecommendedUsers, 
  sendFriendRequest,
  searchUsers 
} from '../controllers/user.controller.js';

const router = express.Router();

router.use(protectRoute); //Applying middleware to all routes

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/search", searchUsers); // New search route

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;