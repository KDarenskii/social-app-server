import { Router } from "express";
import PostController from "../controllers/PostController.js";

const router = new Router();

router.get("/posts", PostController.get);
router.get("/posts/:userId", PostController.fetchByUserId);
router.post("/posts", PostController.post);
router.put("/posts/:id", PostController.update);
router.delete("/posts/:id", PostController.delete);

export default router;
