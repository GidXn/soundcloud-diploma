import { jwtParse } from "./jwtParse";
import { IUser } from "../types/user";

export const normalizeUser = (token: string): IUser | null => {
    const payload = jwtParse(token);
    if (!payload) return null;

    // JWT claims can be in different formats depending on the token handler
    const nameIdentifier = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] 
        || payload["nameid"] 
        || payload["sub"]
        || payload.id;
    
    const name = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
        || payload["unique_name"]
        || payload["name"]
        || payload.username
        || "";
    
    const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
        || payload["email"]
        || "";
    
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        || payload["role"]
        || "User";

    return {
        id: nameIdentifier?.toString() || "",
        username: name,
        email: email,
        role: role,
        avatar: payload.avatarUrl || '',
        banner: payload.bannerUrl || '',
        createdAt: payload.createdAt,
        bio: payload.bio || '',
        totalPlays: payload.totalPlays || 0,
        isLocalPasswordSet: payload.isLocalPasswordSet || false
    };
};
