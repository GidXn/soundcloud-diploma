import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import api from "../../utilities/axiosInstance";
import { SearchResponse } from "../../types/search_types.ts";
import { ITrack } from "../../types/track.ts";
import { trackService } from "../../services/trackApi.ts";
import { ArtistCard, TrackTable } from "../../components/detail/DetailParts";
import { avatarUrl } from "../../components/people/peopleUtils";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/search_page/layout.css";

const TRACK_PAGE_SIZE = 20;

/* Search results for the header search («/search-page?q=…»).
   The design has no separate results screen, so the page reuses the design blocks:
   36px section titles, the track list of the catalog pages and the round artist cards. */
const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const q = (searchParams.get("q") ?? "").trim();
    const navigate = useNavigate();
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (q.length < 2) {
            setResults(null);
            setTracks([]);
            return;
        }
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true);
        Promise.all([
            api.get<SearchResponse>("/search", {
                params: { q, trackPage: 1, trackPageSize: TRACK_PAGE_SIZE },
                signal: controller.signal,
            }),
            trackService.getAll(),
        ])
            .then(([res, all]) => {
                setResults(res.data);
                // The search returns short track summaries; take the full rows (genre, duration, likes)
                const byId = new Map(all.map((t) => [t.id, t]));
                setTracks(res.data.tracks.items.map((t) => byId.get(t.id)).filter((t): t is ITrack => !!t && !t.isHidden));
            })
            .catch((err) => {
                if (axios.isCancel(err)) return;
                console.error("Search failed", err);
            })
            .finally(() => {
                if (controllerRef.current === controller) setLoading(false);
            });
        return () => controller.abort();
    }, [q]);

    const users = results?.users.items ?? [];

    return (
        <main className="catalog_page detail_page search_page">
            <h1 className="catalog_title">{q ? `Search: ${q}` : "Search"}</h1>

            {q.length < 2 && <div className="catalog_state">Type at least 2 characters in the search field</div>}
            {loading && <div className="catalog_state">Loading…</div>}

            {results && !loading && (
                <>
                    <section className="detail_section">
                        <h2 className="detail_section_title">Tracks</h2>
                        {tracks.length === 0 ? <div className="detail_empty">No tracks found</div> : <TrackTable tracks={tracks} />}
                    </section>

                    <section className="detail_section">
                        <h2 className="detail_section_title">Authors</h2>
                        {users.length === 0 ? (
                            <div className="detail_empty">No authors found</div>
                        ) : (
                            <div className="search_people">
                                {users.map((u) => (
                                    <ArtistCard key={u.id} name={u.username} photo={avatarUrl(u.avatarUrl)} onClick={() => navigate(`/user/${u.id}`)} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
};

export default SearchPage;
