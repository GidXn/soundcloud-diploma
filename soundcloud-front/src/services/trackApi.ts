import { ITrack } from "../types/track";
import api from "../utilities/axiosInstance";




export const trackService = {

    async getAll(): Promise<ITrack[]> {
        try {
            const res = await api.get("/Track/all");
            return res.data;
        } catch (error) {
            console.error("Failed to fetch tracks", error);
            throw error;
        }
    },

    // Get the current user's tracks
    async getMyTracks(): Promise<ITrack[]> {
        try {
            const res = await api.get(`/Track/my`)
            return res.data;
        } catch (error) {
            console.error("Failed to fetch user tracks", error);
            throw error;
        }
    },
    getMyTracksCount: async (): Promise<number> => {
        try {
            const tracks: ITrack[] = await trackService.getMyTracks();
            return tracks.length;
        } catch (err) {
            console.error("Failed to fetch user's tracks count:", err);
            return 0;
        }
    },
    // Get all tracks of a specific user
    getAllByUser: async (userId: number): Promise<ITrack[]> => {
        const res = await api.get<ITrack[]>(`/track/user/${userId}`);
        return res.data;
    },



    // Create a new track (all fields are required)
    async createTrack(
        title: string,
        albumId: number | null | undefined,
        file: File,
        cover: File,
        genreId: number
    ) {
        // Check all required fields
        if (!title || !file || !cover || genreId === undefined) {
            throw new Error("Missing required fields for track creation");
        }

        try {
            const formData = new FormData();

            formData.append("Title", title);
            const albumIds = albumId != null ? [albumId] : [];
            albumIds.forEach(id => formData.append("AlbumIds", id.toString()));
            formData.append("File", file);
            formData.append("Cover", cover);
            formData.append("GenreId", genreId.toString());


            const res = await api.post("/Track/create-file", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return res.data;
        } catch (error) {
            console.error("Failed to create track", error);
            throw error;
        }
    },
    updateTrack: async (id: number, formData: FormData): Promise<ITrack> => {
        const { data } = await api.put(`/Track/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },

        });
        return data;
    },

    async like(trackId: number) {
        return api.post(`/Track/${trackId}/like`); // api takes the current token on every request
    },
    async unlike(trackId: number) {
        return api.delete(`/Track/${trackId}/like`);
    },
    deleteTrack: async (id: number): Promise<void> => {
        try {
            await api.delete(`/Track/${id}`);
        } catch (error) {
            console.error(`Failed to delete track with id ${id}`, error);
            throw error;
        }
    },
    async getLikedTracks(): Promise<ITrack[]> {
        try {
            const res = await api.get("/Track/liked"); // exactly as in Swagger
            return res.data;
        } catch (error) {
            console.error("Failed to fetch liked tracks", error);
            throw error;
        }
    },

};
