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

                <header className="header_container_main">
                        <div className="header_logo">
                            <div className="w-[56px] h-[56px] xl:mr-[12px] lg:mr-[12px]">
                                <img src="/logo_Vector.svg" alt="logo"/>
                            </div>
                        </div>

                        <div className="header_profile_container_main">
                            {isLogin ? (
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                    {/* Search section on the left */}
                                    <div className="search_container_home_page">
                                        <div className="search_bar_home_page">
                                            <div>
                                                <img src={search}
                                                     className="search_logo_home_page"
                                                     alt="search"/>
                                            </div>
                                            <div>
                                                <input type="text"
                                                       placeholder="Search for artists, bands, tracks or music"
                                                       className="search_input_home_page baloo2"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User profile on the right */}
                                    <div className="baloo2 header_profile_image_container">
                                        <div className="user_avatar">
                                            {user?.avatar ? (
                                                <img className="image_container_user" src={getUserImageUrl(user)}
                                                     alt="people" width="32" height="32"/>
                                            ) : (
                                                <img className="image_container_user"
                                                     src={people}
                                                     alt="people" width="22" height="22"/>
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
                                            />
                                        </div>
                                        {open && (
                                            <div className="absolute right-16 top-full mt-2 w-40 bg-darkpurple rounded-lg shadow-lg z-50">
                                                <ul className="flex flex-col text-gray-800">
                                                    <li className="flex flex-row items-center gap-2 px-4 py-2
                                                    font-semibold hover:bg-purple cursor-pointer rounded-lg text-lightpurple"
                                                        onClick={() => {
                                                            navigate("/profile");
                                                            setOpen(prev => !prev);
                                                        }}>
                                                        <img
                                                            src={profile}
                                                            width="20px"
                                                            height="20px"
                                                            alt="arrow"
                                                        />
                                                        Profile
                                                    </li>
                                                    <li className="flex flex-row items-center gap-2 px-4 py-2 px-4 py-2
                                                    font-semibold hover:bg-purple cursor-pointer rounded-lg text-lightpurple"
                                                    onClick={() => Logout()}
                                                    >
                                                        <img
                                                            src={logout2}
                                                            width="20px"
                                                            height="20px"
                                                            alt="arrow"
                                                        />
                                                        Logout
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            ) : (
                                <div>
                                    <div className="baloo2 header_profile_container_main">
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
                                    <div className="search_container_home_page">
                                        <div className="people_container">
                                            <img className="image_container" src={people}
                                                 alt="people"/>
                                        </div>
                                        <div className="search_bar_home_page">
                                            <div>
                                                <img src={search}
                                                     className="search_logo_home_page"
                                                     alt="search"/>
                                            </div>
                                            <div>
                                                <input type="text"
                                                       placeholder="Search for artists, bands, tracks or music"
                                                       className="search_input_home_page baloo2"/>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            )}
                    </div>

                    <div>
                    </div>
                </header>
            </div>
        </>
    );
};
export default Header;
