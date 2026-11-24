import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface MobileMenuProps {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
    username?: string;
    avatarSrc: string;
}

// Бокове меню користувача для телефону (Figma: mobile version, фрейм меню по аватару).
const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose, onLogout, username, avatarSrc }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    const go = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <div className="mobile_menu_overlay" onClick={onClose}>
            <aside className="mobile_menu" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="User menu">
                <button type="button" className="mobile_menu_close" onClick={onClose} aria-label="Close menu">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L15 15M15 1L1 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="mobile_menu_user">
                    <img className="mobile_menu_avatar" src={avatarSrc} alt="" />
                    <div className="mobile_menu_username">{username || "User"}</div>
                </div>

                <ul className="mobile_menu_list">
                    <li>
                        <button type="button" onClick={() => go("/profile")}>
                            <img src="/inside/weui-contacts-outlined.svg" alt="" />
                            Profile
                        </button>
                    </li>
                    <li>
                        <button type="button" onClick={() => go("/albums")}>
                            <img src="/inside/ion-albums-outline.svg" alt="" />
                            Albums
                        </button>
                    </li>
                </ul>

                <button type="button" className="mobile_menu_logout" onClick={onLogout} aria-label="Log out">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 4H5v16h9M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5" stroke="#E5484D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Log out</span>
                </button>
            </aside>
        </div>
    );
};

export default MobileMenu;
