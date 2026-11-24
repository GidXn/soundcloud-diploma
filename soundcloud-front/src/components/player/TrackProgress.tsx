import React, { useEffect, useState } from "react";
import { ITrack } from "../../types/track";

interface TrackProgressProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    track: ITrack;
    // Controls rendered right after the time label (design: Frame 292)
    children?: React.ReactNode;
}

const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) time = 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Progress line (white track + gradient fill + 14px thumb) and the time label.
export const TrackProgress: React.FC<TrackProgressProps> = ({ audioRef, track, children }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        audio.addEventListener("durationchange", setAudioDuration);

        if (audio.readyState >= 1) setAudioDuration();

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
            audio.removeEventListener("durationchange", setAudioDuration);
        };
    }, [track, audioRef]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = Number(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <>
            <div className="player_progress">
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    className="player_range player_range_progress"
                    onChange={handleSeek}
                    aria-label="Seek"
                    aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                    title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                    style={{ "--val": `${progressPercent}%` } as React.CSSProperties}
                />
            </div>
            <div className="player_time_group">
                <span className="player_time" title={`${formatTime(currentTime)} / ${formatTime(duration)}`}>
                    {currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
                </span>
                {children}
            </div>
        </>
    );
};
