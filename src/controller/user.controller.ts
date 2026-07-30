import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js"
import { prisma } from "../config/prisma.js";
import { userUpdate_payload } from "./helper.js";

export const currentUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) throw new ApiError(401, "Unauthorised!!!");

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) throw new ApiError(401, "user data not found!!!");


        return res.status(200).json(new ApiResponse(200, user, "user data retrived succesfully"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const getAllUser = asyncHandler(async (req, res) => {
    try {
        const allUser = await prisma.user.findMany();
        if (!allUser) throw new ApiError(404, "No user found");

        return res.status(200).json(new ApiResponse(200, allUser, "All users fetched successfully"));
    } catch (error) {
        catchResponse(error, res);
    }
});

export const updateUserDetails = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { name }: userUpdate_payload = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                name: name?.trim()
            }
        });
        console.log("user", user);

        if(!user) new ApiError(501, "user record is not update!!!");

        return res.status(200).json(new ApiResponse(200, user, "record updated"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});