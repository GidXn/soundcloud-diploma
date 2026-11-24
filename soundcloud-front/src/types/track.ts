export interface ITrack {
    id: number;
    title: string;
    author: string;
    playCount: number;
    createdAt?: string; // ISO, upload date
    genre: string;
    duration: string;
    isHidden: boolean;
    albumId?: number;
    url: string;
    imageUrl?: string;

    // new field
    isLikedByCurrentUser?: boolean;  // optional, because it can be undefined
}
