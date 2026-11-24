import { ITrack } from "./track";
import { IAlbum } from "./album";
import {RefObject} from "react";

export interface PlayerContextType {
    track: ITrack | null;
    isPlaying: boolean;
    history: ITrack[];
    playlist: ITrack[];
    currentIndex: number;
    currentAlbumId: number | null; // always present, can be null
    audioRef: RefObject<HTMLAudioElement | null>;
    volume: number; // new field
    shuffle: boolean;

    playTrack: (track: ITrack, playlist?: ITrack[], albumId?: number | null) => void;
    playAlbum: (album: IAlbum, tracks?: ITrack[]) => void;
    pauseTrack: () => void; // no arguments
    togglePlay: () => void;
    addToHistory: (track: ITrack) => void;
    nextTrack: () => void;
    previousTrack: () => void;
    refreshHistory: () => Promise<void>;
    initHistory:()=>void;
    clearTrack: () => void;
    setVolume: (volume: number) => void; // new method
    toggleShuffle: () => void;
    setCurrentTrack: (track: ITrack | null) => void;
}