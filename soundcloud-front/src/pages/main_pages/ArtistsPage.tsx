import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { buildArtists, CatalogArtist } from "../../components/catalog/catalogUtils";
import { artistLink } from "../../components/detail/DetailParts";
import Pagination from "../../components/catalog/Pagination";
import RadioBanner, { NrjLogo } from "../../components/catalog/RadioBanner";
import "../../styles/main_pages/catalog/layout.css";

const PAGE_SIZE = 42; // 7 rows of 6, as in the design

const ArtistsPage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        trackService.getAll()
            .then((t) => setTracks(t.filter((x) => !x.isHidden)))
            .catch((err) => console.error("Failed to load artists", err))
            .finally(() => setLoading(false));
    }, []);

    const artists: CatalogArtist[] = useMemo(() => buildArtists(tracks), [tracks]);

    const totalPages = Math.max(1, Math.ceil(artists.length / PAGE_SIZE));
    const visible = artists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Artists</h1>

            <RadioBanner variant="nrj" title="NRJ FM" subtitle="Good vibes only" logo={<NrjLogo />} />

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && artists.length === 0 && <div className="catalog_state">No artists yet</div>}

            <div className="artists_grid">
                {visible.map((artist) => (
                    <button
                        key={artist.name}
                        className="artist_card"
                        onClick={() => navigate(artistLink(artist.name))}
                        title={`${artist.name}: ${artist.tracks.length} tracks`}
                    >
                        <img
                            className="artist_photo"
                            src={artist.photo}
                            alt={artist.name}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/user.png"; }}
                        />
                        <span className="artist_name">{artist.name}</span>
                    </button>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default ArtistsPage;
