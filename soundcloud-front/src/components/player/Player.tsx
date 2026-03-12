import React, {useEffect, useState} from "react";

import "../../styles/player/player.css";
import "../../styles/footer.css";
import {ITrack} from "../../types/track.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import api from "../../utilities/axiosInstance.ts";
import {trackService} from "../../services/trackApi.ts";
import {PlaylistModal} from "../PlaylistModal.tsx";
import { TrackProgress } from "./TrackProgress";

import like_icon from "../../images/icons/like.png";
import unlike_icon from "../../images/icons/unlike.png";


interface PlayerProps {
    footerSelector: string;
}
export default function Player({ footerSelector }: PlayerProps) {
    const { track, isPlaying, togglePlay,nextTrack,previousTrack } = usePlayerStore();
    const audioRef = usePlayerStore(state => state.audioRef); // глобал
    const [bottomOffset, setBottomOffset] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const currentTrack = usePlayerStore(state => state.track);

    const[loop, setLoop] = useState<boolean>(false);

    const max = 1;
    const minBottom = 16;   // фіксована відстань від низу
    const maxBottom = 16;

    useEffect(() => {
        if (modalOpen) {
            // Забороняємо скрол
            document.body.style.overflow = "hidden";
        } else {
            // Повертаємо як було
            document.body.style.overflow = "";
        }

        // Cleanup на всяк випадок
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalOpen]);


    const volume = usePlayerStore(state => state.volume);
    const setVolume = usePlayerStore(state => state.setVolume);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
    };
    useEffect(() => {
        const footer = document.querySelector(footerSelector);
        if (!footer) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const ratio = entry.intersectionRatio; // від 0 до 1
                const offset = minBottom + (maxBottom - minBottom) * ratio;
                setBottomOffset(offset);
            },
            { threshold: Array.from({ length: 101 }, (_, i) => i / 100) } // спрацьовує на кожному 1% видимості
        );

        observer.observe(footer);
        return () => observer.disconnect();
    }, [footerSelector]);

    useEffect(() => {
        if (!audioRef.current || !track) return;
        api.post(`http://localhost:5122/api/Track/${track.id}/play`)

        audioRef.current.src = `http://localhost:5122${track.url}`;
        audioRef.current.play().catch((err) => console.log(err));
    }, [track]);

    // Керування паузою/відтворенням
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch((err) => console.log(err));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);


    const refreshHistory = usePlayerStore(state => state.refreshHistory);

    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);
    const addtoHistory = usePlayerStore(state => state.addToHistory);

    const [likedTracksIds, setLikedTracksIds] = useState<number[]>([]);
    useEffect(() => {
        trackService.getAll()
            .then((data) => {
                const likedIds = data.filter(t => t.isLikedByCurrentUser).map(t => t.id);
                setLikedTracksIds(likedIds);
            })
            .catch((err) => console.error(err));
    }, []);


    const getTrackImageUrl = (track: ITrack) => {
        if (!track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122${track.imageUrl}`;
    };

    if (!track) return null; // якщо трек не обрано, не рендеримо


    const toggleLike = async (track: ITrack) => {
        try {
            if (likedTracksIds.includes(track.id)) {
                // анлайк
                await trackService.unlike(track.id);
                setLikedTracksIds(prev => prev.filter(id => id !== track.id));
                track.isLikedByCurrentUser = false; // оновлюємо локально
                addtoHistory(track);
                trackService.getAll()
            } else {
                // лайк
                await trackService.like(track.id);
                setLikedTracksIds(prev => [...prev, track.id]);
                track.isLikedByCurrentUser = true; // оновлюємо локально
                addtoHistory(track);
                trackService.getAll()
            }
        } catch (err) {
            console.error("Error liking track:", err);
        }
    };

    return (
        <>

        <div className="player_player_container baloo2">
            {/* основний рядок плеєра */}
            <div className="player_main_row">
                {/* внутрішній рядок: лівий блок, центр, гучність */}
                <div className="player_inner_row">
                    {/* лівий блок: кнопки + інфо про трек */}
                    <div className="player_left_block">
                        {/* навігація: попередній / плей / наступний */}
                        <div className="player_nav_controls">
                            <div className="track_control_track_container">
                                <img
                                    src="/src/images/player/skip_previous_icon.png"
                                    alt={"skipPreviousIcon"}
                                    id="hover_cursor_player"
                                    onClick={() => previousTrack()}
                                />
                                <button onClick={togglePlay}>
                                    {isPlaying ? (
                                        <img
                                            src="/src/images/player/pause_icon.png"
                                            id="hover_cursor_player"
                                            alt={"PauseIcon"}
                                        />
                                    ) : (
                                        <img
                                            src="/src/images/player/play_icon.png"
                                            id="hover_cursor_player"
                                            alt={"PlayIcon"}
                                        />
                                    )}
                                </button>
                                <img
                                    src="/src/images/player/skip_next_icon.png"
                                    id="hover_cursor_player"
                                    alt={"skipNextIcon"}
                                    onClick={() => nextTrack()}
                                />
                            </div>
                        </div>

                        {/* блок інформації про трек: обкладинка + назва + автор */}
                        <div className="player_track_info_block">
            <div className="player_track_container">
                <div className="player_track_image">
                                    <img
                                        className="player_track_image"
                                        src={getTrackImageUrl(track)}
                                        alt={track.title}
                                    />
                </div>
                <div className="player_track_title_container ">
                                    <div
                                        className={`player_track_title ${
                                            track.title.length > 10 ? "scrolling" : ""
                                        }`}
                                    >
                        {track.title}
                    </div>
                                    <div
                                        className={`player_track_author ${
                                            track.author.length > 25 ? "scrolling" : ""
                                        }`}
                                    >
                        {track.author}
                    </div>
                </div>
                            </div>
                        </div>
                    </div>

                    {/* центральний блок: прогрес + час + додаткові дії */}
                    <div className="player_center_block">
                        {/* прогрес треку з часом */}
                        <div className="player_progress_block">
                            <div className="track_time_skip_container">
                                <TrackProgress audioRef={audioRef} track={track} />
                            </div>
                        </div>

                        {/* дії: лайк, повтор, плейлист */}
                        <div className="player_actions_block">
                <div className="track_control_container">
                    <div className="track_control_like_container">
                        <img
                                        src={track.isLikedByCurrentUser ? like_icon : unlike_icon}
                            alt="like"
                            onClick={() => {
                                toggleLike(track);
                            }}
                                        style={{ cursor: "pointer" }}
                        />
                    </div>

                    <div className="track_control_repeat_container">
                        {!loop ? (
                            <img
                                src="/src/images/player/repeat_icon.png"
                                alt="repeatIcon"
                                id="hover_cursor_player"
                                            onClick={() => setLoop(true)} // 🔹 увімкнути
                            />
                        ) : (
                            <img
                                src="/src/images/player/repeat_cyan.png"
                                alt="repeatIcon"
                                id="hover_cursor_player"
                                            onClick={() => setLoop(false)} // 🔹 вимкнути
                            />
                        )}
                    </div>
                                <div className="track_control_queue_container">
                                    <img
                                        src="/src/images/player/queue_icon.png"
                             id="hover_cursor_player"
                                        alt={"queueIcon"}
                                        onClick={() => setModalOpen(true)}
                        />
                    </div>
                    </div>
                </div>
                </div>

                    {/* блок гучності – іконка + повзунок */}
                    <div className="player_volume_block">
                <div className="track_loudness_container">
                    <div className="track_loudness_image_container">
                                <img src="/src/images/player/volume_up_icon.png" alt="Volume" />
                    </div>
                    <div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            className="volume_input"
                            step={0.001}
                            value={volume}
                            onChange={handleVolumeChange}
                                    style={{ "--val": `${(volume / max) * 100}%` } as React.CSSProperties}
                        />
                    </div>
                        </div>
                    </div>
                </div>
            </div>
            {!loop? (
                <audio
                    ref={audioRef}
                    src={track.url}
                    onEnded={nextTrack}
                />
            ): (
                <audio
                    ref={audioRef}
                    src={track.url}
                    loop
                />
            )}

        </div>
            <PlaylistModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                getCurrentTrack={() => currentTrack}
            />
        </>
    );
}