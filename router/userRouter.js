import { Router } from "express";
import UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.post("/registration", UserController.registration);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/refresh", UserController.refresh);

router.get("/users", authMiddleware, UserController.fetchUsers);
router.get("/users/:id", authMiddleware, UserController.fetchById);
router.put("/users/:id", UserController.putUser);

router.get("/friends/:userId", authMiddleware, UserController.fetchFriends);
router.post("/friends/:userId", UserController.postFriend);
router.delete("/friends/:userId", UserController.deleteFriend);

router.get("/followings/:userId", UserController.fetchFollowings);
router.put("/followings/:userId", UserController.addFollowings);
router.delete("/followings/:userId", UserController.deleteFollowings);

router.get("/requests/:userId", UserController.fetchRequests);
router.delete("/requests/:userId", UserController.deleteRequest);

export default router;
