import React from "react";
import { API_ORIGIN } from "../catalog/catalogUtils";

// User avatar: full URL, relative path from the backend, or a placeholder
export const avatarUrl = (path?: string | null): string => {
    if (!path) return "/default-avatar.svg";
    if (path.startsWith("http")) return path;
    return path.startsWith("/") ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`;
};

// 9740000 -> "9.74M", 151000 -> "151K", 11800 -> "11.8K"
export const formatCount = (n?: number): string => {
    const v = n || 0;
    const fmt = (x: number) => (x >= 100 ? Math.round(x).toString() : x.toFixed(x >= 10 ? 1 : 2).replace(/\.?0+$/, ""));
    if (v >= 1_000_000) return `${fmt(v / 1_000_000)}M`;
    if (v >= 1_000) return `${fmt(v / 1_000)}K`;
    return String(v);
};

type IconProps = { size?: number; color?: string };

// Icons from the design (1.5px stroke, white)
export const MusicIcon: React.FC<IconProps> = ({ size = 84, color = "#DBDBDB" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18V5.5l11-2.5v12.5" stroke={color} strokeWidth="0.7" strokeLinejoin="round" />
        <path d="M9 9l11-2.5" stroke={color} strokeWidth="0.7" />
        <circle cx="6.5" cy="18" r="2.5" stroke={color} strokeWidth="0.7" />
        <circle cx="17.5" cy="15.5" r="2.5" stroke={color} strokeWidth="0.7" />
    </svg>
);

export const PersonIcon: React.FC<IconProps> = ({ size = 16, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const PeopleIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="1.5" />
        <path d="M2.5 19.5c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15.5 4.8a3.5 3.5 0 010 6.4M18 14.4c2.1.7 3.5 2.4 3.5 5.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ size = 16, color = "#FFF", filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} aria-hidden>
        <path
            d="M7.5 4C4.5 4 2 6.4 2 9.4c0 5.4 6.4 9.9 10 11.1 3.6-1.2 10-5.7 10-11.1C22 6.4 19.5 4 16.5 4c-1.8 0-3.4.9-4.5 2.3C10.9 4.9 9.3 4 7.5 4z"
            stroke={color} strokeWidth="1.5" strokeLinejoin="round"
        />
    </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ size = 16, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 6l4 6 5-4-2 10H5L3 8l5 4 4-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 8l-4 4 4 4M6 12h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const PlayTriangle: React.FC<IconProps> = ({ size = 13, color = "#D9D9D9" }) => (
    <svg width={size} height={size} viewBox="0 0 13 13" aria-hidden>
        <path d="M2.5 1.2L11.5 6.5L2.5 11.8z" fill={color} />
    </svg>
);

export const LibraryIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 4v16M9 4v16M14 5l5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const FeedIcon: React.FC<IconProps> = ({ size = 18, color = "#FFF" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="3" stroke={color} strokeWidth="1.5" />
        <path d="M8 9h8M8 12.5h8M8 16h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
