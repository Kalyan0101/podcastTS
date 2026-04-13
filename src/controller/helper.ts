import { UserType } from "../generated/prisma/enums.js";


 /** cookies options */
export const cookiesOptions = {
    httpOnly: true,
    secure: true,
}


/** Auth Controller */
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