import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { DetailBanner, TrackTable } from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/detail/layout.css";

/* Сторінка жанру (Figma: «Genre when you click»): назва жанру, банер XIT FM, список треків. */
const GenrePage: React.FC = () => {
    const { name = "" } = useParams<{ name: string }>();
    const [all, setAll] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        trackService.getAll()
            .then((t) => setAll(t.filter((x) => !x.isHidden)))
            .catch((err) => console.error("Failed to load genre", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { window.scrollTo({ top: 0 }); }, [name]);

    const tracks = useMemo(
        () => all
            .filter((t) => (t.genre || "").toLowerCase() === name.toLowerCase())
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0)),
        [all, name]
    );

    // Назва як у даних (регістр), інакше як у посиланні
    const title = tracks[0]?.genre || name;

    return (
        <main className="catalog_page detail_page">
            <div className="detail_genre_head">
                <h1 className="detail_section_title">{title}</h1>
                <DetailBanner variant="xit" />
            </div>

            {loading && <div className="catalog_state">Завантаження…</div>}
            {!loading && tracks.length === 0 && <div className="detail_empty">У цьому жанрі поки немає треків</div>}
            {tracks.length > 0 && <TrackTable tracks={tracks} />}
        </main>
    );
};

export default GenrePage;
