import { UserType } from "../generated/prisma/enums.js";


/** cookies options */
export const cookiesOptions = {
    httpOnly: true,
    secure: true,
}


/** Auth Controller types */
export type userLogin = {
    email: string;
    password: string;
}

export type userRegister = {
    name: string;
    email: string;
    userType: UserType;
    password: string;
};

export type userUpdate_payload = {
    email?: string;
    name?: string;
}

export type channelCreate_payload = {
    name: String;
    desc?: String;
    coverImage_url?: String;
}