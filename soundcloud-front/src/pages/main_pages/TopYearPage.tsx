import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { usePlayerStore } from "../../store/player_store";
import { formatDuration, trackImageUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import { HeartIcon } from "../../components/people/peopleUtils";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/people/layout.css";

const PAGE_SIZE = 30;

// «Top 2026» (and other years from the full menu): tracks uploaded this year,
// most popular first. If the backend doesn't return createdAt, show all tracks.
const TopYearPage: React.FC = () => {
    const { year: yearParam } = useParams();
    const year = Number(yearParam) || new Date().getFullYear();
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [liked, setLiked] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const current = usePlayerStore((s) => s.track);

    useEffect(() => {
        setLoading(true);
        setPage(1);
        trackService.getAll()
            .then((t) => {
                const visible = t.filter((x) => !x.isHidden);
                setTracks(visible);
                setLiked(new Set(visible.filter((x) => x.isLikedByCurrentUser).map((x) => x.id)));
            })
            .catch((err) => console.error("Failed to load top of year", err))
            .finally(() => setLoading(false));
    }, [year]);

    const top = useMemo(() => {
        const hasDates = tracks.some((t) => t.createdAt);
        const ofYear = hasDates
            ? tracks.filter((t) => t.createdAt && new Date(t.createdAt).getFullYear() === year)
            : tracks;
        return [...ofYear].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }, [tracks, year]);

    const totalPages = Math.max(1, Math.ceil(top.length / PAGE_SIZE));
    const visible = top.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

    return (
        <main className="catalog_page people_page">
            <h1 className="catalog_title people_title">{year}</h1>

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && top.length === 0 && <div className="catalog_state">No tracks for {year} yet</div>}

            <ol className="year_list">
                {visible.map((track) => (
                    <li
                        key={track.id}
                        className={`year_row ${current?.id === track.id ? "active" : ""}`}
                        onClick={() => playTrack(track, top)}
                    >
                        <img className="year_cover" src={trackImageUrl(track)} alt="" />
                        <div className="year_info">
                            <span className="year_title">{track.title}</span>
                            <span className="year_author">{track.author}</span>
                            <span className="year_genre">{track.genre}</span>
                            <button
                                className="year_like"
                                onClick={(e) => toggleLike(e, track)}
                                aria-label={liked.has(track.id) ? "Remove like" : "Like"}
                            >
                                <HeartIcon size={24} color={liked.has(track.id) ? "#9E7FCF" : "#FFF"} filled={liked.has(track.id)} />
                            </button>
                            <span className="year_duration">{formatDuration(track.duration)}</span>
                        </div>
                    </li>
                ))}
            </ol>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default TopYearPage;
