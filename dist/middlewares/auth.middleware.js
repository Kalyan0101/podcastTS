import { prisma } from "../config/prisma.js";
import { ApiError, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const jwtToken = req.headers.authorization?.replace("Bearer ", "") || req.cookies.accessToken;
        if (!jwtToken)
            throw new ApiError(401, "Unauthorized!!!");
        const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET_ACCESS);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id }
        });
        if (!user)
            throw new ApiError(401, "Invalid Access Token!!!");
        req.user = user;
        next();
    }
    catch (error) {
        catchResponse(error, res);
    }
});
