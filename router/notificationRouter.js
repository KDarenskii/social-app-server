import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = new Router();

router.get("/notifications/:userId", NotificationController.fetch);
router.post("/notifications", NotificationController.post);
router.delete("/notifications/:id", NotificationController.delete);
router.delete("/notifications/all/:userId", NotificationController.deleteAll)

export default router;
