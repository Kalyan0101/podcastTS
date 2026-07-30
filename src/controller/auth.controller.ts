import { UserType } from "../generated/prisma/enums.js";
import { ApiError, ApiResponse, catchResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { comparePassword, hashPassword } from "../utils/password.helper.js";
import jwt from "jsonwebtoken";
import { cookiesOptions, userLogin, userRegister } from "./helper.js";
import { prisma } from "../config/prisma.js";


const generateRefreshAccessTokens = async (userId: string): Promise<{ accessToken: string, refreshToken: string }> => {
    try {
        const accessToken = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET_ACCESS as string,
            { expiresIn: process.env.JWT_EXPIRE_ACCESS as jwt.SignOptions["expiresIn"] }
        )

        const refreshToken = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET_REFRESH as string,
            { expiresIn: process.env.JWT_EXPIRE_REFRESH as jwt.SignOptions["expiresIn"] }
        );

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, "Something wrong while generating the access & refresh tokens!!!");
    }
};


// GET
export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        if(!refreshToken) throw new ApiError(401, "Unauthorized");

        const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH as string) as jwt.JwtPayload & {id: string};

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id }
        });
        if(!user) throw new ApiError(401, "Invalid Refresh Token!!!");

        if(user.refreshToken !== refreshToken) throw new ApiError(401, "Invalid Refresh Token!!!");

        const { accessToken, refreshToken: newRefreshToken } = await generateRefreshAccessTokens(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: newRefreshToken
            }
        });

        return res
        .status(200)
        .cookie("accessToken", accessToken, cookiesOptions)
        .cookie("refreshToken", newRefreshToken, cookiesOptions)
        .json(new ApiResponse(200, { accessToken }, "Access Token Refreshed Successfully"));
        
    } catch (error) {
        catchResponse(error, res);
    }
});

export const logout = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        });

        return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Logout Successfull"));

    } catch (error) {
        catchResponse(error, res);
    }
});


// POST
export const login = asyncHandler(async (req, res) => {
    try {
        const { email = "", password = "" }: userLogin = req.body;
        if(!email || !password) throw new ApiError(400, "Required fields are missing!!!");

        const user = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if(!user) throw new ApiError(404, "User not found!!!");

        const isPasswordValid = await comparePassword(password, user.password);
        if(!isPasswordValid) throw new ApiError(401, "Wrong Password!!!");

        /** Generating tokens */
        const { accessToken, refreshToken } = await generateRefreshAccessTokens(user.id);

        /** Updating user's refresh token */
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken }
        });

        /** Setting cookies */
        return res
        .status(200)
        .cookie("accessToken", accessToken, {...cookiesOptions, maxAge: 1000 * 60 * 60 * 7})           // 7 hours
        .cookie("refreshToken", refreshToken, {...cookiesOptions, maxAge: 1000 * 60 * 60 * 24 * 7})    // 7 days
        .json(new ApiResponse(200, { accessToken }, "Login Successfull"));   

    } catch (error: unknown) {
        catchResponse(error, res);
    }
});

export const register = asyncHandler(async (req, res) => {
    try {
        const { name = "", email = "", userType = UserType.USER, password = "" }: userRegister = req.body;
    
        if ([name, email, password].some((i) => i.trim() === ""))
            throw new ApiError(400, "Required fields are missing!!!");
    
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
        });
        if (user) throw new ApiError(409, "User record already exists!!!");
    
        const hashPass = await hashPassword(password);
    
        const isCreated = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                password: hashPass,
                userType
            },
        });
    
        if (!isCreated) return res.status(500).json(new ApiError(500, "Record creation failed!!!"));
    
        return res.status(200).json(new ApiResponse(200, isCreated, "Register Successfully"));

    } catch (error) {
        catchResponse(error, res);
    }
});
