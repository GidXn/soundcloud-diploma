import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/main_pages/sidebar.css";

interface SidebarItem {
    label: string;
    icon: string;
    path: string;
    id: string;
}

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = React.useState(true);

    const sidebarItems: SidebarItem[] = [
        {
            id: "hide",
            label: "Сховати сайд бар",
            icon: "/inside/material-symbols-menu-rounded.svg",
            path: "",
        },
        {
            id: "home",
            label: "Додому",
            icon: "/inside/iconamoon-home-thin.svg",
            path: "/home",
        },
        {
            id: "music",
            label: "Музика",
            icon: "/inside/mdi-light-music.svg",
            path: "/music",
        },
        {
            id: "genres",
            label: "Жанри",
            icon: "/inside/stash-square-light.svg",
            path: "/genres",
        },
        {
            id: "albums",
            label: "Альбоми",
            icon: "/inside/ion-albums-outline.svg",
            path: "/albums",
        },
        {
            id: "artists",
            label: "Артисти",
            icon: "/inside/weui-contacts-outlined.svg",
            path: "/artists",
        },
        {
            id: "charts",
            label: "Чарти",
            icon: "/inside/f-7-menu.svg",
            path: "/charts",
        },
        {
            id: "top100",
            label: "Топ 100 місяця",
            icon: "/inside/uit-favorite.svg",
            path: "/top-100",
        },
        {
            id: "radio",
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
            setIsExpanded(false);
            return;
        }
        if (item.path && item.path !== "#") {
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
        </>
    );
};

export default Sidebar;
