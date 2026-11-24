import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { buildArtists } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import {
    ArtistsCarousel, DetailBanner, DetailHero, MetaLine, TrackTable,
    compactNumber, copyPageLink, useListen,
} from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/detail/layout.css";

const PAGE_SIZE = 18; // як у макеті

/* Сторінка виконавця (Figma: «Artists when click»).
   Окремої сутності «артист» на бекенді немає: артист — це автор треків (як на сторінці Artists). */
const ArtistPage: React.FC = () => {
    const { name = "" } = useParams<{ name: string }>();
    const [all, setAll] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        trackService.getAll()
            .then((t) => setAll(t.filter((x) => !x.isHidden)))
            .catch((err) => console.error("Failed to load artist", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setPage(1);
        window.scrollTo({ top: 0 });
    }, [name]);

    const artist = useMemo(
        () => buildArtists(all).find((a) => a.name.toLowerCase() === name.toLowerCase()) || null,
        [all, name]
    );

    const tracks = useMemo(
        () => (artist ? [...artist.tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)) : []),
        [artist]
    );

    const { playing, listen, disabled } = useListen(tracks);

    if (loading) return <main className="catalog_page"><div className="catalog_state">Завантаження…</div></main>;
    if (!artist) return <main className="catalog_page"><div className="catalog_state">Виконавця не знайдено</div></main>;

    const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
    const visible = tracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page detail_page">
            <DetailHero
                cover={artist.photo}
                label="Artists"
                title={artist.name}
                metaLabel="Artists"
                metaLabelMuted
                meta={<MetaLine items={[`Plays: ${compactNumber(artist.plays)}`, `Tracks: ${tracks.length}`]} />}
                playing={playing}
                disabled={disabled}
                onListen={listen}
                onMore={copyPageLink}
                moreTitle="Скопіювати посилання"
            />

            <DetailBanner variant="nrj" />

            <section className="detail_section">
                <h2 className="detail_section_title">{artist.name} song list</h2>
                <div>
                    <TrackTable tracks={visible} playlist={tracks} />
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            </section>

            <DetailBanner variant="xit" />

            <ArtistsCarousel tracks={all} exclude={artist.name} />
        </main>
    );
};

export default ArtistPage;
