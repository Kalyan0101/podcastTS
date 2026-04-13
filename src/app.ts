import cors from "cors";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

import Api from "./routes/index.route.js";
import { ApiError } from "./utils/apiResponse.js";

// routes
app.use("/api", Api);

app.get("/test", (_, res) => res.send("test"));

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            message: err.message,
            data: err.data,
            errors: err.errors,
            stack: err.stack,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json(new ApiError(500, err.message));
    }
    return res.status(500).json(new ApiError(500, "something went wrong!!!", null, [err]));
});

export default app;
