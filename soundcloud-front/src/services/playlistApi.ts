import { IPlaylist } from "../types/playlist";
import api from "../utilities/axiosInstance.ts";
import { ITrack } from "../types/track"; // adjust the path to your project

// New interface for creating a playlist
export interface ICreatePlaylist {
    name: string;
    ownerId: number;
    cover?:string;
    coverUrl?: string; // added an optional field
}

export const playlistService = {
    getAll: async (): Promise<IPlaylist[]> => {
        const res = await api.get("/Playlist");
        return res.data;
    },


    create: async (dto: ICreatePlaylist | FormData): Promise<IPlaylist> => {
        const { data } = await api.post("/Playlist", dto);
        return data;
    },

    getById: async (id: number): Promise<IPlaylist> => {
        const { data } = await api.get(`/Playlist/${id}`);
        return data;
    },

    update: async (id: number, dto: { name: string; coverUrl?: string }): Promise<void> => {
        await api.put(`/Playlist/${id}`, dto);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Playlist/${id}`);
    },
    removeTrack: async (playlistId: number, trackId: number): Promise<void> => {
        try {
            await api.delete(`/Playlist/${playlistId}/tracks/${trackId}`);
        } catch (err) {
            console.error(`Failed to remove track ${trackId} from playlist ${playlistId}:`, err);
            throw err;
        }
    },
    // --- new methods for playlist tracks ---
    addTrack: async (playlistId: number, trackId: number): Promise<void> => {
        await api.post(`/Playlist/${playlistId}/tracks/${trackId}`);
    },

    // playlistApi.ts
    getTracks: async (playlistId: number): Promise<ITrack[]> => {
        const { data } = await api.get(`/Playlist/${playlistId}/tracks`);
        return data;
    },

    // Get all playlists of a specific user
    getAllByUser: async (userId: number): Promise<IPlaylist[]> => {
        const res = await api.get<IPlaylist[]>(`/playlist/user/${userId}`);
        return res.data;
    },

};
