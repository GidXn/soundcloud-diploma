import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
//
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/userSlice.ts";
import '../../styles/main_pages/header.css';
import {IUser} from "../../types/user.ts";
import {getCurrentUser} from "../../services/User/user_info.ts";
import {useSubscriptionStore} from "../../store/subscription_store.ts";
import {NotificationsMenu, ThemeIconButton, UserMenu} from "../people/HeaderMenus.tsx";


// import logoWave from "../../images/logo/logo_WaveCloud.png";


const Header: React.FC = () => {
    const [user, setUser] = useState<IUser | null>(null);
    const isPro = useSubscriptionStore((s) => s.plan !== "free");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(false); // create state
    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);



    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLogin(!!token);
    }, []);
    const Logout = ()=>
    {
        dispatch(logout());
        logout();
        navigate("/");
    }
    console.log("header user", user);
    return (
        <>
            <div className="max-w-screen-full-xl">

                <header className="header_container_main" style={{justifyContent: 'space-between'}}>
                        <div className="header_logo">
                            <img src="/logo_Allurew.png" alt="logo"/>
                        </div>

                        {isLogin ? (
                            <>
                                {/* Search section in the middle */}
                                <div className="search_container_home_page">
                                    <div className="search_bar_home_page">
                                        <img src="/inside/material-symbols-search.svg"
                                             className="search_logo_home_page"
                                             alt="search"/>
                                        <input type="text"
                                               placeholder="Search"
                                               className="search_input_home_page"
                                               onKeyDown={(e) => {
                                                   const value = e.currentTarget.value.trim();
                                                   if (e.key === "Enter" && value) {
                                                       navigate(`/search-page?q=${encodeURIComponent(value)}`);
                                                   }
                                               }}/>
                                    </div>
                                </div>

                                {/* Right side of the header from the design: Get Pro, theme, notifications, user menu */}
                                <div className="hdr_right">
                                    <button className="hdr_get_pro" onClick={() => navigate("/subscribe")}>
                                        <img src="/inside/tabler-crown.svg" alt="" width={24} height={24}/>
                                        <span>{isPro ? "Pro" : "Get Pro"}</span>
                                    </button>
                                    <div className="hdr_actions">
                                        <div className="hdr_icons">
                                            <ThemeIconButton/>
                                            <NotificationsMenu/>
                                        </div>
                                        <UserMenu user={user} onLogout={Logout}/>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
                                <button className="baloo2 w-[124px] h-[56px]
                                bg-lightpurple rounded-[50px] text-[20px] font-bold button_hover_signup text-black"
                                        onClick={() => navigate("/")}
                                >Sign in
                                </button>
                                <button className="baloo2 w-[200px] h-[56px] text-white text-[20px]
                                bg-purple rounded-[50px] font-bold button_hover_create_account"
                                        onClick={() => navigate("/")}
                                >Create account
                                </button>
                            </div>
                        )}
                </header>
            </div>
        </>
    );
};
export default Header;
