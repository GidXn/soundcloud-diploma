import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { albumService } from "../../services/albumAPI.ts";
import { IAlbum } from "../../types/album.ts";
import { ITrack } from "../../types/track.ts";
import { usePlayerStore } from "../../store/player_store.tsx";
import { formatDuration, mediaUrl, trackImageUrl } from "../catalog/catalogUtils";
import { useLikes, useListen } from "../detail/DetailParts";

const PREVIEW = 4;

// «24 days ago»
const timeAgo = (iso?: string): string => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(diff)) return "";
    const day = 86_400_000;
    const n = (v: number, unit: string) => `${v} ${unit}${v === 1 ? "" : "s"} ago`;
    if (diff < day) return "today";
    if (diff < 30 * day) return n(Math.floor(diff / day), "day");
    if (diff < 365 * day) return n(Math.floor(diff / (30 * day)), "month");
    return n(Math.floor(diff / (365 * day)), "year");
};

// Playback position of the current track (0..1), from the shared <audio>
const useProgress = (active: boolean) => {
    const audioRef = usePlayerStore((s) => s.audioRef);
    const [value, setValue] = useState(0);
    useEffect(() => {
        const audio = audioRef.current;
        if (!active || !audio) { setValue(0); return; }
        const update = () => setValue(audio.duration ? audio.currentTime / audio.duration : 0);
        update();
        audio.addEventListener("timeupdate", update);
        return () => audio.removeEventListener("timeupdate", update);
    }, [active, audioRef]);
    return value;
};

interface Props {
    /** Latest album of the user; without albums the card shows the latest tracks */
    album: IAlbum | null;
    fallbackTracks: ITrack[];
    ownerName: string;
}

/* «Recent» card, Figma «profile PEOPLE» (Frame 1343): 1132 wide, padding 32, gradient #9B5DE5 -> #F15BB5 at 30%.
   Cover 173 (r 13), play button 55, owner + release title, progress line, 4 tracks, «View N tracks»,
   three 40 x 32 buttons (like the tracks, share, copy link). */
const RecentRelease: React.FC<Props> = ({ album, fallbackTracks, ownerName }) => {
    const navigate = useNavigate();
    const [albumTracks, setAlbumTracks] = useState<ITrack[]>([]);

    useEffect(() => {
        if (!album) { setAlbumTracks([]); return; }
        albumService.getTracks(album.id).then(setAlbumTracks).catch(() => setAlbumTracks([]));
    }, [album]);

    const tracks = album ? albumTracks : fallbackTracks;
    const lead = tracks[0];
    const title = album ? album.title : lead?.title ?? "";
    const cover = album ? mediaUrl(album.coverUrl) : trackImageUrl(lead);
    const date = album ? album.createdAt : lead?.createdAt;
    const link = album ? `/album/${album.id}` : lead ? `/track/${lead.id}` : "";

    const { playing, listen, disabled } = useListen(tracks, album?.id ?? null);
    const current = usePlayerStore((s) => s.track);
    const playTrack = usePlayerStore((s) => s.playTrack);
    const progress = useProgress(!!current && tracks.some((t) => t.id === current.id));

    const { liked, toggle } = useLikes(tracks);
    const allLiked = useMemo(() => tracks.length > 0 && tracks.every((t) => liked.has(t.id)), [tracks, liked]);
    const likeAll = async () => {
        for (const t of tracks) {
            if (liked.has(t.id) === allLiked) await toggle(t);
        }
        window.dispatchEvent(new Event("favorites-changed"));
    };

    const pageUrl = () => `${window.location.origin}${link}`;
    const copyLink = () => navigator.clipboard?.writeText(pageUrl()).catch(() => undefined);
    const share = () => {
        if (navigator.share) navigator.share({ title, url: pageUrl() }).catch(() => undefined);
        else copyLink();
    };

    return (
        <section className="recent_card">
            <div className="recent_head">
                <span className="recent_label">Recent</span>
                <span className="recent_date">{timeAgo(date)}</span>
            </div>
            <div className="recent_row">
                <button className="recent_cover" onClick={() => link && navigate(link)} title={title}>
                    <img src={cover} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/default-cover.png"; }} />
                </button>
                <div className="recent_info">
                    <div className="recent_top">
                        <div className="recent_title_row">
                            <button className="recent_play" onClick={listen} disabled={disabled} aria-label={playing ? "Pause" : "Play"}>
                                {playing ? (
                                    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden><rect x="4" y="3" width="5" height="16" rx="1.5" fill="#53007F" /><rect x="13" y="3" width="5" height="16" rx="1.5" fill="#53007F" /></svg>
                                ) : (
                                    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden><path d="M34 18.4c1.3.7 1.3 2.5 0 3.2L14 33.1c-1.3.7-3-.2-3-1.7V10.6c0-1.5 1.7-2.4 3-1.7z" fill="#53007F" /></svg>
                                )}
                            </button>
                            <span className="recent_names">
                                <span className="recent_owner">{ownerName}</span>
                                <span className="recent_title">{title}</span>
                            </span>
                        </div>
                        <div className="recent_progress" aria-hidden>
                            <span className="recent_progress_fill" style={{ width: `${progress * 100}%` }} />
                            <span className="recent_progress_knob" style={{ left: `${progress * 100}%` }} />
                        </div>
                    </div>

                    <ol className="recent_tracks">
                        {tracks.slice(0, PREVIEW).map((t, i) => (
                            <li key={t.id} className={`recent_track ${current?.id === t.id ? "active" : ""}`}>
                                <button className="recent_track_main" onClick={() => playTrack(t, tracks, album?.id ?? null)}>
                                    <span className="recent_track_index">{i + 1}.</span>
                                    <img className="recent_track_cover" src={trackImageUrl(t)} alt="" />
                                    <span className="recent_track_title">{t.title}</span>
                                </button>
                                <span className="recent_track_author">{t.author}</span>
                                <span className="recent_track_time">{formatDuration(t.duration)}</span>
                            </li>
                        ))}
                    </ol>

                    <div className="recent_footer">
                        <button className="recent_view_all" onClick={() => link && navigate(link)}>
                            View {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                        </button>
                        <div className="recent_actions">
                            <button className={`recent_action ${allLiked ? "on" : ""}`} onClick={likeAll} aria-label="Like" title="Like">
                                <svg width="13" height="11" viewBox="0 0 24 21" aria-hidden><path d="M12 21C8 18.3 0 13.3 0 6.8 0 3 3 0 6.6 0 9 0 10.8 1.3 12 3c1.2-1.7 3-3 5.4-3C21 0 24 3 24 6.8 24 13.3 16 18.3 12 21z" fill="#FFF" /></svg>
                            </button>
                            <button className="recent_action" onClick={share} aria-label="Share" title="Share">
                                <svg width="13" height="16" viewBox="0 0 13 16" fill="none" aria-hidden><path d="M6.5 10V1M3 4.5 6.5 1 10 4.5M1 8v7h11V8" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button className="recent_action" onClick={copyLink} aria-label="Copy link" title="Copy link">
                                <svg width="13" height="14" viewBox="0 0 13 14" aria-hidden><rect x="3" y="0" width="10" height="11" rx="2" fill="#FFF" /><path d="M1 3v9a2 2 0 0 0 2 2h7" stroke="#FFF" strokeWidth="1.4" fill="none" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RecentRelease;
