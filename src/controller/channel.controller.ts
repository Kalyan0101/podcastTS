import { prisma } from "../config/prisma.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { channelCreate_payload, channelUpdate_payload } from "./helper.js";

export const getChannel = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user;

        /** Query params always arrive as strings — coerce and clamp them */
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const channelId = Number(req.query?.channelId);

        const where = {
            ownerId: userId,
            ...(channelId && { id: channelId })
        };

        const [channels, total] = await prisma.$transaction([
            prisma.channel.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.channel.count({ where })
        ]);

        return res.status(200).json(new ApiResponse(200, {
            channels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + channels.length < total,
                hasPrev: page > 1
            }
        }, "Channels fetched successfully"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const createChannel = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { name, coverImage_url, desc }: channelCreate_payload = req.body;

        if (!name) throw new ApiError(400, "Name must required!!!");

        const channel = await prisma.channel.create({
            data: {
                ownerId: userId,
                name: name.trim(),
                coverImage_url: coverImage_url?.trim(),
                desc: desc?.trim()
            }
        });
        if (!channel) throw new ApiError(501, "channel creation failed!!!");

        return res.status(201).json(new ApiResponse(201, channel, "created successfully"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const updateChannelDetails = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { id, name, coverImage_url, desc }: channelUpdate_payload = req.body;

        if (!id) throw new ApiError(400, "Channel id must required!!!");

        const channel = await prisma.channel.update({
            where: {
                id,
                ownerId: userId
            },
            data: {
                name: name?.trim(),
                coverImage_url: coverImage_url?.trim(),
                desc: desc?.trim()
            }
        });
        if (!channel) throw new ApiError(501, "channel creation failed!!!");

        return res.status(201).json(new ApiResponse(201, channel, "created successfully"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const deleteChannel = asyncHandler(async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!id) throw new ApiError(400, "Channel id must required!!!");

        const channel = await prisma.channel.delete({
            where: { id }
        });
        if (!channel) throw new ApiError(501, "deletion failed!!!");

        return res.status(201).json(new ApiResponse(201, channel, "record deleted"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});