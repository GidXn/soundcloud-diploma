import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAlbum } from "../../types/album";
import { albumService } from "../../services/albumAPI.ts";
import { mediaUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import { DetailBanner, MediaCard, yearOf } from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/albums_page/layout.css";

const PAGE_SIZE = 36; // 6 rows of 6, as in the design

/* Albums, Figma «Albums» (2270:7152): title, NRJ FM banner, 6-column grid of covers
   (231, gap 28) with «year • artist», pagination. */
const AlbumsCollectionPage: React.FC = () => {
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        albumService.getAllAlbums()
            .then(setAlbums)
            .catch((err) => console.error("Failed to load albums", err))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.max(1, Math.ceil(albums.length / PAGE_SIZE));
    const visible = albums.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page detail_page albums_page">
            <div className="albums_head">
                <h1 className="catalog_title">Albums</h1>
                <DetailBanner variant="nrj" />
            </div>

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && albums.length === 0 && <div className="catalog_state">No albums yet</div>}

            {visible.length > 0 && (
                <div className="albums_grid">
                    {visible.map((album) => (
                        <MediaCard
                            key={album.id}
                            cover={mediaUrl(album.coverUrl)}
                            title={album.title}
                            meta={[yearOf(album.createdAt), album.ownerName]}
                            onClick={() => navigate(`/album/${album.id}`)}
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default AlbumsCollectionPage;
