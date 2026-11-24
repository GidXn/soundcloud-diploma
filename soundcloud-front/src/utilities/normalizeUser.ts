import { jwtParse } from "./jwtParse";
import {IUser} from "../types/user.ts"

export const normalizeUser = (token: string): IUser | null => {
    const payload = jwtParse(token);
    if (!payload) return null;
    const roleClaim = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User";

    return {
        // in the backend JWT the id is in the "nameid" claim (there is no "id" field)
        id: Number(payload.id ?? payload.nameid ?? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
        username: payload.unique_name || payload.username || "",
        email: payload.email,
        role: roleClaim,
        avatar: payload.avatarUrl || '', //new
        banner: payload.bannerUrl || '',//new
        createdAt: payload.createdAt,//new
        bio: payload.bio || '',//new
        totalPlays: payload.totalPlays || 0,//new
        isLocalPasswordSet: payload.isLocalPasswordSet || false//new
    };
};