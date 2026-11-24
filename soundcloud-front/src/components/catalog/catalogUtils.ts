import { ITrack } from "../../types/track";

export const API_ORIGIN = "http://localhost:5122";

export const trackImageUrl = (track?: ITrack | null): string => {
    if (!track || !track.imageUrl) return "/default-cover.png";
    return `${API_ORIGIN}${track.imageUrl}`;
};

export const mediaUrl = (path?: string | null): string => {
    if (!path) return "/default-cover.png";
    return path.startsWith("/") ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`;
};

// "00:03:47.000" -> "3:47"
export const formatDuration = (ts?: string): string => {
    if (!ts) return "";
    const parts = ts.split(":");
    if (parts.length < 3) return ts;
    const [h, m, s] = parts;
    const minutes = Number(h) * 60 + Number(m);
    return `${minutes}:${s.split(".")[0].padStart(2, "0")}`;
};

// Групує треки за ключем, зберігаючи порядок першої появи
export const groupTracks = (tracks: ITrack[], key: (t: ITrack) => string): Map<string, ITrack[]> => {
    const map = new Map<string, ITrack[]>();
    for (const t of tracks) {
        const k = (key(t) || "").trim();
        if (!k) continue;
        const list = map.get(k);
        if (list) list.push(t);
        else map.set(k, [t]);
    }
    return map;
};
