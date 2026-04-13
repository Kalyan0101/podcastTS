import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { prisma } from "../config/prisma.js";
export const currentUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId)
            throw new ApiError(401, "Unauthorised!!!");
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user)
            throw new ApiError(401, "user data not found!!!");
        return res.status(200).json(new ApiResponse(200, user, "user data retrived succesfully"));
    }
    catch (error) {
        if (error instanceof ApiError)
            return res.status(error.statusCode).json(error);
        if (error instanceof Error)
            return res.status(500).json(new ApiError(500, error.message));
        return res.status(500).json(new ApiError(500));
    }
});
