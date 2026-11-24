import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { usePlayerStore } from "../../store/player_store";
import { buildArtists, formatDuration, trackImageUrl } from "../catalog/catalogUtils";
import { NrjLogo, XitLogo } from "../catalog/RadioBanner";
import "../../styles/detail/layout.css";

/* Спільні блоки сторінок, що відкриваються по кліку: трек, альбом, виконавець, жанр, чарт.
   Розміри зняті з кадрів Figma «Click to» (1920px, контент 1528px). */

// ---------- Іконки ----------
export const BackIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11H20V13H7.825Z" fill="#000" />
    </svg>
);

const PlayIcon: React.FC = () => (
    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 7.4C19.5 8.55 19.5 11.45 17.5 12.6L4.5 19.6C2.5 20.75 0 19.3 0 17V3C0 0.7 2.5 -0.75 4.5 0.4L17.5 7.4Z" fill="#FFF" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" width="5.5" height="20" rx="2" fill="#FFF" />
        <rect x="11.5" width="5.5" height="20" rx="2" fill="#FFF" />
    </svg>
);

const DotsIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="12" r="2" fill="#FFF" />
        <circle cx="12" cy="12" r="2" fill="#FFF" />
        <circle cx="19" cy="12" r="2" fill="#FFF" />
    </svg>
);

const Dot: React.FC = () => (
    <svg className="detail_dot" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="1.5" fill="#FFF" />
    </svg>
);

const ChevronIcon: React.FC<{ dir: "left" | "right" }> = ({ dir }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={dir === "left" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"} stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
    <svg width="22" height="20" viewBox="0 0 22 20" fill={filled ? "#9E7FCF" : "none"} xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6.5 1C3.4625 1 1 3.4625 1 6.5C1 12 7.5 17 11 18.163C14.5 17 21 12 21 6.5C21 3.4625 18.5375 1 15.5 1C13.64 1 11.995 1.9235 11 3.337C10.4928 2.61469 9.81897 2.0252 9.03568 1.61841C8.25238 1.21162 7.38263 0.999502 6.5 1Z"
            stroke="#9E7FCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
    </svg>
);

// ---------- Утиліти ----------

// Рядок метаданих через крапку: «2026 • 03:35 • EJ Retro»
export const MetaLine: React.FC<{ items: (React.ReactNode | null | undefined | false)[] }> = ({ items }) => {
    const list = items.filter((x) => x !== null && x !== undefined && x !== false && x !== "");
    return (
        <div className="detail_meta_line">
            {list.map((item, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <Dot />}
                    <span>{item}</span>
                </React.Fragment>
            ))}
        </div>
    );
};

