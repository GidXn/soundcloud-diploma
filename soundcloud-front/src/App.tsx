// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/main_page/Layout.tsx";
import Layout_login_page from "./components/login_signup_components/Layout_login_page.tsx";
import HomePage from "./pages/main_pages/HomePage";
import Login from "./pages/login_signup/Login";
import Signup from "./pages/login_signup/Signup";
import LibraryPage from "./pages/main_pages/LibraryPage.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import PlayAlbumPage from "./pages/play_album/PlayAlbumPage.tsx";
import PlayPlaylistPage from "./pages/play_playlist/PlayPlaylistPage.tsx";
import './index.css';
import FeedPage from "./pages/main_pages/FeedPage.tsx";
import MusicPage from "./pages/main_pages/MusicPage.tsx";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setUser} from "./store/slices/userSlice.ts";
import {normalizeUser} from "./utilities/normalizeUser.ts";
import SetPassword from "./pages/login_signup/SetPassword";
import { Navigate } from "react-router-dom";

//імпорти для адмінки

import AdminLayout from "./pages/admin/AdminLayout";
import UsersPage from "./pages/admin/UsersPage";
import TracksPage from "./pages/admin/TracksPage";
import AlbumsPage from "./pages/admin/AlbumsPage.tsx";
import CategoriesPage from "./pages/admin/CategoriesPage.tsx";
import PlaylistsPage from "./pages/admin/PlaylistsPage.tsx";
import AdminPage from "./pages/admin/AdminPage.tsx";
import SearchPage from "./pages/main_pages/SearchPage.tsx";
import {usePlayerStore} from "./store/player_store.tsx";
import UserProfilePage from "./pages/profile/UserProfilePage.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/login_signup/ResetPassword";
import GenresPage from "./pages/main_pages/GenresPage";
import AlbumsCollectionPage from "./pages/main_pages/AlbumsCollectionPage.tsx";
import ArtistsPage from "./pages/main_pages/ArtistsPage";
import ChartsPage from "./pages/main_pages/ChartsPage";
import Top100Page from "./pages/main_pages/Top100Page";
import RadioPage from "./pages/main_pages/RadioPage";


export default function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const user = normalizeUser(token);
            if (user) {
                dispatch(setUser({ user, token }));
            }
            console.log("init user", user);
        }
    }, [dispatch]);
    const initHistory = usePlayerStore((state) => state.initHistory);

    useEffect(() => {
        initHistory(); // ✅ підтягнемо історію з localStorage
    }, [initHistory]);
    return (
        <Router>
            <Routes>
                {/* Сторінка логіну */}
                <Route element={<Layout_login_page/>}>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login/>} />
                    <Route path="/signup" element={<Signup/>} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                    <Route path="/reset-password" element={<ResetPasswordPage/>}/>
                </Route>

                {/* Головний Layout_LS */}
                <Route element={<Layout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/music" element={<MusicPage />} />
                    {/* <Route path="/library" element={<LibraryPage />} />
                    <Route path="/genres" element={<GenresPage />} /> */}
                    <Route path="/albums" element={<AlbumsCollectionPage />} />
                    {/* <Route path="/artists" element={<ArtistsPage />} />
                    <Route path="/charts" element={<ChartsPage />} />
                    <Route path="/top-100" element={<Top100Page />} />
                    <Route path="/radio" element={<RadioPage />} /> */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/play-album/:id" element={<PlayAlbumPage />} />
                    <Route path="/play-playlist/:id" element={<PlayPlaylistPage />} />
                    <Route path="/user/:id" element={<UserProfilePage />} /> {/* для інших користувачів */}
                    <Route path="/search-page" element={<SearchPage/>}/>
                    <Route path="/set-password" element={<SetPassword />} />
                </Route>

                {/*  Адмінка (ОКРЕМО, без Layout) */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="tracks" element={<TracksPage />} />
                    <Route path="albums" element={<AlbumsPage />} />
                    {/* <Route path="categories" element={<CategoriesPage />} /> */}
                    <Route path="playlists" element={<PlaylistsPage />} />
                    <Route path="admin" element={<AdminPage />} />
                </Route>
            </Routes>
        </Router>
    );
}