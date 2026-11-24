import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IPlaylist } from "../../types/playlist";
import { ITrack } from "../../types/track";
import { playlistService } from "../../services/playlistApi";
import { mediaUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import { DetailBanner, DetailHero, MetaLine, TrackTable, copyPageLink, useListen } from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/detail/layout.css";

const PAGE_SIZE = 28;

/* A user's playlist. Figma has one playlist screen, «Charts when click» (label «playlist»,
   «tracks in the playlist: N», NRJ banner, «Tracks in the playlist»), so the user playlists use it too. */
const PlaylistPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<IPlaylist | null>(null);
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setPage(1);
        window.scrollTo({ top: 0 });
        Promise.all([
            playlistService.getById(Number(id)),
            // The API answers 404 for an empty playlist
            playlistService.getTracks(Number(id)).catch(() => [] as ITrack[]),
        ])
            .then(([p, t]) => {
                setPlaylist(p);
                setTracks(t.filter((x) => !x.isHidden));
            })
            .catch((err) => {
                console.error("Failed to load playlist", err);
                setPlaylist(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const { playing, listen, disabled } = useListen(tracks);

    if (loading) return <main className="catalog_page"><div className="catalog_state">Loading…</div></main>;
    if (!playlist) return <main className="catalog_page"><div className="catalog_state">Playlist not found</div></main>;

    const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
    const visible = tracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const cover = playlist.coverUrl ? mediaUrl(playlist.coverUrl) : tracks[0]?.imageUrl ? mediaUrl(tracks[0].imageUrl) : mediaUrl(null);

    return (
        <main className="catalog_page detail_page">
            <DetailHero
                cover={cover}
                label="playlist"
                title={playlist.name}
                metaLabel={playlist.ownerName || "playlists"}
                metaLabelMuted
                meta={<MetaLine items={[`tracks in the playlist: ${tracks.length}`]} />}
                playing={playing}
                disabled={disabled}
                onListen={listen}
                onMore={copyPageLink}
                moreTitle="Copy link"
            />

            <DetailBanner variant="nrj" />

            <section className="detail_section">
                <h2 className="detail_section_title">Tracks in the playlist</h2>
                <div>
                    {tracks.length === 0
                        ? <div className="detail_empty">No tracks yet</div>
                        : <TrackTable tracks={visible} playlist={tracks} />}
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            </section>
        </main>
    );
};

export default PlaylistPage;
