import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IGenre } from "../../types/genre";
import { ITrack } from "../../types/track";
import { genreService } from "../../services/genreApi";
import { trackService } from "../../services/trackApi";
import { genreLink } from "../../components/detail/DetailParts";
import { groupTracks, trackImageUrl } from "../../components/catalog/catalogUtils";
import "../../styles/main_pages/catalog/layout.css";

const PlayIcon: React.FC = () => (
    <svg className="genre_tile_play" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 7.27C16.33 8.04 16.33 9.96 15 10.73L3 17.66C1.67 18.43 0 17.47 0 15.93V2.07C0 0.53 1.67 -0.43 3 0.34L15 7.27Z" fill="#FFF" />
    </svg>
);

const GenresPage: React.FC = () => {
    const [genres, setGenres] = useState<IGenre[]>([]);
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([genreService.getGenres(), trackService.getAll()])
            .then(([g, t]) => {
                setGenres(g);
                setTracks(t.filter((x) => !x.isHidden));
            })
            .catch((err) => console.error("Failed to load genres", err))
            .finally(() => setLoading(false));
    }, []);

    const tracksByGenre = useMemo(
        () => groupTracks(tracks, (t) => t.genre?.toLowerCase()),
        [tracks]
    );

    const playGenre = (genre: IGenre) => navigate(genreLink(genre.name));

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Mood and genres</h1>

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && genres.length === 0 && <div className="catalog_state">No genres yet</div>}

            <div className="genres_grid">
                {genres.map((genre) => {
                    const list = tracksByGenre.get(genre.name.toLowerCase()) || [];
                    const cover = list.find((t) => t.imageUrl);
                    return (
                        <button
                            key={genre.id}
                            className={`genre_tile ${list.length === 0 ? "empty" : ""}`}
                            onClick={() => playGenre(genre)}
                            title={list.length ? `${genre.name}: ${list.length} tracks` : `${genre.name}: no tracks`}
                        >
                            {cover && <img className="genre_tile_bg" src={trackImageUrl(cover)} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />}
                            <span className="genre_tile_name">{genre.name}</span>
                            <PlayIcon />
                        </button>
                    );
                })}
            </div>
        </main>
    );
};

export default GenresPage;
