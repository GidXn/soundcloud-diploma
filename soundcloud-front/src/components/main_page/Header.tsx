import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
//
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/userSlice.ts";
import '../../styles/main_pages/header.css';
import {IUser} from "../../types/user.ts";
import {getCurrentUser} from "../../services/User/user_info.ts";


// import logoWave from "../../images/logo/logo_WaveCloud.png";
import people from "../../images/search_bar/people.png";
import white_arrow_down from "../../images/icons/white_arrow_down.png";
import profile from "../../images/icons/profile.png";
import search from "../../images/search_bar/search.png";
import logout2 from "../../images/icons/logout.png";


const Header: React.FC = () => {
    const [user, setUser] = useState<IUser | null>(null);

    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(false); // створюємо state
    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);

    const getUserImageUrl = (user?: IUser | null) => {
        if (!user || !user.avatar) return "/default-cover.png";
        return `http://localhost:5122/${user.avatar}`;
    };
    console.log("Avatar "+ user?.avatar);


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
    console.log("Token service", localStorage.getItem("token"));
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
                                               className="search_input_home_page"/>
                                    </div>
                                </div>

                                {/* User profile on the far right */}
                                <div className="baloo2 header_profile_image_container" style={{position: 'relative'}}>
                                    <div className="user_avatar">
                                        {user?.avatar ? (
                                            <img className="image_container_user" src={getUserImageUrl(user)}
                                                 alt="people" width="48" height="48"/>
                                        ) : (
                                            <img className="image_container_user"
                                                 src={people}
                                                 alt="people" width="35" height="35"/>
                                        )}
                                    </div>
                                    <div
                                        className="user_drop_bar cursor-pointer"
                                        onClick={() => setOpen((prev) => !prev)}
                                    >
                                        <img
                                            src={white_arrow_down}
                                            className="search_logo_home_page"
                                            alt="arrow"
                                            style={{width: '24px', height: '24px'}}
                                        />
                                    </div>
                                    {open && (
                                        <div className="absolute right-0 top-full mt-2 w-40 bg-darkpurple rounded-lg shadow-lg z-50">
                                            <ul className="flex flex-col text-gray-800">
                                                <li className="flex flex-row items-center gap-2 px-4 py-2
                                                font-semibold hover:bg-purple cursor-pointer rounded-lg text-lightpurple"
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setOpen(prev => !prev);
                                                    }}>
                                                    <img
                                                        src={profile}
                                                        width="22px"
                                                        height="22px"
                                                        alt="arrow"
                                                    />
                                                    Profile
                                                </li>
                                                <li className="flex flex-row items-center gap-2 px-4 py-2
                                                font-semibold hover:bg-purple cursor-pointer rounded-lg text-lightpurple"
                                                onClick={() => Logout()}
                                                >
                                                    <img
                                                        src={logout2}
                                                        width="22px"
                                                        height="22px"
                                                        alt="arrow"
                                                    />
                                                    Logout
                                                </li>
                                            </ul>
                                        </div>
                                    )}
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
