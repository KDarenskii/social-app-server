import ApiError from "../exceptions/ApiError.js";
import NotificationService from "../services/NotificationService.js";

class NotificationController {
    async fetch(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            const notificationsData = await NotificationService.getByUserId(userId);
            res.status(200).json(notificationsData);
        } catch (error) {
            next(error);
        }
    }

    async post(req, res, next) {
        try {
            const body = req.body;
            if (!body) {
                throw ApiError.BadRequest("Request body is required");
            }
            const notificationData = await NotificationService.add(body);
            res.status(200).json(notificationData);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw ApiError.BadRequest("id is required");
            }
            await NotificationService.remove(id);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async deleteAll(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            await NotificationService.removeAll(userId);
            res.status(200).json({})
        } catch (error) {
            
        }
    }
}

export default new NotificationController();
