export default class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthenticatedError() {
        return new ApiError(401, "User is not authenticated");
    }

    static UnauthorizedError() {
        return new ApiError(403, "User does not have rights to access");
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
}
