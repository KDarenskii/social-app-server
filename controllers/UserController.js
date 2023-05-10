import ApiError from "../exceptions/ApiError.js";
import NotificationService from "../services/NotificationService.js";
import UserService from "../services/UserService.js";

class UserController {
    async registration(req, res, next) {
        try {
            const { firstName, lastName, email, password } = req.body;
            if (!firstName || !lastName || !email || !password) {
                throw ApiError.BadRequest("Credentials are required");
            }
            const userData = await UserService.registration(firstName, lastName, email, password);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw ApiError.BadRequest("Credentials are required");
            }
            const userData = await UserService.login(email, password);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (refreshToken) {
                await UserService.logout(refreshToken);
            }
            res.clearCookie("refreshToken");
            res.status(200).json("Logged out successfully");
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                throw ApiError.UnauthenticatedError();
            }
            const userData = await UserService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async fetchUsers(req, res, next) {
        try {
            const { search = "" } = req.query;
            const users = await UserService.getUsers(search);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async fetchById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw ApiError.BadRequest("id is required");
            }
            const userData = await UserService.getUserById(id);
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async fetchFriends(req, res, next) {
        try {
            const { userId } = req.params;
            const { limit } = req.query;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            const friends = await UserService.getFriends(userId, limit);
            res.status(200).json(friends);
        } catch (error) {
            next(error);
        }
    }

    async postFriend(req, res, next) {
        try {
            const { userId } = req.params;
            const { friendId } = req.body;
            if (!userId || !friendId) {
                throw ApiError.BadRequest("userId and friendId is required");
            }
            await UserService.addFriend(userId, friendId);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async deleteFriend(req, res, next) {
        try {
            const { userId } = req.params;
            const { friendId } = req.query;
            if (!userId || !friendId) {
                throw ApiError.BadRequest("userId and friendId is required");
            }
            await UserService.removeFriend(userId, friendId);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async putUser(req, res, next) {
        try {
            const photo = req.files?.photo ?? null;
            const data = req.body;
            const { id } = req.params;
            if (!id || !data) {
                throw ApiError.BadRequest("id and user data is required");
            }
            const userData = await UserService.update(id, data, photo);
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async addFollowings(req, res, next) {
        try {
            const { userId } = req.params;
            const notification = req.body;
            if (!userId || !notification) {
                throw ApiError.BadRequest("userId and notification is required");
            }
            const followPromise = UserService.follow(userId, notification.userId);
            const notificationPromise = NotificationService.add(notification);
            const [notificationData] = await Promise.all([notificationPromise, followPromise]);
            res.status(200).json(notificationData);
        } catch (error) {
            next(error);
        }
    }

    async deleteFollowings(req, res, next) {
        try {
            const { userId } = req.params;
            const { followId } = req.query;
            if (!userId || !followId) {
                throw ApiError.BadRequest("userId and followId is required");
            }
            await UserService.unfollow(userId, followId);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async fetchFollowings(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            const followingsData = await UserService.getFollowings(userId);
            res.status(200).json(followingsData);
        } catch (error) {
            next(error);
        }
    }

    async fetchRequests(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            const requestsData = await UserService.getRequests(userId);
            res.status(200).json(requestsData);
        } catch (error) {
            next(error);
        }
    }

    async deleteRequest(req, res, next) {
        try {
            const { userId } = req.params;
            const { requestId } = req.query;
            if (!userId || !requestId) {
                throw ApiError.BadRequest("userId and requestId is required");
            }
            await UserService.removeRequest(userId, requestId);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
