export interface IUser {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    banner?: string;
    createdAt?: string;
    bio?: string;
    totalPlays?: number;
    isLocalPasswordSet?: boolean;
}
