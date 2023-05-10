import { Router } from "express";
import ConversationController from "../controllers/ConversationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get("/conversations/:id", ConversationController.fetchById);
router.get("/conversations/all/:userId", authMiddleware, ConversationController.fetchByUserId);
router.post("/conversations", ConversationController.post);

export default router;
