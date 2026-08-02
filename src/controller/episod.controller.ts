import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js"
import { episodCreate_payload, episodUpdate_payload } from "./helper.js";
import { prisma } from "../config/prisma.js";

export const getEpisodes = asyncHandler(async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const channelId = Number(req.query.channelId);
        const episodeId = Number(req.query?.episodeId);

        const where = {
            channelId,
            ...(episodeId && { id: episodeId })
        };

        const [episodes, total] = await prisma.$transaction([
            prisma.episode.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.episode.count({ where })
        ]);

        return res.status(201).json(new ApiResponse(201, {
            episodes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + episodes.length < total,
                hasPrev: page > 1
            }
        }));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const CreateEpisode = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { name, desc, audio_url, channelId, duration }: episodCreate_payload = req.body;

        if (
            [name, audio_url, duration].some(a => !a?.trim())
        ) throw new ApiError(400, "required fields are missing!!!");

        const id = Number(channelId);
        if (!Number.isInteger(id) || id < 1) throw new ApiError(400, "valid channelId must required!!!");

        /** Channel must exist and belong to the caller, else the FK fails as an opaque 500 */
        const channel = await prisma.channel.findFirst({
            where: { id, ownerId: userId },
            select: { id: true }
        });
        if (!channel) throw new ApiError(404, "Channel not found!!!");

        const episode = await prisma.episode.create({
            data: {
                name: name.trim(),
                desc: desc?.trim(),
                audio_url: audio_url.trim(),
                duration: duration.trim(),
                publishAt: new Date(),
                channelId: channel.id
            }
        });
        if (!episode) throw new ApiError(501, "Record not created!!!");

        return res.status(201).json(new ApiResponse(201, episode, "Record created"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const updateEpisodeDetails = asyncHandler(async (req, res) => {
    try {
        const { id, name, desc, audio_url, duration }: episodUpdate_payload = req.body;

        if (!id) throw new ApiError(400, "id must required!!!");

        const episode = await prisma.episode.update({
            where: { id },
            data: {
                name: name?.trim(),
                desc: desc?.trim(),
                audio_url: audio_url?.trim(),
                duration: duration?.trim()
            }
        });
        if (!episode) throw new ApiError(501, "Record updation failed!!!");

        return res.status(201).json(new ApiResponse(201, episode, "Record update"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const deleteEpisode = asyncHandler(async (req, res) => {
    try {
        const episopdeId = Number(req.query.episopdeId);

        if (!episopdeId) throw new ApiError(400, "episopdeId must required!!!");

        const episode = await prisma.episode.delete({
            where: { id: episopdeId },
        });
        if (!episode) throw new ApiError(501, "Deletion failed!!!");

        return res.status(201).json(new ApiResponse(201, {}, "Record deleted"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});
