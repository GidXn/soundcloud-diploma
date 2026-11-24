import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { trackService } from "../../services/trackApi.ts";
import { albumService } from "../../services/albumAPI.ts";
import { genreService } from "../../services/genreApi.ts";
import { ITrack } from "../../types/track.ts";
import { IAlbum } from "../../types/album.ts";
import { IGenre } from "../../types/genre.ts";
import { groupTracks, mediaUrl, trackImageUrl } from "../../components/catalog/catalogUtils";
import { STATIONS } from "../../components/catalog/radioStations";
import RadioTile from "../../components/catalog/RadioTile";
import {
    ArtistsCarousel,
    Carousel,
    ChevronButton,
    DetailBanner,
    MediaCard,
    ShowMoreButton,
    TrackTable,
    genreLink,
    yearOf,
} from "../../components/detail/DetailParts";

import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/home_page/layout.css";

/* Home, Figma «Home» (2270:6638), top to bottom:
   Music Buddy banner, Charts, Albums, Radio stations, Novelty + Show More, XIT FM,
   Popular albums (2 x 6, All + arrows) with News / Radio / Mood and genres buttons,
   promo banners, Artists, Mood and genres, XIT FM. Sections are 64px apart. */

const NOVELTY_STEP = 24;       // rows shown before / added by «Show More»
const POPULAR_PAGE = 12;       // 2 rows of 6

const PlayIcon: React.FC = () => (
    <svg className="genre_tile_play" width="19" height="20" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 7.27C16.33 8.04 16.33 9.96 15 10.73L3 17.66C1.67 18.43 0 17.47 0 15.93V2.07C0 0.53 1.67 -0.43 3 0.34L15 7.27Z" fill="#FFF" />
    </svg>
);

const SeeAll: React.FC<{ to: string; label?: string }> = ({ to, label = "See all" }) => {
    const navigate = useNavigate();
    return <button className="detail_see_all" onClick={() => navigate(to)}>{label}</button>;
};

const albumMeta = (a: IAlbum) => [yearOf(a.createdAt), a.ownerName];

