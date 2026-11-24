import React, { useState } from "react";
import Pagination from "../../components/catalog/Pagination";
import RadioBanner, { XitLogo } from "../../components/catalog/RadioBanner";
import { STATIONS } from "../../components/catalog/radioStations";
import RadioTile from "../../components/catalog/RadioTile";
import "../../styles/main_pages/catalog/layout.css";

const PAGE_SIZE = 36; // 4 rows of 9, as in the design


const RadioPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string | null>(null);

    const totalPages = Math.ceil(STATIONS.length / PAGE_SIZE);
    const visible = STATIONS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="catalog_page">
            <h1 className="catalog_title">Radio</h1>

            <RadioBanner title="XIT FM" subtitle="Good vibes only" logo={<XitLogo />} />

            <div className="radio_grid">
                {visible.map((s) => (
                    <RadioTile key={s.id} station={s} active={selected === s.id} onClick={() => setSelected(s.id)} />
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default RadioPage;
