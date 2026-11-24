import React, { useEffect, useMemo, useState } from "react";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { usePlayerStore } from "../../store/player_store";
import { formatDuration, trackImageUrl } from "../../components/catalog/catalogUtils";
import RadioBanner, { XitLogo } from "../../components/catalog/RadioBanner";
import "../../styles/main_pages/catalog/layout.css";

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <svg width="22" height="20" viewBox="0 0 22 20" fill={filled ? "#9E7FCF" : "none"} xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6.5 1C3.4625 1 1 3.4625 1 6.5C1 12 7.5 17 11 18.163C14.5 17 21 12 21 6.5C21 3.4625 18.5375 1 15.5 1C13.64 1 11.995 1.9235 11 3.337C10.4928 2.61469 9.81897 2.0252 9.03568 1.61841C8.25238 1.21162 7.38263 0.999502 6.5 1Z"
            stroke="#9E7FCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

// Топ 100 = 100 треків з найбільшою кількістю прослуховувань
const Top100Page: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [liked, setLiked] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const current = usePlayerStore((s) => s.track);

    useEffect(() => {
        trackService.getAll()
            .then((t) => {
                setTracks(t.filter((x) => !x.isHidden));
                setLiked(new Set(t.filter((x) => x.isLikedByCurrentUser).map((x) => x.id)));
            })
            .catch((err) => console.error("Failed to load top 100", err))
            .finally(() => setLoading(false));
    }, []);

    const top = useMemo(
        () => [...tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 100),
        [tracks]
    );

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
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Top 100 of the Month</h1>

            <RadioBanner title="XIT FM" subtitle="Good vibes only" logo={<XitLogo />} />

            {loading && <div className="catalog_state">Завантаження…</div>}
            {!loading && top.length === 0 && <div className="catalog_state">Треків поки немає</div>}

            <ol className="top_list">
                {top.map((track) => (
                    <li
                        key={track.id}
                        className={`top_row ${current?.id === track.id ? "active" : ""}`}
                        onClick={() => playTrack(track, top)}
                    >
                        <img className="top_cover" src={trackImageUrl(track)} alt="" />
                        <span className="top_title">{track.title}</span>
                        <span className="top_author">{track.author}</span>
                        <span className="top_genre">{track.genre}</span>
                        <button
                            className="top_like"
                            onClick={(e) => toggleLike(e, track)}
                            aria-label={liked.has(track.id) ? "Прибрати лайк" : "Лайк"}
                        >
                            <HeartIcon filled={liked.has(track.id)} />
                        </button>
                        <span className="top_duration">{formatDuration(track.duration)}</span>
                    </li>
                ))}
            </ol>
        </main>
    );
};

export default Top100Page;
