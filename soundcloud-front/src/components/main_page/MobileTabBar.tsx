import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface TabItem {
    id: string;
    label: string;
    path: string;
    icon: string;
}

// Нижній таб-бар для телефону (макет Figma, сторінка "mobile version").
// Показується тільки на ширині <= 640px, див. styles/responsive.css.
const tabs: TabItem[] = [
    { id: "home", label: "Home", path: "/home", icon: "/inside/iconamoon-home-thin.svg" },
    { id: "music", label: "Music", path: "/music", icon: "/inside/mdi-light-music.svg" },
    { id: "albums", label: "Albums", path: "/albums", icon: "/inside/ion-albums-outline.svg" },
    { id: "profile", label: "Profile", path: "/profile", icon: "/inside/weui-contacts-outlined.svg" },
];

const MobileTabBar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="mobile_tab_bar" aria-label="Main navigation">
            {tabs.map((tab) => {
                const active = location.pathname.startsWith(tab.path);
                return (
                    <button
                        key={tab.id}
                        type="button"
                        className={`mobile_tab_bar_item ${active ? "active" : ""}`}
                        onClick={() => navigate(tab.path)}
                        aria-label={tab.label}
                        aria-current={active ? "page" : undefined}
                    >
                        <img src={tab.icon} alt="" className="mobile_tab_bar_icon" />
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileTabBar;
