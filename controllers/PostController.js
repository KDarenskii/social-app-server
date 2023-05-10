import ApiError from "../exceptions/ApiError.js";
import PostService from "../services/PostService.js";

class PostController {
    async get(req, res, next) {
        try {
            const { page, limit, userId } = req.query;
            const postsData = await PostService.get(parseInt(page), parseInt(limit), userId);
            res.status(200).json(postsData);
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
            const postsData = await PostService.getByUserId(userId);
            res.status(200).json(postsData);
        } catch (error) {
            next(error);
        }
    }

    async post(req, res, next) {
        try {
            const photo = req.files?.photo ?? null;
            const body = req.body;
            if (!body) {
                throw ApiError.BadRequest("Request body is required");
            }
            const postData = await PostService.add(body, photo);
            res.status(200).json(postData);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const postData = req.body;
            if (!postData) {
                throw ApiError.BadRequest("Request body is required");
            }
            await PostService.update({ ...postData });
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw ApiError.BadRequest("Id is required");
            }
            await PostService.delete(id);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }
}

export default new PostController();
