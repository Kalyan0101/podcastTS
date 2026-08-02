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
export type channelUpdate_payload = {
    id: number;
    name?: String;
    desc?: String;
    coverImage_url?: String;
}

export type episodCreate_payload = {
    name: String;
    desc?: String;
    audio_url: String;
    channelId: number;
    duration: String
};

export type episodUpdate_payload = {
    id: number;
    name?: String;
    desc?: String;
    audio_url?: String;
    duration?: String
};

export type makeSubscription_payload = {
    userId: string;
    channelId: number;
};

export type addComment_payload = {
    userId: string;
    episodeId: number;
    comment: string;
};

export type addLike_payload = {
    userId: string;
    episodeId: number;
};

export type episodeSave_payload = {
    userId: string;
    episodeId: number;
};