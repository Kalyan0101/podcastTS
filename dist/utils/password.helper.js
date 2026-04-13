import bcrypt from "bcrypt";
export async function hashPassword(pass) {
    try {
        if (!pass)
            throw new Error("password can not be empty!!!");
        const saltRound = Number(process.env.BCRYPT_SALT_ROUND);
        if (isNaN(saltRound))
            throw new Error("BCRYPT_SALT_ROUND must be number!!!");
        return await bcrypt.hash(pass, saltRound);
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
export async function comparePassword(password, hashPassword) {
    try {
        return await bcrypt.compare(password, hashPassword);
    }
    catch (error) {
        throw error;
    }
}
