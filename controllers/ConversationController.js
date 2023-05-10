import ApiError from "../exceptions/ApiError.js";
import ConversationService from "../services/ConversationService.js";

class ConversationController {
    async fetchById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw ApiError.BadRequest("id is required");
            }
            const conversationData = await ConversationService.getById(id);
            res.status(200).json(conversationData);
        } catch (error) {
            next(error);
        }
    }

    async fetchByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw ApiError.BadRequest("userId is required");
            }
            const conversationsData = await ConversationService.getByUserId(userId);
            res.status(200).json(conversationsData);
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
            let conversation;
            conversation = await ConversationService.getByMembers(body);
            if (!conversation) {
                conversation = await ConversationService.create(body);
            }
            res.status(200).json(conversation);
        } catch (error) {
            next(error);
        }
    }
}

export default new ConversationController();
