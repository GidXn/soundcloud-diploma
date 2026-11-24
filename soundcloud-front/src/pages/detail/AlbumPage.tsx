import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IAlbum } from "../../types/album";
import { ITrack } from "../../types/track";
import { albumService } from "../../services/albumAPI";
import { trackService } from "../../services/trackApi";
import { mediaUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import {
    ArtistsCarousel, Carousel, DetailBanner, DetailHero, MediaCard, MetaLine, TrackTable,
    copyPageLink, totalDuration, useListen, yearOf,
} from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/detail/layout.css";

interface CollectionPageProps {
    kind: "album" | "chart";
}

/* Album page (Figma: «Album when you click») and chart page (Figma: «Charts when click»).
   A chart on the backend is a public album (same as on the Charts page), so the data is shared. */
const CollectionPage: React.FC<CollectionPageProps> = ({ kind }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [album, setAlbum] = useState<IAlbum | null>(null);
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [others, setOthers] = useState<IAlbum[]>([]);
    const [all, setAll] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const isChart = kind === "chart";
    const PAGE_SIZE = isChart ? 28 : 18; // as in the design

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setPage(1);
        window.scrollTo({ top: 0 });
        Promise.all([
            albumService.getAlbumById(id),
            albumService.getTracks(Number(id)),
        ])
            .then(([a, t]) => {
                setAlbum(a);
                setTracks((t as ITrack[]).filter((x) => !x.isHidden));
            })
            .catch((err) => {
                console.error(`Failed to load ${kind}`, err);
                setAlbum(null);
            })
            .finally(() => setLoading(false));
    }, [id, kind]);

    useEffect(() => {
        albumService.getAllAlbums().then(setOthers).catch(() => setOthers([]));
        trackService.getAll().then((t) => setAll(t.filter((x) => !x.isHidden))).catch(() => setAll([]));
    }, []);

    const { playing, listen, disabled } = useListen(tracks, album?.id ?? null);

    if (loading) return <main className="catalog_page"><div className="catalog_state">Loading…</div></main>;
    if (!album) return <main className="catalog_page"><div className="catalog_state">{isChart ? "Chart not found" : "Album not found"}</div></main>;

    const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
    const visible = tracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const otherAlbums = others.filter((a) => a.id !== album.id);

    return (
        <main className="catalog_page detail_page">
            <DetailHero
                cover={mediaUrl(album.coverUrl)}
                label={isChart ? "playlist" : "Album"}
                title={album.title}
                metaLabel={isChart ? "playlists" : (album.ownerName || "Albums")}
                metaLabelMuted
                meta={isChart
                    ? <MetaLine items={[`tracks in the playlist: ${tracks.length}`]} />
                    : <MetaLine items={[yearOf(album.createdAt), totalDuration(tracks)]} />}
                playing={playing}
                disabled={disabled}
                onListen={listen}
                onMore={copyPageLink}
                moreTitle="Copy link"
            />

            <DetailBanner variant="nrj" />

            <section className="detail_section">
                <h2 className="detail_section_title">{isChart ? "Tracks in the playlist" : "Tracks in the album"}</h2>
                <div>
                    {tracks.length === 0
                        ? <div className="detail_empty">No tracks yet</div>
                        : <TrackTable tracks={visible} playlist={tracks} albumId={album.id} />}
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            </section>

            {!isChart && otherAlbums.length > 0 && (
                <Carousel title="Albums" variant="cards">
                    {otherAlbums.map((a) => (
                        <MediaCard
                            key={a.id}
                            cover={mediaUrl(a.coverUrl)}
                            title={a.title}
                            meta={[yearOf(a.createdAt), a.ownerName]}
                            onClick={() => navigate(`/album/${a.id}`)}
                        />
                    ))}
                </Carousel>
            )}

            {!isChart && <DetailBanner variant="xit" />}
            {!isChart && <ArtistsCarousel tracks={all} />}
        </main>
    );
};

export const AlbumPage: React.FC = () => <CollectionPage kind="album" />;
export const ChartPage: React.FC = () => <CollectionPage kind="chart" />;

export default AlbumPage;
