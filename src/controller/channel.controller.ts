import { prisma } from "../config/prisma.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { channelCreate_payload } from "./helper.js";

export const createChannel = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { name, coverImage_url, desc }: channelCreate_payload = req.body;

        if (!name) new ApiError(400, "Name must required!!!");

        const channel = await prisma.channel.create({
            data: {
                ownerId: id,
                name: name.trim(),
                coverImage_url: coverImage_url?.trim(),
                desc: desc?.trim()
            }
        });
        if (!channel) return res.status(501).json(new ApiError(501, "channel creation failed!!!"));

        return res.status(201).json(new ApiResponse(201, channel, "created successfully"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});