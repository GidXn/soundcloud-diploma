import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";

import "../../App.css";
import "../../styles/login_signup/background.css"

const Layout_login_page: React.FC = () => {
    return(
        <>
            <div className="background_style min-h-screen relative z-0 relative">
                <div className="">
                    <Header />
                </div>
                <div className="flex-1 z-20">
                    <Outlet />
                </div>

            </div>
        </>
    );
}
export default Layout_login_page;