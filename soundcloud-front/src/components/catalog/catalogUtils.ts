import { ITrack } from "../../types/track";
import { API_ORIGIN } from "../../env/index";

export { API_ORIGIN };

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

// Groups tracks by key, keeping the order of first appearance
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

// Local artist photos from /public/artists (key is the name without spaces, lowercase)
export const LOCAL_ARTIST_PHOTOS: Record<string, string> = {
    drevo: "/artists/Drevo.png",
    klavdiapetrivna: "/artists/KlavdiaPetrivna.png",
    maxbarskih: "/artists/MaxBarskih.png",
    rammstein: "/artists/Rammstein.png",
    skryabin: "/artists/Skryabin.jpg",
    volkanov: "/artists/Volkanov.png",
    yaktak: "/artists/Yaktak.png",
};

export interface CatalogArtist {
    name: string;
    tracks: ITrack[];
    photo: string;
    plays: number;
}

// Artists = unique track authors, most popular first
export const buildArtists = (tracks: ITrack[]): CatalogArtist[] => {
    const list: CatalogArtist[] = [];
    groupTracks(tracks, (t) => t.author).forEach((items, name) => {
        const key = name.replace(/\s+/g, "").toLowerCase();
        const withCover = items.find((t) => t.imageUrl);
        list.push({
            name,
            tracks: items,
            photo: LOCAL_ARTIST_PHOTOS[key] || trackImageUrl(withCover),
            plays: items.reduce((sum, t) => sum + (t.playCount || 0), 0),
        });
    });
    return list.sort((a, b) => b.plays - a.plays);
};
