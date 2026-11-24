import React, { useEffect, useMemo, useState } from "react";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { usePlayerStore } from "../../store/player_store";
import { groupTracks, trackImageUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import RadioBanner, { NrjLogo } from "../../components/catalog/RadioBanner";
import "../../styles/main_pages/catalog/layout.css";

const PAGE_SIZE = 42; // 7 рядів по 6, як у макеті

// Локальні фото артистів з /public/artists (ключ — ім'я без пробілів, у нижньому регістрі)
const LOCAL_PHOTOS: Record<string, string> = {
    drevo: "/artists/Drevo.png",
    klavdiapetrivna: "/artists/KlavdiaPetrivna.png",
    maxbarskih: "/artists/MaxBarskih.png",
    rammstein: "/artists/Rammstein.png",
    skryabin: "/artists/Skryabin.jpg",
    volkanov: "/artists/Volkanov.png",
    yaktak: "/artists/Yaktak.png",
};

interface Artist {
    name: string;
    tracks: ITrack[];
    photo: string;
    plays: number;
}

const ArtistsPage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const playTrack = usePlayerStore((s) => s.playTrack);

    useEffect(() => {
        trackService.getAll()
            .then((t) => setTracks(t.filter((x) => !x.isHidden)))
            .catch((err) => console.error("Failed to load artists", err))
            .finally(() => setLoading(false));
    }, []);

    // Артисти = унікальні автори треків, від найпопулярніших
    const artists: Artist[] = useMemo(() => {
        const list: Artist[] = [];
        groupTracks(tracks, (t) => t.author).forEach((items, name) => {
            const key = name.replace(/\s+/g, "").toLowerCase();
            const withCover = items.find((t) => t.imageUrl);
            list.push({
                name,
                tracks: items,
                photo: LOCAL_PHOTOS[key] || trackImageUrl(withCover),
                plays: items.reduce((sum, t) => sum + (t.playCount || 0), 0),
            });
        });
        return list.sort((a, b) => b.plays - a.plays);
    }, [tracks]);

    const totalPages = Math.max(1, Math.ceil(artists.length / PAGE_SIZE));
    const visible = artists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Artists</h1>

            <RadioBanner variant="nrj" title="NRJ FM" subtitle="Good vibes only" logo={<NrjLogo />} />

            {loading && <div className="catalog_state">Завантаження…</div>}
            {!loading && artists.length === 0 && <div className="catalog_state">Артистів поки немає</div>}

            <div className="artists_grid">
                {visible.map((artist) => (
                    <button
                        key={artist.name}
                        className="artist_card"
                        onClick={() => playTrack(artist.tracks[0], artist.tracks)}
                        title={`${artist.name}: ${artist.tracks.length} треків`}
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
