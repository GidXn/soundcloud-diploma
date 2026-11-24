import React, { useState } from "react";
import Pagination from "../../components/catalog/Pagination";
import RadioBanner, { XitLogo } from "../../components/catalog/RadioBanner";
import "../../styles/main_pages/catalog/layout.css";

interface Station {
    id: string;
    name: string;
    bg: string;     // фон логотипа
    color: string;  // колір тексту
    streamUrl?: string; // посилання на потік; поки не задано
}

const PAGE_SIZE = 36; // 4 ряди по 9, як у макеті

// Станції з макету. Логотипи — текстові заглушки, поки немає файлів логотипів.
const STATIONS: Station[] = [
    { id: "tuneme", name: "FM Tuneмо", bg: "#FFF", color: "#111" },
    { id: "xit", name: "XIT FM", bg: "#E1251B", color: "#FFF" },
    { id: "lux", name: "Radio Vishnya", bg: "#FFF", color: "#C8102E" },
    { id: "kiss", name: "Kiss FM", bg: "#222", color: "#FFF" },
    { id: "djfm", name: "DJ FM", bg: "#F6D300", color: "#111" },
    { id: "nrj", name: "NRJ", bg: "#FFF", color: "#E30613" },
    { id: "shlyager", name: "101.9 Шлягер", bg: "#FFF", color: "#111" },
    { id: "roks", name: "Radio ROKS", bg: "#111", color: "#FFF" },
    { id: "ukr", name: "Українське радіо", bg: "#1E8A8A", color: "#FFF" },
    { id: "fended", name: "Fended", bg: "#111", color: "#FFF" },
    { id: "supreme", name: "Supreme Radio", bg: "#111", color: "#F28C28" },
    { id: "radio-night", name: "Radio Night", bg: "#2B2F8F", color: "#F6D300" },
    { id: "relax", name: "Relax", bg: "#2FB8C9", color: "#FFF" },
    { id: "metro", name: "Metro Radio", bg: "#1A1A1A", color: "#F28C28" },
    { id: "melodia", name: "Мелодія FM", bg: "#E5007E", color: "#FFF" },
    { id: "power", name: "104.0 Power FM", bg: "#FFF", color: "#111" },
    { id: "ua", name: "UA: Українське радіо", bg: "#8B1E2D", color: "#FFF" },
    { id: "retro", name: "Retro FM", bg: "#FFF", color: "#E5007E" },
    { id: "galychyna", name: "Галичина FM", bg: "#9B2A2A", color: "#FFF" },
    { id: "nv", name: "Радіо НВ", bg: "#1A1A1A", color: "#E1251B" },
    { id: "magic", name: "Magic Radio", bg: "#FFF", color: "#6B4A1E" },
    { id: "maximum", name: "Радіо Maximum", bg: "#C8102E", color: "#FFF" },
    { id: "sun", name: "Sun FM", bg: "#111", color: "#FFF" },
    { id: "record", name: "Record", bg: "#FFF", color: "#E1251B" },
    { id: "radio", name: "Radio", bg: "#1E88E5", color: "#FFF" },
    { id: "mb", name: "MB Radio", bg: "#2A2A4A", color: "#E1251B" },
    { id: "beat", name: "Beat", bg: "#1A0A0A", color: "#F28C28" },
    { id: "waves", name: "Waves", bg: "#111", color: "#7B61FF" },
    { id: "waver", name: "Waver", bg: "#F3EEDF", color: "#111" },
    { id: "retro-mania", name: "Retro Mania", bg: "#F3EEDF", color: "#C8102E" },
    { id: "salmon", name: "Salmon", bg: "#8A7F7A", color: "#FFF" },
    { id: "timeout", name: "Time Out", bg: "#FFF", color: "#E1251B" },
    { id: "funky", name: "Funky Junk", bg: "#FFF", color: "#111" },
    { id: "boombox", name: "Boombox", bg: "#111", color: "#F6D300" },
    { id: "lounge", name: "Lounge FM", bg: "#E1251B", color: "#FFF" },
    { id: "vinyl", name: "Vinyl", bg: "#111", color: "#FFF" },
    { id: "jazz", name: "Jazz FM", bg: "#1F2A44", color: "#F6D300" },
    { id: "rock", name: "Rock FM", bg: "#111", color: "#E1251B" },
    { id: "chill", name: "Chill Out", bg: "#3A7BD5", color: "#FFF" },
    { id: "lviv", name: "Львівська хвиля", bg: "#FFF", color: "#1E5AA8" },
    { id: "kraina", name: "Країна FM", bg: "#F6D300", color: "#1E5AA8" },
    { id: "hype", name: "Hype FM", bg: "#7B61FF", color: "#FFF" },
];

const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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
                    <button
                        key={s.id}
                        className={`radio_tile ${selected === s.id ? "active" : ""}`}
                        onClick={() => setSelected(s.id)}
                        title={s.name}
                        aria-pressed={selected === s.id}
                    >
                        <span className="radio_logo" style={{ background: s.bg, color: s.color }}>
                            <span className="radio_logo_mark">{initials(s.name)}</span>
                            <span className="radio_logo_name">{s.name}</span>
                        </span>
                    </button>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </main>
    );
};

export default RadioPage;
