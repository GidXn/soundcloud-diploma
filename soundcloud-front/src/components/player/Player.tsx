import React, { useEffect, useState } from "react";

import "../../styles/player/player.css";
import { ITrack } from "../../types/track.ts";
import { usePlayerStore } from "../../store/player_store.tsx";
import api from "../../utilities/axiosInstance.ts";
// used only by the commented-out like button (not in the design)
// import { trackService } from "../../services/trackApi.ts";
import { PlaylistModal } from "../PlaylistModal.tsx";
import { TrackProgress } from "./TrackProgress";
import { API_ORIGIN } from "../../env/index";

interface PlayerProps {
    // kept for compatibility with Layout
    footerSelector?: string;
}

/* ---------- Icons (design: 24x24, white) ---------- */
const PrevIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M11.5 6.6v10.8c0 .8-.9 1.3-1.6.8L2.7 12.8a1 1 0 0 1 0-1.6l7.2-5.4c.7-.5 1.6 0 1.6.8z" />
        <path d="M21.5 6.6v10.8c0 .8-.9 1.3-1.6.8l-7.2-5.4a1 1 0 0 1 0-1.6l7.2-5.4c.7-.5 1.6 0 1.6.8z" />
    </svg>
);
const NextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.5 6.6v10.8c0 .8.9 1.3 1.6.8l7.2-5.4a1 1 0 0 0 0-1.6l-7.2-5.4c-.7-.5-1.6 0-1.6.8z" />
        <path d="M2.5 6.6v10.8c0 .8.9 1.3 1.6.8l7.2-5.4a1 1 0 0 0 0-1.6L4.1 5.8c-.7-.5-1.6 0-1.6.8z" />
    </svg>
);
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.4 10.3c1.3.8 1.3 2.6 0 3.4L8.6 21.5C7.3 22.3 5.5 21.4 5.5 19.8V4.2c0-1.6 1.8-2.5 3.1-1.7z" />
    </svg>
);
const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="5" y="3" width="5" height="18" rx="1.5" />
        <rect x="14" y="3" width="5" height="18" rx="1.5" />
    </svg>
);
const RepeatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7 22l-4-4 4-4 1.4 1.45L6.85 17H17v-4h2v6H6.85l1.55 1.55zM5 11V5h12.15L15.6 3.45 17 2l4 4-4 4-1.4-1.45L17.15 7H7v4z" />
    </svg>
);
const ShuffleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 20v-2h2.6l-3.175-3.175 1.425-1.425L18 16.55V14h2v6zm-8.6 0L4 18.6 16.6 6H14V4h6v6h-2V7.4zm3.775-9.425L4 5.4 5.4 4l5.175 5.175z" />
    </svg>
);
const QueueIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 6h12M3 11h12M3 16h7" />
        <path d="M18 17.5V8.5l3-1" />
        <circle cx="16" cy="17.5" r="2" fill="currentColor" />
    </svg>
);
/* Like button is not in the Figma player, see the commented-out button below.
const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor"
         strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
        <path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 6.9 4.5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.3 0 5.4 3.1 4.2 6.3C19.5 15.4 12 20 12 20z" />
    </svg>
);
*/
const VolumeIcon = ({ muted }: { muted: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M2 9.5A1.5 1.5 0 0 1 3.5 8H7l5.2-4.3c.7-.5 1.8 0 1.8.9v14.8c0 .9-1.1 1.4-1.8.9L7 16H3.5A1.5 1.5 0 0 1 2 14.5z" />
        {muted ? (
            <path d="M17 9.5l5 5M22 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        ) : (
            <>
                <path d="M17 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <path d="M19.8 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </>
        )}
    </svg>
);

const pad2 = (n: number) => String(n).padStart(2, "0");

// Bottom player (design: Frame 1304 / component «Frame 1104», 1788 x 80)
export default function Player({ footerSelector: _footerSelector }: PlayerProps) {
    void _footerSelector;
    const { track, isPlaying, togglePlay, nextTrack, previousTrack, playlist, currentIndex, shuffle, toggleShuffle } =
        usePlayerStore();
    const audioRef = usePlayerStore((state) => state.audioRef);
    const volume = usePlayerStore((state) => state.volume);
    const setVolume = usePlayerStore((state) => state.setVolume);
    const refreshHistory = usePlayerStore((state) => state.refreshHistory);
    // const addToHistory = usePlayerStore((state) => state.addToHistory); // like button only

    const [modalOpen, setModalOpen] = useState(false);
    const [loop, setLoop] = useState(false);
    // const [likedTracksIds, setLikedTracksIds] = useState<number[]>([]); // like button not in the design
    const [lastVolume, setLastVolume] = useState(1);

    // Lock page scroll while the queue modal is open
    useEffect(() => {
        document.body.style.overflow = modalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalOpen]);

    // New track: count the play and start it
    useEffect(() => {
        if (!audioRef.current || !track) return;
        api.post(`/Track/${track.id}/play`).catch(() => undefined);
        audioRef.current.src = `${API_ORIGIN}${track.url}`;
        audioRef.current.volume = volume;
        audioRef.current.play().catch((err) => console.error(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track]);

    // Pause/play control
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.play().catch((err) => console.error(err));
        else audioRef.current.pause();
    }, [isPlaying, audioRef]);

    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);

    /* Like button is not in the Figma player: its state is commented out too.
    useEffect(() => {
        trackService.getAll()
            .then((data) => setLikedTracksIds(data.filter((t) => t.isLikedByCurrentUser).map((t) => t.id)))
            .catch((err) => console.error(err));
    }, []);
    */

    if (!track) return null; // nothing is selected: no player

    const getTrackImageUrl = (t: ITrack) => (t.imageUrl ? `${API_ORIGIN}${t.imageUrl}` : "/default-cover.png");

    /* Like button is not in the Figma player.
    const isLiked = likedTracksIds.includes(track.id) || !!track.isLikedByCurrentUser;

    const toggleLike = async (t: ITrack) => {
        try {
            if (isLiked) {
                await trackService.unlike(t.id);
                setLikedTracksIds((prev) => prev.filter((id) => id !== t.id));
                t.isLikedByCurrentUser = false;
            } else {
                await trackService.like(t.id);
                setLikedTracksIds((prev) => [...prev, t.id]);
                t.isLikedByCurrentUser = true;
            }
            addToHistory(t);
        } catch (err) {
            console.error("Error liking track:", err);
        }
    };
    */

    const toggleMute = () => {
        if (volume > 0) {
            setLastVolume(volume);
            setVolume(0);
        } else {
            setVolume(lastVolume || 1);
        }
    };

    const total = playlist?.length || 0;
    const position = total > 0 && currentIndex >= 0 ? currentIndex + 1 : 1;

    return (
        <>
            <div className="player_bar" role="region" aria-label="Player">
                <div className="player_row">
                    {/* Frame 299: controls + track info */}
                    <div className="player_left">
                        <div className="player_controls">
                            <button className="player_icon_btn" onClick={() => previousTrack()} aria-label="Previous track" title="Previous">
                                <PrevIcon />
                            </button>
                            <button className="player_icon_btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button className="player_icon_btn" onClick={() => nextTrack()} aria-label="Next track" title="Next">
                                <NextIcon />
                            </button>
                        </div>

                        <div className="player_track">
                            <img className="player_cover" src={getTrackImageUrl(track)} alt="" />
                            <div className="player_track_text">
                                <span className="player_title" title={track.title}>{track.title}</span>
                                <span className="player_artist" title={track.author}>{track.author}</span>
                            </div>
                        </div>
                    </div>

                    {/* Frame 302: progress, time + actions, volume */}
                    <div className="player_right">
                        <TrackProgress audioRef={audioRef} track={track}>
                            <div className="player_actions">
                                {/* Not in the Figma player (Frame 1104: repeat, shuffle, queue, volume only).
                                    Commented out instead of removed; likes stay available in the track lists.
                                <button
                                    className={`player_icon_btn${isLiked ? " is_active" : ""}`}
                                    onClick={() => toggleLike(track)}
                                    aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                                    aria-pressed={isLiked}
                                    title="Like"
                                >
                                    <HeartIcon filled={isLiked} />
                                </button>
                                */}
                                <button
                                    className={`player_icon_btn${loop ? " is_active" : ""}`}
                                    onClick={() => setLoop((v) => !v)}
                                    aria-label="Repeat"
                                    aria-pressed={loop}
                                    title="Repeat"
                                >
                                    <RepeatIcon />
                                </button>
                                <button
                                    className={`player_icon_btn${shuffle ? " is_active" : ""}`}
                                    onClick={toggleShuffle}
                                    aria-label="Shuffle"
                                    aria-pressed={shuffle}
                                    title="Shuffle"
                                >
                                    <ShuffleIcon />
                                </button>
                                <button className="player_queue" onClick={() => setModalOpen(true)} aria-label="Queue" title="Queue">
                                    <QueueIcon />
                                    <span>{pad2(position)} / {pad2(Math.max(total, 1))}</span>
                                </button>
                            </div>
                        </TrackProgress>

                        <div className="player_volume">
                            <button className="player_icon_btn" onClick={toggleMute} aria-label={volume > 0 ? "Mute" : "Unmute"} title="Volume">
                                <VolumeIcon muted={volume === 0} />
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                className="player_range player_range_volume"
                                onChange={(e) => setVolume(Number(e.target.value))}
                                aria-label="Volume"
                                style={{ "--val": `${volume * 100}%` } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </div>

                <audio ref={audioRef} loop={loop} onEnded={loop ? undefined : nextTrack} />
            </div>
            <PlaylistModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                getCurrentTrack={() => track}
            />
        </>
    );
}
