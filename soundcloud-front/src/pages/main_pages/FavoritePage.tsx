import React, { useEffect, useState } from "react";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { usePlayerStore } from "../../store/player_store";
import { formatDuration, trackImageUrl } from "../../components/catalog/catalogUtils";
import RadioBanner, { XitLogo } from "../../components/catalog/RadioBanner";
import { HeartIcon, MusicIcon } from "../../components/people/peopleUtils";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/people/layout.css";

// Favorite: liked tracks of the current user.
// Empty state as in the design; the list is styled like the rows of Top 100 / Top 2026.
const FavoritePage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const current = usePlayerStore((s) => s.track);

    useEffect(() => {
        trackService.getLikedTracks()
            .then(setTracks)
            .catch((err) => console.error("Failed to load favorites", err))
            .finally(() => setLoading(false));
    }, []);

    const unlike = async (e: React.MouseEvent, track: ITrack) => {
        e.stopPropagation();
        try {
            await trackService.unlike(track.id);
            setTracks((prev) => prev.filter((t) => t.id !== track.id));
            window.dispatchEvent(new Event("favorites-changed"));
        } catch (err) {
            console.error("Failed to unlike", err);
        }
    };

    return (
        <main className="catalog_page people_page">
            <h1 className="catalog_title people_title">Favorite</h1>

            <RadioBanner title="XIT FM" subtitle="Good vibes only" logo={<XitLogo />} />

            {loading && <div className="catalog_state">Loading…</div>}

            {!loading && tracks.length === 0 && (
                <div className="favorite_empty">
                    <MusicIcon />
                    <span>You haven’t added anything yet</span>
                </div>
            )}

            {tracks.length > 0 && (
                <ol className="top_list">
                    {tracks.map((track) => (
                        <li
                            key={track.id}
                            className={`top_row ${current?.id === track.id ? "active" : ""}`}
                            onClick={() => playTrack(track, tracks)}
                        >
                            <img className="top_cover" src={trackImageUrl(track)} alt="" />
                            <span className="top_title">{track.title}</span>
                            <span className="top_author">{track.author}</span>
                            <span className="top_genre">{track.genre}</span>
                            <button className="top_like" onClick={(e) => unlike(e, track)} aria-label="Remove from Favorite">
                                <HeartIcon size={22} color="#9E7FCF" filled />
                            </button>
                            <span className="top_duration">{formatDuration(track.duration)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </main>
    );
};

export default FavoritePage;
