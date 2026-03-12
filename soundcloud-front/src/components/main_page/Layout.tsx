import React, { useMemo } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import Sidebar from "./Sidebar.tsx";
import Player from "../player/Player.tsx";
import "../../styles/General.css";
import "../../index.css";

const Layout: React.FC = () => {
    const location = useLocation();

    // Map routes to background images
    const getBackgroundImage = useMemo(() => {
        const path = location.pathname;

        if (path.startsWith('/home')) return 'home-bg.png';
        if (path.startsWith('/music')) return 'music-bg.png';
        if (path.startsWith('/feed')) return 'music-bg.png'; // Using music-bg.png for feed
        if (path.startsWith('/library')) return 'music-bg.png'; // Using music-bg.png for library
        if (path.startsWith('/profile')) return 'home-bg.png'; // Using home-bg.png for profile
        if (path.startsWith('/genres')) return 'genres-bg.png';
        if (path.startsWith('/albums')) return 'albums-bg.png';
        if (path.startsWith('/artists')) return 'artist-bg.png';
        if (path.startsWith('/charts')) return 'charts-bg.png';
        if (path.startsWith('/top-100')) return 'top100-bg.png';
        if (path.startsWith('/radio')) return 'radio-bg.png';
        if (path.startsWith('/admin')) return 'home-bg.png'; // Using home-bg.png for admin

        return 'home-bg.png'; // Default fallback
    }, [location.pathname]);

    const contentStyle: React.CSSProperties = {
        '--page-bg': `url('/inside/${getBackgroundImage}')`,
    } as React.CSSProperties;

    return(
        <>
            <Sidebar />
            <div className="layout_container">
                <div className="main_content_wrapper">
                    <div>
                        <Header/>
                    </div>

                    <div className="content_container" style={contentStyle}>
                        <Outlet/>
                    </div>
                    <div className="footer_container">
                        <Footer/>
                    </div>
                    <Player footerSelector=".footer_container" />
                </div>
            </div>
        </>
    );
}
export default Layout;