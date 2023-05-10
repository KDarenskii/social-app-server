import { Router } from "express";
import MessageController from "../controllers/MessageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get("/messages/:conversationId", authMiddleware, MessageController.fetchByConversationId);
router.post("/messages", authMiddleware, MessageController.post);

export default router;
