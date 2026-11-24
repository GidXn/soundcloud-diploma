import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi";
import { formatDuration, trackImageUrl } from "../../components/catalog/catalogUtils";
import {
    ArtistsCarousel, Carousel, DetailBanner, DetailHero, MediaCard, MetaLine, ShowMoreButton, TrackTable,
    artistLink, copyPageLink, genreLink, trackLink, useListen,
} from "../../components/detail/DetailParts";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/detail/layout.css";

const STEP = 18; // у макеті 18 рядків «Popular tracks», далі «Show More»

// Сторінка треку (Figma: «Song when the click»)
const TrackPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [all, setAll] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [shown, setShown] = useState(STEP);

    useEffect(() => {
        trackService.getAll()
            .then((t) => setAll(t.filter((x) => !x.isHidden)))
            .catch((err) => console.error("Failed to load track", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setShown(STEP);
        window.scrollTo({ top: 0 });
    }, [id]);

    const track = useMemo(() => all.find((t) => String(t.id) === id) || null, [all, id]);

    // «You Might Like»: той самий жанр, потім той самий автор
    const similar = useMemo(() => {
        if (!track) return [];
        const genre = (track.genre || "").toLowerCase();
        return all
            .filter((t) => t.id !== track.id)
            .map((t) => ({ t, score: ((t.genre || "").toLowerCase() === genre ? 2 : 0) + (t.author === track.author ? 1 : 0) }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score || (b.t.playCount || 0) - (a.t.playCount || 0))
            .map((x) => x.t)
            .slice(0, 15);
    }, [all, track]);

    // «Popular tracks»: усі треки за кількістю прослуховувань
    const popular = useMemo(
        () => [...all].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)),
        [all]
    );

    const { playing, listen } = useListen(popular, null, track);

    if (loading) return <main className="catalog_page"><div className="catalog_state">Завантаження…</div></main>;
    if (!track) return <main className="catalog_page"><div className="catalog_state">Трек не знайдено</div></main>;

    return (
        <main className="catalog_page detail_page">
            <DetailHero
                cover={trackImageUrl(track)}
                coverRound
                label="Track"
                title={track.title}
                subtitle={<button onClick={() => navigate(artistLink(track.author))}>{track.author}</button>}
                metaLabel={track.genre ? <button onClick={() => navigate(genreLink(track.genre))}>{track.genre}</button> : null}
                meta={<MetaLine items={[formatDuration(track.duration), track.author]} />}
                playing={playing}
                onListen={listen}
                onMore={copyPageLink}
                moreTitle="Скопіювати посилання"
            />

            <DetailBanner variant="nrj" />

            {similar.length > 0 && (
                <Carousel title="You Might Like" variant="cards-lg">
                    {similar.map((t) => (
                        <MediaCard
                            key={t.id}
                            cover={trackImageUrl(t)}
                            title={t.title}
                            meta={[t.genre, t.author]}
                            onClick={() => navigate(trackLink(t))}
                        />
                    ))}
                </Carousel>
            )}

            <section className="detail_section">
                <h2 className="detail_section_title">Popular tracks</h2>
                <div>
                    <TrackTable tracks={popular.slice(0, shown)} playlist={popular} />
                    {shown < popular.length && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <ShowMoreButton onClick={() => setShown((n) => n + STEP)} />
                        </div>
                    )}
                </div>
            </section>

            <DetailBanner variant="xit" />

            <ArtistsCarousel tracks={all} />
        </main>
    );
};

export default TrackPage;
