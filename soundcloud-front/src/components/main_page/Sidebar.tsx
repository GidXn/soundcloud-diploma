import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/main_pages/sidebar.css";
import "../../styles/main_pages/people/layout.css";

// Роки для «Топ року» в розгорнутому меню
const TOP_YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

interface SidebarItem {
    label: string;
    menuLabel?: string; // підпис у розгорнутому меню (макет «full menu»)
    icon: string;
    path: string;
    id: string;
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Esc закриває розгорнуте меню
    React.useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMenuOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isMenuOpen]);

    const sidebarItems: SidebarItem[] = [
        {
            id: "hide",
            label: "Сховати сайд бар",
            icon: "/inside/material-symbols-menu-rounded.svg",
            path: "",
        },
        {
            id: "home",
            menuLabel: "Home",
            label: "Додому",
            icon: "/inside/iconamoon-home-thin.svg",
            path: "/home",
        },
        {
            id: "music",
            menuLabel: "Music",
            label: "Музика",
            icon: "/inside/mdi-light-music.svg",
            path: "/music",
        },
        {
            id: "genres",
            menuLabel: "Genres",
            label: "Жанри",
            icon: "/inside/stash-square-light.svg",
            path: "/genres",
        },
        {
            id: "albums",
            menuLabel: "Albums",
            label: "Альбоми",
            icon: "/inside/ion-albums-outline.svg",
            path: "/albums",
        },
        {
            id: "artists",
            menuLabel: "Performers",
            label: "Артисти",
            icon: "/inside/weui-contacts-outlined.svg",
            path: "/artists",
        },
        {
            id: "charts",
            menuLabel: "Charts",
            label: "Чарти",
            icon: "/inside/f-7-menu.svg",
            path: "/charts",
        },
        {
            id: "top100",
            menuLabel: "Popular",
            label: "Топ 100 місяця",
            icon: "/inside/uit-favorite.svg",
            path: "/top-100",
        },
        {
            id: "radio",
            menuLabel: "Radio",
            label: "Радіо",
            icon: "/inside/material-symbols-light-radio-outline.svg",
            path: "/radio",
        },
    ];

    const isActive = (itemPath: string): boolean => {
        if (!itemPath || itemPath === "#") return false;
        return location.pathname.startsWith(itemPath);
    };

    const handleNavigation = (item: SidebarItem): void => {
        if (item.id === "hide") {
            // Гамбургер відкриває повне меню (макет «full menu»)
            setIsMenuOpen((v) => !v);
            return;
        }
        if (item.path && item.path !== "#") {
            setIsMenuOpen(false);
            navigate(item.path);
        }
    };

    return (
        <>
            {!isExpanded && (
                <button
                    className="sidebar_toggle_btn"
                    onClick={() => setIsExpanded(true)}
                    title="Показати сайд бар"
                >
                    <img src="/inside/material-symbols-menu-rounded.svg" alt="Menu" />
                </button>
            )}

            {isExpanded && (
                <nav className="sidebar_container">
                    {sidebarItems.map((item) => (
                        <div
                            key={item.id}
                            className={`sidebar_item ${isActive(item.path) ? "active" : ""}`}
                            onClick={() => handleNavigation(item)}
                            title={item.label}
                        >
                            <img
                                src={item.icon}
                                alt={item.label}
                                className={`sidebar_icon ${
                                    isActive(item.path) ? "active" : ""
                                }`}
                            />
                            {isActive(item.path) && <div className="sidebar_indicator"></div>}
                        </div>
                    ))}
                </nav>
            )}

            {isMenuOpen && (
                <div className="full_menu" role="dialog" aria-label="Меню">
                    <nav className="full_menu_panel">
                        <div className="full_menu_head">
                            <button className="full_menu_burger" onClick={() => setIsMenuOpen(false)} aria-label="Закрити меню">
                                <img src="/inside/material-symbols-menu-rounded.svg" alt="" />
                            </button>
                            <span className="full_menu_logo">Allure</span>
                        </div>
                        <ul className="full_menu_items">
                            {sidebarItems.filter((i) => i.id !== "hide").map((item) => (
                                <li key={item.id}>
                                    <button
                                        className={`full_menu_item ${isActive(item.path) ? "active" : ""}`}
                                        onClick={() => handleNavigation(item)}
                                    >
                                        <img src={item.icon} alt="" className="full_menu_icon" />
                                        <span>{item.menuLabel || item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="full_menu_line" />
                        <div className="full_menu_years">
                            {TOP_YEARS.map((y) => (
                                <button
                                    key={y}
                                    className={`full_menu_year ${location.pathname === `/top/${y}` ? "active" : ""}`}
                                    onClick={() => { setIsMenuOpen(false); navigate(`/top/${y}`); }}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </nav>
                    <div className="full_menu_backdrop" onClick={() => setIsMenuOpen(false)} />
                </div>
            )}
        </>
    );
};

export default Sidebar;
