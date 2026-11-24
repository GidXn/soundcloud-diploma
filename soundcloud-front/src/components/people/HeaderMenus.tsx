import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../types/user";
import { trackService } from "../../services/trackApi";
import {
    avatarUrl, CloseIcon, CrownIcon, HeartIcon, LogoutIcon, PeopleIcon, PersonIcon, SunIcon, // FeedIcon, LibraryIcon: for the commented-out menu items
} from "./peopleUtils";
import "../../styles/main_pages/people/layout.css";

// Close the popup on click outside it and on Esc
const useDismiss = (open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) => {
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose, ref]);
};

// Theme: for now we only remember the choice and set data-theme on <html>.
// There is no light theme in the design, so its styles are a separate task.
const useThemeMode = () => {
    const [light, setLight] = useState(() => {
        try { return localStorage.getItem("theme") === "light"; } catch { return false; }
    });
    useEffect(() => {
        const sync = (e: Event) => setLight((e as CustomEvent<boolean>).detail);
        window.addEventListener("theme-changed", sync);
        return () => window.removeEventListener("theme-changed", sync);
    }, []);
    const toggle = () => {
        const next = !light;
        document.documentElement.dataset.theme = next ? "light" : "dark";
        try { localStorage.setItem("theme", next ? "light" : "dark"); } catch { /* ignore */ }
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: next }));
    };
    return [light, toggle] as const;
};

/* ---------------- User menu (design: favorite, variant 2) ---------------- */

interface UserMenuProps {
    user: IUser | null;
    onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [favCount, setFavCount] = useState(0);
    const [light, toggleLight] = useThemeMode();
    const ref = useRef<HTMLDivElement>(null);
    const close = React.useCallback(() => setOpen(false), []);
    useDismiss(open, close, ref);

    useEffect(() => {
        if (!open) return;
        trackService.getLikedTracks().then((t) => setFavCount(t.length)).catch(() => setFavCount(0));
    }, [open]);

    const go = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <div className="hdr_user" ref={ref}>
            <button className="hdr_user_trigger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="User menu">
                <img className="hdr_user_avatar" src={avatarUrl(user?.avatar)} referrerPolicy="no-referrer" alt="" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden
                     style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .15s" }}>
                    <path d="M6 9l6 6 6-6" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="user_menu" role="menu">
                    <div className="user_menu_top">
                        <button className="user_menu_icon_btn" onClick={onLogout} aria-label="Log out" title="Log out">
                            <LogoutIcon />
                        </button>
                        <button className="user_menu_icon_btn" onClick={close} aria-label="Close">
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="user_menu_profile">
                        <img className="user_menu_avatar" src={avatarUrl(user?.avatar)} referrerPolicy="no-referrer" alt="" />
                        <span className="user_menu_name">{user?.username}</span>
                    </div>

                    <div className="user_menu_items">
                        <button className="user_menu_pro" role="menuitem" onClick={() => go("/subscribe")}>
                            <CrownIcon size={18} />
                            <span>Pro subscribe</span>
                        </button>
                        <button className="user_menu_item" role="menuitem" onClick={() => go("/profile")}>
                            <PersonIcon size={18} /><span>Profile</span>
                        </button>
                        <button className="user_menu_item" role="menuitem" onClick={() => go("/following")}>
                            <PeopleIcon size={18} /><span>Following</span>
                        </button>
                        {/* Library and Feed are not in the Figma user menu (2509:176) and have no screens
                            in the design, so the items are commented out together with their routes (App.tsx).
                        <button className="user_menu_item" role="menuitem" onClick={() => go("/library")}>
                            <LibraryIcon size={18} /><span>Library</span>
                        </button>
                        <button className="user_menu_item" role="menuitem" onClick={() => go("/feed")}>
                            <FeedIcon size={18} /><span>Feed</span>
                        </button>
                        */}
                        <button className="user_menu_item user_menu_item_wide" role="menuitem" onClick={() => go("/favorite")}>
                            <span className="user_menu_item_main"><HeartIcon size={18} /><span>Favorite</span></span>
                            <span>({favCount})</span>
                        </button>
                        <div className="user_menu_item user_menu_item_wide">
                            <span className="user_menu_item_main"><SunIcon size={18} /><span>Mode: day/night</span></span>
                            <button
                                className={`user_menu_toggle ${light ? "on" : ""}`}
                                role="switch"
                                aria-checked={light}
                                aria-label="Mode: day/night"
                                onClick={toggleLight}
                            >
                                <span className="user_menu_toggle_knob" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------- Notifications (design: favorite, variant 3) ---------------- */

// Text from the design. The backend has no notifications API, so we show a static announcement.
const NOTIFICATION: { title: string; blocks: string[][] } = {
    title: "❄️ Winter mood at Allure ❄️",
    blocks: [
        ["When it's cold and snowy outside 🌨️ — it's time to turn on the music 🎧"],
        ["🎶 Favorite tracks", "🔥 Hot hits", "🎵 Music for work, relaxation and mood", "✨ The sound that warms this winter"],
        ["💎 Do you want even more comfort?", "With Allure PRO — no ads, maximum sound quality and complete immersion in music 🎶"],
        ["This is the perfect option for long winter evenings ❄️"],
        ["Winter goes by faster when there's music around 💜"],
        ["Choose Allure PRO and fill every day with rhythm ✨🎧"],
    ],
};

export const NotificationsMenu: React.FC = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = React.useCallback(() => setOpen(false), []);
    useDismiss(open, close, ref);

    return (
        <div className="hdr_notify" ref={ref}>
            <button className="hdr_icon_btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Notifications">
                <img src="/inside/iconamoon-notification-light.svg" alt="" width={24} height={24} />
            </button>
            {open && (
                <div className="notify_menu" role="dialog" aria-label="Notifications">
                    <div className="notify_menu_scroll">
                        <div className="notify_block">
                            <span className="notify_title">{NOTIFICATION.title}</span>
                            {NOTIFICATION.blocks[0].map((l) => <span key={l}>{l}</span>)}
                        </div>
                        {NOTIFICATION.blocks.slice(1).map((block, i) => (
                            <div key={i} className="notify_block notify_block_tight">
                                {block.map((l) => <span key={l}>{l}</span>)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ThemeIconButton: React.FC = () => {
    const [, toggleLight] = useThemeMode();
    return (
        <button className="hdr_icon_btn" onClick={toggleLight} aria-label="Mode: day/night">
            <img src="/inside/streamline-sharp-light-dark-mode.svg" alt="" width={24} height={24} />
        </button>
    );
};
