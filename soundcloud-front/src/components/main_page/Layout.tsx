import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import Sidebar from "./Sidebar.tsx";
import Player from "../player/Player.tsx";
import "../../styles/General.css";
import "../../index.css";

const Layout: React.FC = () => {

    return(
        <>
            <Sidebar />
            <div className="layout_container">
                <div className="main_content_wrapper">
                    <div>
                        <Header/>
                    </div>

                    <div className="content_container">
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