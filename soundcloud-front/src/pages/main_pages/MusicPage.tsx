import React, { useEffect, useMemo, useState } from "react";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi.ts";
import Pagination from "../../components/catalog/Pagination";
import { DetailBanner, TrackTable } from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/music_page/layout.css";

const PAGE_SIZE = 36; // rows per page

/* Music, Figma «Music» (2270:6938): title, XIT FM banner, track list, pagination. */
const MusicPage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data.filter((t) => !t.isHidden)))
            .catch((err) => console.error("Failed to load tracks", err))
            .finally(() => setLoading(false));
    }, []);

    // Shuffled once per visit (the page was a random selection before), stable while paging
    const shuffled = useMemo(() => [...tracks].sort(() => Math.random() - 0.5), [tracks]);
    const totalPages = Math.max(1, Math.ceil(shuffled.length / PAGE_SIZE));
    const visible = shuffled.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page detail_page music_page">
            <div className="music_head">
                <h1 className="catalog_title">Music</h1>
                <DetailBanner variant="xit" />
            </div>

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && tracks.length === 0 && <div className="catalog_state">No tracks yet</div>}
            {visible.length > 0 && <TrackTable tracks={visible} playlist={shuffled} />}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default MusicPage;
