// Radio stations shown on the Radio page and in the «Radio stations» row of Home.
export interface Station {
    id: string;
    name: string;
    bg: string;     // logo background
    color: string;  // text color
    streamUrl?: string; // stream link; not set yet
    logo?: string;      // logo file from the design (public/radio)
}

// Stations from the design. The first 36 have logos exported from Figma (Radio frame, public/radio);
// the rest (page 2) keep text placeholders: the design does not show them.
export const STATIONS: Station[] = [
    { id: "tuneme", name: "FM Tuneмо", bg: "#FFF", color: "#111", logo: "/radio/tuneme.jpg" },
    { id: "xit", name: "XIT FM", bg: "#E1251B", color: "#FFF", logo: "/radio/xit.jpg" },
    { id: "lux", name: "Radio Vishnya", bg: "#FFF", color: "#C8102E", logo: "/radio/lux.jpg" },
    { id: "kiss", name: "Kiss FM", bg: "#222", color: "#FFF", logo: "/radio/kiss.jpg" },
    { id: "djfm", name: "DJ FM", bg: "#F6D300", color: "#111", logo: "/radio/djfm.jpg" },
    { id: "nrj", name: "NRJ", bg: "#FFF", color: "#E30613", logo: "/radio/nrj.jpg" },
    { id: "shlyager", name: "101.9 Шлягер", bg: "#FFF", color: "#111", logo: "/radio/shlyager.jpg" },
    { id: "roks", name: "Radio ROKS", bg: "#111", color: "#FFF", logo: "/radio/roks.jpg" },
    { id: "ukr", name: "Українське радіо", bg: "#1E8A8A", color: "#FFF", logo: "/radio/ukr.jpg" },
    { id: "fended", name: "Fended", bg: "#111", color: "#FFF", logo: "/radio/fended.jpg" },
    { id: "supreme", name: "Supreme Radio", bg: "#111", color: "#F28C28", logo: "/radio/supreme.jpg" },
    { id: "radio-night", name: "Radio Night", bg: "#2B2F8F", color: "#F6D300", logo: "/radio/radio-night.jpg" },
    { id: "relax", name: "Relax", bg: "#2FB8C9", color: "#FFF", logo: "/radio/relax.jpg" },
    { id: "metro", name: "Metro Radio", bg: "#1A1A1A", color: "#F28C28", logo: "/radio/metro.jpg" },
    { id: "melodia", name: "Мелодія FM", bg: "#E5007E", color: "#FFF", logo: "/radio/melodia.jpg" },
    { id: "power", name: "104.0 Power FM", bg: "#FFF", color: "#111", logo: "/radio/power.jpg" },
    { id: "ua", name: "UA: Українське радіо", bg: "#8B1E2D", color: "#FFF", logo: "/radio/ua.jpg" },
    { id: "retro", name: "Retro FM", bg: "#FFF", color: "#E5007E", logo: "/radio/retro.jpg" },
    { id: "galychyna", name: "Галичина FM", bg: "#9B2A2A", color: "#FFF", logo: "/radio/galychyna.jpg" },
    { id: "nv", name: "Радіо НВ", bg: "#1A1A1A", color: "#E1251B", logo: "/radio/nv.jpg" },
    { id: "magic", name: "Magic Radio", bg: "#FFF", color: "#6B4A1E", logo: "/radio/magic.jpg" },
    { id: "maximum", name: "Радіо Maximum", bg: "#C8102E", color: "#FFF", logo: "/radio/maximum.jpg" },
    { id: "sun", name: "Sun FM", bg: "#111", color: "#FFF", logo: "/radio/sun.jpg" },
    { id: "record", name: "Record", bg: "#FFF", color: "#E1251B", logo: "/radio/record.jpg" },
    { id: "radio", name: "Radio", bg: "#1E88E5", color: "#FFF", logo: "/radio/radio.jpg" },
    { id: "mb", name: "MB Radio", bg: "#2A2A4A", color: "#E1251B", logo: "/radio/mb.jpg" },
    { id: "beat", name: "Beat", bg: "#1A0A0A", color: "#F28C28", logo: "/radio/beat.jpg" },
    { id: "waves", name: "Waves", bg: "#111", color: "#7B61FF", logo: "/radio/waves.jpg" },
    { id: "waver", name: "Waver", bg: "#F3EEDF", color: "#111", logo: "/radio/waver.jpg" },
    { id: "retro-mania", name: "Retro Mania", bg: "#F3EEDF", color: "#C8102E", logo: "/radio/retro-mania.jpg" },
    { id: "salmon", name: "Salmon", bg: "#8A7F7A", color: "#FFF", logo: "/radio/salmon.jpg" },
    { id: "timeout", name: "Time Out", bg: "#FFF", color: "#E1251B", logo: "/radio/timeout.jpg" },
    { id: "funky", name: "Funky Junk", bg: "#FFF", color: "#111", logo: "/radio/funky.jpg" },
    { id: "boombox", name: "Boombox", bg: "#111", color: "#F6D300", logo: "/radio/boombox.jpg" },
    { id: "lounge", name: "Lounge FM", bg: "#E1251B", color: "#FFF", logo: "/radio/lounge.jpg" },
    { id: "vinyl", name: "Vinyl", bg: "#111", color: "#FFF", logo: "/radio/vinyl.jpg" },
    { id: "jazz", name: "Jazz FM", bg: "#1F2A44", color: "#F6D300" },
    { id: "rock", name: "Rock FM", bg: "#111", color: "#E1251B" },
    { id: "chill", name: "Chill Out", bg: "#3A7BD5", color: "#FFF" },
    { id: "lviv", name: "Львівська хвиля", bg: "#FFF", color: "#1E5AA8" },
    { id: "kraina", name: "Країна FM", bg: "#F6D300", color: "#1E5AA8" },
    { id: "hype", name: "Hype FM", bg: "#7B61FF", color: "#FFF" },
];

export const stationInitials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
