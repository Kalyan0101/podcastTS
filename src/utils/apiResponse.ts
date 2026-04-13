import { Response } from "express";

export class ApiResponse<T> {
    constructor(
        public statusCode: number,
        public data: T,
        public message = "success",
        public success?: boolean
    ) {
        this.success = statusCode < 400
    }
}

export class ApiError extends Error {
    public success = false;
    constructor(
        public statusCode: number,
        public message = "Something went wrong!!!",
        public data: unknown = null,
        public errors: unknown[] = [],
        stack?: string
    ) {
        super(message);

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export const catchResponse = (error: unknown, res: Response) => {
    if(error instanceof ApiError) return res.status(error.statusCode).json(error);
    if(error instanceof Error) return res.status(500).json(new ApiError(500, error.message));
    return res.status(500).json(new ApiError(500, "Something went wrong!!!"));
};