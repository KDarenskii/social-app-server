import ApiError from "../exceptions/ApiError.js";
import MessageService from "../services/MessageService.js";

class MessageController {
    async fetchByConversationId(req, res, next) {
        try {
            const { conversationId } = req.params;
            if (!conversationId) {
                throw ApiError.BadRequest("conversationId is required");
            }
            const messagesData = await MessageService.getByConversationId(conversationId);
            res.status(200).json(messagesData);
        } catch (error) {
            next(error);
        }
    }

    async post(req, res, next) {
        try {
            const message = req.body;
            if (!message) {
                throw ApiError.BadRequest("Message is required");
            }
            const messageData = await MessageService.add(message);
            res.status(200).json(messageData);
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();
