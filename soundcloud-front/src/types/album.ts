import { ITrack } from "./track";

export interface IAlbum {
    id: number;
    title: string;
    description?: string;
    createdAt?: string; // or Date, if you parse it
    updatedAt: string;
    ownerId?: number;
    ownerName?: string;
    coverUrl?: string;
    isPublic?: boolean;
    tracks?: ITrack[]; // array of tracks, if loaded together with the album
}
