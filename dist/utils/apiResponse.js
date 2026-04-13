export class ApiResponse {
    statusCode;
    data;
    message;
    success;
    constructor(statusCode, data, message = "success", success) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
        this.success = statusCode < 400;
    }
}
export class ApiError extends Error {
    statusCode;
    message;
    data;
    errors;
    success = false;
    constructor(statusCode, message = "Something went wrong!!!", data = null, errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
export const catchResponse = (error, res) => {
    if (error instanceof ApiError)
        return res.status(error.statusCode).json(error);
    if (error instanceof Error)
        return res.status(500).json(new ApiError(500, error.message));
    return res.status(500).json(new ApiError(500, "Something went wrong!!!"));
};
