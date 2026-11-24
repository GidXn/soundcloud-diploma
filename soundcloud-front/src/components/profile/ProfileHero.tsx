import React from "react";
import { IUser } from "../../types/user.ts";
import { avatarUrl } from "../people/peopleUtils";
import { API_ORIGIN } from "../catalog/catalogUtils";
import "../../styles/profile_page/profile_figma.css";

// Default banner exported from Figma (Rectangle 342, 1528 x 250)
const DEFAULT_BANNER = "/inside/profile_banner.jpg";

const bannerUrl = (path?: string | null): string => {
    if (!path) return DEFAULT_BANNER;
    if (path.startsWith("http")) return path;
    return path.startsWith("/") ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/${path}`;
};

interface Props {
    user: IUser | null;
    /** «profile» (own, settings) or «people» (another user) — the two frames place the avatar differently */
    variant: "own" | "people";
    /** Right side of the name row (Follow button on another user's profile) */
    action?: React.ReactNode;
    /** Green dot on the avatar. Only the own profile shows it: the backend has no online status for others. */
    online?: boolean;
}

/* Banner 1528 x 250 (r 20) with a 142px round avatar overlapping its bottom edge and the name next to it.
   Figma «profile» (2304:19314) and «profile PEOPLE» (2649:647). */
const ProfileHero: React.FC<Props> = ({ user, variant, action, online }) => (
    <section className={`profile_hero profile_hero_${variant}`}>
        <img
            className="profile_hero_banner"
            src={bannerUrl(user?.banner)}
            alt=""
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_BANNER; }}
        />
        <div className="profile_hero_avatar">
            <img src={avatarUrl(user?.avatar)} referrerPolicy="no-referrer" alt="" />
            {online && <span className="profile_hero_online" aria-label="Online" />}
        </div>
        <div className="profile_hero_row">
            <span className="profile_hero_name">{user?.username ?? ""}</span>
            {action}
        </div>
    </section>
);

export default ProfileHero;

export const FollowIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="10" cy="8" r="4" stroke="#FFF" strokeWidth="1.5" />
        <path d="M3 20c0-3.9 3.1-6 7-6 1.4 0 2.7.3 3.8.8" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 14v6M15 17h6" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
