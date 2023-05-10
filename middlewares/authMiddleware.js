import ApiError from "../exceptions/ApiError.js";
import TokenService from "../services/TokenService.js";

export const authMiddleware = (req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw ApiError.UnauthenticatedError();
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
        throw ApiError.UnauthenticatedError();
    }

    const userData = TokenService.validateAccessToken(accessToken);
    if (!userData) {
        throw ApiError.UnauthenticatedError();
    }

    req.user = userData;
    next();
};
