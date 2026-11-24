import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IAlbum } from "../../types/album";
import { albumService } from "../../services/albumAPI";
import { mediaUrl } from "../../components/catalog/catalogUtils";
import Pagination from "../../components/catalog/Pagination";
import "../../styles/main_pages/catalog/layout.css";

const PAGE_SIZE = 28; // 7 рядів по 4, як у макеті

// Чарти = публічні альбоми (окремої сутності «чарт» на бекенді немає)
const ChartsPage: React.FC = () => {
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        albumService.getAllAlbums()
            .then(setAlbums)
            .catch((err) => console.error("Failed to load charts", err))
            .finally(() => setLoading(false));
    }, []);

    const openChart = (album: IAlbum) => navigate(`/chart/${album.id}`);

    const totalPages = Math.max(1, Math.ceil(albums.length / PAGE_SIZE));
    const visible = albums.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Charts</h1>

            {loading && <div className="catalog_state">Завантаження…</div>}
            {!loading && albums.length === 0 && <div className="catalog_state">Чартів поки немає</div>}

            <div className="charts_grid">
                {visible.map((album) => {
                    const cover = mediaUrl(album.coverUrl);
                    return (
                        <button key={album.id} className="chart_card" onClick={() => openChart(album)} title={album.title}>
                            <span className="chart_card_bg" style={{ backgroundImage: `url('${cover}')` }} />
                            <span className="chart_case">
                                <span className="chart_disc" style={{ backgroundImage: `url('${cover}')` }}>
                                    <span className="chart_disc_hole" />
                                </span>
                            </span>
                            <span className="chart_title">{album.title}</span>
                        </button>
                    );
                })}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default ChartsPage;