// Сумарна тривалість треків «m:ss» або «h:mm:ss»
export const totalDuration = (tracks: ITrack[]): string => {
    let sec = 0;
    for (const t of tracks) {
        const parts = (t.duration || "").split(":").map((p) => parseFloat(p) || 0);
        if (parts.length === 3) sec += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = String(sec % 60).padStart(2, "0");
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${String(m).padStart(2, "0")}:${s}`;
};

export const yearOf = (date?: string): string | null => {
    if (!date) return null;
    const y = new Date(date).getFullYear();
    return Number.isFinite(y) ? String(y) : null;
};

// 122000000 -> «122M»
export const compactNumber = (n: number): string =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

export const trackLink = (t: ITrack) => `/track/${t.id}`;
export const artistLink = (name: string) => `/artist/${encodeURIComponent(name)}`;
export const genreLink = (name: string) => `/genre/${encodeURIComponent(name)}`;

// ---------- Лайки (спільний стан для списку треків) ----------
export const useLikes = (tracks: ITrack[]) => {
    const [liked, setLiked] = useState<Set<number>>(new Set());

    useEffect(() => {
        setLiked(new Set(tracks.filter((t) => t.isLikedByCurrentUser).map((t) => t.id)));
    }, [tracks]);

    const toggle = async (track: ITrack) => {
        const isLiked = liked.has(track.id);
        try {
            if (isLiked) await trackService.unlike(track.id);
            else await trackService.like(track.id);
            setLiked((prev) => {
                const next = new Set(prev);
                if (isLiked) next.delete(track.id);
                else next.add(track.id);
                return next;
            });
        } catch (err) {
            console.error("Failed to toggle like", err);
        }
    };

    return { liked, toggle };
};

// ---------- Шапка сторінки (обкладинка + назва + Listen) ----------
interface DetailHeroProps {
    cover: string;
    coverRound?: boolean;          // трек — обкладинка з радіусом 24
    label: string;                 // «Track», «Album», «Artists», «playlist»
    title: string;
    subtitle?: React.ReactNode;    // виконавець під назвою (тільки трек)
    metaLabel?: React.ReactNode;   // перший рядок під кнопками
    metaLabelMuted?: boolean;
    meta?: React.ReactNode;        // другий рядок під кнопками
    playing: boolean;
    disabled?: boolean;
    onListen: () => void;
    onMore?: () => void;
    moreTitle?: string;
}

export const DetailHero: React.FC<DetailHeroProps> = ({
    cover, coverRound, label, title, subtitle, metaLabel, metaLabelMuted, meta,
    playing, disabled, onListen, onMore, moreTitle,
}) => {
    const navigate = useNavigate();
    return (
        <section className="detail_hero">
            <button className="detail_back" onClick={() => navigate(-1)} aria-label="Назад">
                <BackIcon />
            </button>
            <div className="detail_hero_row">
                <img
                    className={`detail_cover ${coverRound ? "round" : ""}`}
                    src={cover}
                    alt={title}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-cover.png"; }}
                />
                <div className="detail_info">
                    <div className="detail_heading">
                        <div className="detail_label">{label}</div>
                        <div className="detail_title_block">
                            <h1 className="detail_title">{title}</h1>
                            {subtitle && <div className="detail_subtitle">{subtitle}</div>}
                        </div>
                    </div>
                    <div className="detail_actions">
                        <button className="detail_listen" onClick={onListen} disabled={disabled}>
                            {playing ? <PauseIcon /> : <PlayIcon />}
                            <span>{playing ? "Pause" : "Listen"}</span>
                        </button>
                        <button className="detail_more" onClick={onMore} title={moreTitle} aria-label={moreTitle || "Ще"}>
                            <DotsIcon />
                        </button>
                    </div>
                    {(metaLabel || meta) && (
                        <div className="detail_meta">
                            {metaLabel && <div className={`detail_meta_label ${metaLabelMuted ? "muted" : ""}`}>{metaLabel}</div>}
                            {meta}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// ---------- Банери радіо (NRJ FM / XIT FM), 1528x170 ----------
export const DetailBanner: React.FC<{ variant: "nrj" | "xit" }> = ({ variant }) =>
    variant === "nrj" ? (
        <div className="detail_banner detail_banner_nrj">
            <div className="detail_banner_text">
                <div className="detail_banner_title">NRJ FM</div>
                <div className="detail_banner_subtitle">Good vibes only</div>
            </div>
            <div className="detail_banner_slogan">HIT MUSIC ONLY !</div>
            <div className="detail_banner_logo"><NrjLogo /></div>
        </div>
    ) : (
        <div className="detail_banner detail_banner_xit">
            <div className="detail_banner_text">
                <div className="detail_banner_title">XIT FM</div>
                <div className="detail_banner_subtitle">Good vibes only</div>
            </div>
            <div className="detail_banner_logo"><XitLogo /></div>
        </div>
    );

// ---------- Список треків ----------
interface TrackTableProps {
    tracks: ITrack[];
    playlist?: ITrack[];  // що грати далі (за замовчуванням — сам список)
    albumId?: number | null;
}

export const TrackTable: React.FC<TrackTableProps> = ({ tracks, playlist, albumId = null }) => {
    const navigate = useNavigate();
    const playTrack = usePlayerStore((s) => s.playTrack);
    const current = usePlayerStore((s) => s.track);
    const { liked, toggle } = useLikes(tracks);

    return (
        <ol className="detail_tracks">
            {tracks.map((track) => (
                <li
                    key={track.id}
                    className={`detail_track ${current?.id === track.id ? "active" : ""}`}
                    onClick={() => playTrack(track, playlist || tracks, albumId)}
                >
                    <img className="detail_track_cover" src={trackImageUrl(track)} alt="" />
                    <div className="detail_track_body">
                        <button
                            className="detail_track_title"
                            onClick={(e) => { e.stopPropagation(); navigate(trackLink(track)); }}
                            title="Сторінка треку"
                        >
                            {track.title}
                        </button>
                        <button
                            className="detail_track_author"
                            onClick={(e) => { e.stopPropagation(); navigate(artistLink(track.author)); }}
                        >
                            {track.author}
                        </button>
                        <button
                            className="detail_track_genre"
                            onClick={(e) => { e.stopPropagation(); if (track.genre) navigate(genreLink(track.genre)); }}
                        >
                            {track.genre}
                        </button>
                        <div className="detail_track_end">
                            <button
                                className="detail_track_like"
                                onClick={(e) => { e.stopPropagation(); toggle(track); }}
                                aria-label={liked.has(track.id) ? "Прибрати лайк" : "Лайк"}
                            >
                                <HeartIcon filled={liked.has(track.id)} />
                            </button>
                            <span className="detail_track_duration">{formatDuration(track.duration)}</span>
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export const ShowMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button className="detail_show_more" onClick={onClick}>
        <span className="detail_show_more_dot" />
        <span>Show More</span>
    </button>
);

// ---------- Горизонтальна карусель зі стрілками та смугою прогресу ----------
interface CarouselProps {
    title: string;
    action?: React.ReactNode;   // кнопка «See all» праворуч від заголовка
    variant: "cards" | "cards-lg" | "artists";
    children: React.ReactNode;
}

export const Carousel: React.FC<CarouselProps> = ({ title, action, variant, children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState({ left: 0, width: 1 });

    const update = () => {
        const el = ref.current;
        if (!el) return;
        const width = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
        const left = el.scrollWidth > 0 ? el.scrollLeft / el.scrollWidth : 0;
        setProgress({ left, width: Math.min(1, width) });
    };

    useEffect(() => {
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [children]);

    const scroll = (dir: number) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
    };

    const scrollable = progress.width < 1;

    return (
        <section className={`detail_section detail_carousel detail_carousel_${variant}`}>
            <div className="detail_section_head">
                <h2 className="detail_section_title">{title}</h2>
                {action}
            </div>
            <div className="detail_carousel_frame">
                <div className="detail_carousel_track" ref={ref} onScroll={update}>
                    {children}
                </div>
                {scrollable && (
                    <>
                        <button className="detail_carousel_arrow left" onClick={() => scroll(-1)} aria-label="Назад">
                            <ChevronIcon dir="left" />
                        </button>
                        <button className="detail_carousel_arrow right" onClick={() => scroll(1)} aria-label="Далі">
                            <ChevronIcon dir="right" />
                        </button>
                    </>
                )}
            </div>
            <div className="detail_progress">
                <span style={{ left: `${progress.left * 100}%`, width: `${progress.width * 100}%` }} />
            </div>
        </section>
    );
};

// Картка треку/альбому: квадратна обкладинка, назва, «рік • автор»
export const MediaCard: React.FC<{
    cover: string;
    title: string;
    meta: (string | null | undefined)[];
    onClick: () => void;
}> = ({ cover, title, meta, onClick }) => (
    <button className="detail_card" onClick={onClick} title={title}>
        <span className="detail_card_cover">
            <img src={cover} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-cover.png"; }} />
        </span>
        <span className="detail_card_text">
            <span className="detail_card_title">{title}</span>
            <MetaLine items={meta} />
        </span>
    </button>
);

export const ArtistCard: React.FC<{ name: string; photo: string; onClick: () => void }> = ({ name, photo, onClick }) => (
    <button className="detail_artist" onClick={onClick} title={name}>
        <img
            className="detail_artist_photo"
            src={photo}
            alt={name}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/user.png"; }}
        />
        <span className="detail_artist_name">{name}</span>
    </button>
);

// Блок «Artists» з кнопкою «See all» — однаковий на всіх сторінках
export const ArtistsCarousel: React.FC<{ tracks: ITrack[]; exclude?: string }> = ({ tracks, exclude }) => {
    const navigate = useNavigate();
    const artists = buildArtists(tracks).filter((a) => a.name !== exclude).slice(0, 18);
    if (artists.length === 0) return null;
    return (
        <Carousel
            title="Artists"
            variant="artists"
            action={<button className="detail_see_all" onClick={() => navigate("/artists")}>See all</button>}
        >
            {artists.map((a) => (
                <ArtistCard key={a.name} name={a.name} photo={a.photo} onClick={() => navigate(artistLink(a.name))} />
            ))}
        </Carousel>
    );
};

// Кнопка «Listen»: грає список з початку або ставить на паузу/продовжує, якщо вже грає трек з нього
export const useListen = (list: ITrack[], albumId: number | null = null, first?: ITrack | null) => {
    const current = usePlayerStore((s) => s.track);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const togglePlay = usePlayerStore((s) => s.togglePlay);

    const owns = !!current && (first ? current.id === first.id : list.some((t) => t.id === current.id));
    const playing = owns && isPlaying;

    const listen = () => {
        if (owns) {
            togglePlay();
            return;
        }
        const start = first || list[0];
        if (start) playTrack(start, list.length ? list : [start], albumId);
    };

    return { playing, listen, disabled: list.length === 0 && !first };
};

// Копіює посилання на сторінку (кнопка «…»)
export const copyPageLink = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
};