// Promo banners (800 x 250, r 13): a full-width row from the sidebar to the right edge,
// the middle banner centred on the content column; arrows sit on the column edges.
const PromoRow: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ left: 0, right: 0 });
    const banners = ["/inside/promo_1.jpg", "/inside/promo_2.jpg", "/inside/promo_3.jpg"];

    useLayoutEffect(() => {
        const layout = (center: boolean) => {
            const section = sectionRef.current;
            const track = trackRef.current;
            const main = section?.parentElement;
            if (!section || !track || !main) return;
            const cs = getComputedStyle(main);
            const pl = parseFloat(cs.paddingLeft) || 0;
            const pr = parseFloat(cs.paddingRight) || 0;
            section.style.marginLeft = `${-pl}px`;
            section.style.marginRight = `${-pr}px`;
            setEdges({ left: pl, right: pr });
            const middle = track.children[1] as HTMLElement | undefined;
            if (center && middle) {
                const contentCenter = pl + (main.clientWidth - pl - pr) / 2;
                track.scrollLeft = middle.offsetLeft + middle.offsetWidth / 2 - contentCenter;
            }
        };
        layout(true);
        const onResize = () => layout(true);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const scroll = (dir: number) => trackRef.current?.scrollBy({ left: dir * 830, behavior: "smooth" });

    return (
        <section className="home_promo" ref={sectionRef}>
            <div className="home_promo_track" ref={trackRef}>
                {banners.map((src) => (
                    <img key={src} className="home_promo_banner" src={src} alt="" />
                ))}
            </div>
            <ChevronButton dir="left" className="home_promo_arrow" style={{ left: Math.max(4, edges.left - 28) }} onClick={() => scroll(-1)} />
            <ChevronButton dir="right" className="home_promo_arrow" style={{ right: Math.max(4, edges.right - 25) }} onClick={() => scroll(1)} />
        </section>
    );
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [genres, setGenres] = useState<IGenre[]>([]);
    const [noveltyCount, setNoveltyCount] = useState(NOVELTY_STEP);
    const [popularPage, setPopularPage] = useState(0);

    useEffect(() => {
        albumService.getAllAlbums().then(setAlbums).catch((err) => console.error("Failed to load albums", err));
        trackService.getAll().then((t) => setTracks(t.filter((x) => !x.isHidden))).catch((err) => console.error("Failed to load tracks", err));
        genreService.getGenres().then(setGenres).catch((err) => console.error("Failed to load genres", err));
    }, []);

    // Novelty: newest uploads first
    const novelty = useMemo(
        () => [...tracks].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "") || b.id - a.id),
        [tracks]
    );

    // Popular albums: by total plays of their tracks
    const popular = useMemo(() => {
        const plays = new Map<number, number>();
        for (const t of tracks) {
            if (t.albumId) plays.set(t.albumId, (plays.get(t.albumId) || 0) + (t.playCount || 0));
        }
        return [...albums].sort((a, b) => (plays.get(b.id) || 0) - (plays.get(a.id) || 0));
    }, [albums, tracks]);
    const popularPages = Math.max(1, Math.ceil(popular.length / POPULAR_PAGE));
    const popularVisible = popular.slice(popularPage * POPULAR_PAGE, (popularPage + 1) * POPULAR_PAGE);

    const tracksByGenre = useMemo(() => groupTracks(tracks, (t) => t.genre?.toLowerCase()), [tracks]);

    return (
        <main className="catalog_page detail_page home_page">
            <img className="home_hero_banner" src="/inside/homep_banner.png" alt="Music Buddy — only quality music" />

            {albums.length > 0 && (
                <Carousel
                    title="Charts"
                    variant="cards"
                    className="home_row home_charts"
                    progress={false}
                    action={<SeeAll to="/charts" />}
                >
                    {albums.map((album) => (
                        <button
                            key={album.id}
                            className="home_chart_card"
                            style={{ backgroundImage: `url('${mediaUrl(album.coverUrl)}')` }}
                            onClick={() => navigate(`/chart/${album.id}`)}
                            title={album.title}
                        >
                            <span className="home_chart_title">{album.title}</span>
                        </button>
                    ))}
                </Carousel>
            )}

            {albums.length > 0 && (
                <Carousel title="Albums" variant="cards" className="home_row home_albums" action={<SeeAll to="/albums" />}>
                    {albums.map((album) => (
                        <MediaCard
                            key={album.id}
                            cover={mediaUrl(album.coverUrl)}
                            title={album.title}
                            meta={albumMeta(album)}
                            onClick={() => navigate(`/album/${album.id}`)}
                        />
                    ))}
                </Carousel>
            )}

            <Carousel
                title="Radio stations"
                variant="cards"
                className="home_row home_radio"
                progress={false}
                action={<SeeAll to="/radio" />}
            >
                {STATIONS.map((s) => (
                    <RadioTile key={s.id} station={s} onClick={() => navigate("/radio")} />
                ))}
            </Carousel>

            <section className="detail_section home_novelty">
                <h2 className="detail_section_title">Novelty</h2>
                {novelty.length === 0 ? (
                    <div className="detail_empty">No tracks yet</div>
                ) : (
                    <TrackTable tracks={novelty.slice(0, noveltyCount)} playlist={novelty} />
                )}
                {noveltyCount < novelty.length && (
                    <ShowMoreButton onClick={() => setNoveltyCount((n) => n + NOVELTY_STEP)} />
                )}
            </section>

            <DetailBanner variant="xit" />

            {popular.length > 0 && (
                <section className="detail_section home_popular">
                    <div className="detail_section_head">
                        <h2 className="detail_section_title">Popular albums</h2>
                        <div className="home_popular_controls">
                            <SeeAll to="/albums" label="All" />
                            <div className="home_popular_arrows">
                                <ChevronButton dir="left" onClick={() => setPopularPage((p) => Math.max(0, p - 1))} disabled={popularPage === 0} />
                                <ChevronButton dir="right" onClick={() => setPopularPage((p) => Math.min(popularPages - 1, p + 1))} disabled={popularPage >= popularPages - 1} />
                            </div>
                        </div>
                    </div>
                    <div className="home_popular_grid">
                        {popularVisible.map((album) => (
                            <MediaCard
                                key={album.id}
                                cover={mediaUrl(album.coverUrl)}
                                title={album.title}
                                meta={albumMeta(album)}
                                onClick={() => navigate(`/album/${album.id}`)}
                            />
                        ))}
                    </div>
                    {/* Figma: three buttons under the grid. «News» has no page in the design,
                        so it opens Music (all tracks, newest first is the closest match). */}
                    <div className="home_links">
                        <button className="home_link_btn" onClick={() => navigate("/music")}>News</button>
                        <button className="home_link_btn" onClick={() => navigate("/radio")}>Radio</button>
                        <button className="home_link_btn" onClick={() => navigate("/genres")}>Mood and genres</button>
                    </div>
                </section>
            )}

            <PromoRow />

            <ArtistsCarousel tracks={tracks} className="home_row home_artists" />

            {genres.length > 0 && (
                <Carousel title="Mood and genres" variant="cards" className="home_row home_mood" action={<SeeAll to="/genres" />}>
                    {genres.map((genre) => {
                        const list = tracksByGenre.get(genre.name.toLowerCase()) || [];
                        const cover = list.find((t) => t.imageUrl);
                        return (
                            <button
                                key={genre.id}
                                className={`genre_tile ${list.length === 0 ? "empty" : ""}`}
                                onClick={() => navigate(genreLink(genre.name))}
                                title={genre.name}
                            >
                                {cover && <img className="genre_tile_bg" src={trackImageUrl(cover)} alt="" />}
                                <span className="genre_tile_name">{genre.name}</span>
                                <PlayIcon />
                            </button>
                        );
                    })}
                </Carousel>
            )}

            <DetailBanner variant="xit" />
        </main>
    );
};

export default HomePage;
