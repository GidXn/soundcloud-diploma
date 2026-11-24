export interface IUserFollow {
    id: number;
    username: string;
    avatarUrl?: string;
    followersCount?: number;
    isFollowing: boolean;
}
