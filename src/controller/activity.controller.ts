import { prisma } from "../config/prisma.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addComment_payload, addLike_payload, episodeSave_payload, makeSubscription_payload } from "./helper.js";

/** subscription */
export const makeSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId, userId }: makeSubscription_payload = req.body;
        if (!channelId || !userId) return res.status(401).json(new ApiError(401, "both fields are required!!!"));

        const isSubscribe = await prisma.subscription.upsert({
            where: {
                userId_channelId: {
                    channelId,
                    userId
                }
            },
            update: {},
            create: {
                userId,
                channelId
            },
        });

        if (!isSubscribe) return res.status(500).json(new ApiError(500, "Subscribe failed!!!"));
        return res.status(201).json(new ApiResponse(201, "Subscribed"));


    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const removeSubscription = asyncHandler(async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isDelete = await prisma.subscription.delete({
            where: { id }
        });

        if (!isDelete) return res.status(500).json(new ApiError(500, "Unsubscribe failed!!!"));

        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribe"));


    } catch (error: unknown) {
        catchResponse(error, res);
    }
});



/** Like */
export const addLike = asyncHandler(async (req, res) => {
    try {
        const { userId, episodeId }: addLike_payload = req.body;
        if (!episodeId || !userId) return res.status(401).json(new ApiError(401, "both fields are required!!!"));

        const isLike = await prisma.like.upsert({
            where: {
                userId_episodeId: {
                    episodeId,
                    userId
                }
            },
            update: {},
            create: {
                userId,
                episodeId
            },
        });

        if (!isLike) return res.status(500).json(new ApiError(500, "Like failed!!!", isLike));
        return res.status(201).json(new ApiResponse(201, "Like"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const removeLike = asyncHandler(async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isDelete = await prisma.like.delete({
            where: { id }
        });

        if (!isDelete) return res.status(500).json(new ApiError(500, "Like failed!!!"));

        return res.status(200).json(new ApiResponse(200, {}, "Like added"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});



/** comment */
export const addComment = asyncHandler(async (req, res) => {
    try {
        const { userId, episodeId, comment }: addComment_payload = req.body;

        if (!episodeId || !userId || !comment) return res.status(401).json(new ApiError(401, "Requir fields are required!!!"));

        const isSubscribe = await prisma.comment.upsert({
            where: {
                userId_episodeId: {
                    userId,
                    episodeId
                }
            },
            update: {},
            create: {
                userId,
                episodeId,
                comment: comment.trim()
            },
        });

        if (!isSubscribe) return res.status(500).json(new ApiError(500, "Subscribe failed!!!", isSubscribe));
        return res.status(201).json(new ApiResponse(201, "Subscribed"));


    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const removeComment = asyncHandler(async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isDelete = await prisma.comment.delete({
            where: { id }
        });

        if (!isDelete) return res.status(500).json(new ApiError(500, "Comment remove failed!!!"));

        return res.status(200).json(new ApiResponse(200, {}, "Comment removed"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});



/** episode */
export const episodeSave = asyncHandler(async (req, res) => {
    try {
        const { userId, episodeId }: episodeSave_payload = req.body;
        if (!userId || !episodeId) return res.status(401).json(new ApiError(401, "both fields are required!!!"));

        const isSubscribe = await prisma.savedEpisode.upsert({
            where: {
                userId_episodeId: {
                    userId,
                    episodeId
                }
            },
            update: {},
            create: {
                userId,
                episodeId
            },
        });

        if (!isSubscribe) return res.status(500).json(new ApiError(500, "Episode save failed!!!"));
        return res.status(201).json(new ApiResponse(201, "Episode saved"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const episodeRemove = asyncHandler(async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isDelete = await prisma.episode.delete({
            where: { id }
        });

        if (!isDelete) return res.status(500).json(new ApiError(500, "Episode remove failed!!!"));

        return res.status(200).json(new ApiResponse(200, {}, "Episode remove"));

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});