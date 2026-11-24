import React, { useEffect, useState } from "react";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";

// Лайки для списків треків (Home, Music): стан + перемикання з оновленням лічильника Favorite
export const useTrackLikes = (tracks: ITrack[]) => {
    const [liked, setLiked] = useState<Set<number>>(new Set());

    useEffect(() => {
        setLiked(new Set(tracks.filter((t) => t.isLikedByCurrentUser).map((t) => t.id)));
    }, [tracks]);

    const toggleLike = async (e: React.MouseEvent, track: ITrack) => {
        e.stopPropagation();
        const isLiked = liked.has(track.id);
        try {
            if (isLiked) await trackService.unlike(track.id);
            else await trackService.like(track.id);
            setLiked((prev) => {
                const next = new Set(prev);
                if (isLiked) next.delete(track.id);
                else next.add(track.id);
                return next;
            });
            window.dispatchEvent(new Event("favorites-changed"));
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    return { liked, toggleLike };
};
