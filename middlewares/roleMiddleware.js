import ApiError from "../exceptions/ApiError.js";
import TokenService from "../services/TokenService.js";

export const roleMiddleware = (roles) => {
    return (req, _, next) => {
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

        const isAllowedRole = userData.roles.some((role) => roles.includes(role));
        if (!isAllowedRole) {
            throw ApiError.UnauthorizedError();
        }

        req.user = userData;
        next();
    };
};
