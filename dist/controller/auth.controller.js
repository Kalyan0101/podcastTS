import { prisma } from "../config/prisma.js";
import { UserType } from "../generated/prisma/enums.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { comparePassword, hashPassword } from "../utils/password.helper.js";
import jwt from "jsonwebtoken";
export const login = asyncHandler(async (req, res) => {
    try {
        const { email = "", password = "" } = req.body;
        if (!email || !password)
            throw new ApiError(400, "Required fields are missing!!!");
        const user = await prisma.user.findUnique({
            where: { email: email.trim() }
        });
        if (!user)
            throw new ApiError(404, "User not found!!!");
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid)
            throw new ApiError(401, "Wrong Password!!!");
        const accessToken = jwt.sign({ id: user.id }, String(process.env.JWT_SECRET_ACCESS), { expiresIn: process.env.JWT_EXPIRE_ACCESS });
        const refreshToken = jwt.sign({ id: user.id }, String(process.env.JWT_SECRET_REFRESH), { expiresIn: process.env.JWT_EXPIRE_REFRESH });
        await prisma.user.update({
            where: { id: user.id },
            data: { accessToken: accessToken, refreshToken: refreshToken }
        });
        return res.status(200).json(new ApiResponse(200, { user, accessToken }, "Login Successfull"));
    }
    catch (error) {
        catchResponse(error, res);
    }
});
export const register = asyncHandler(async (req, res) => {
    try {
        const { name = "", email = "", userType = UserType.USER, password = "" } = req.body;
        if ([name, email, password].some((i) => i.trim() === ""))
            throw new ApiError(400, "Required fields are missing!!!");
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });
        if (user)
            throw new ApiError(409, "User record already exists!!!");
        const hashPass = await hashPassword(password);
        const isCreated = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                password: hashPass,
                userType
            },
        });
        if (!isCreated)
            return res.status(500).json(new ApiError(500, "Record creation failed!!!"));
        return res.status(200).json(new ApiResponse(200, isCreated, "Register Successfully"));
    }
    catch (error) {
        catchResponse(error, res);
    }
});
