import React, {useEffect, useRef, useState} from 'react';

import "../../styles/main_pages/home_page/layout.css"
import {trackService} from "../../services/trackApi.ts";
import {ITrack} from "../../types/track.ts";
import {IAlbum} from "../../types/album.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import {IUser} from "../../types/user.ts";
import {getCurrentUser, getTopUsers} from "../../services/User/user_info.ts";
import { followService } from "../../services/followApi.ts";
import {useNavigate} from "react-router-dom";
import { albumService } from '../../services/albumAPI.ts';
//import { IUserFollow } from "../../types/follow.ts";


const HomePage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [albums, setAlbums] = useState<IAlbum[]>([]);


    const addtoHistory = usePlayerStore(state => state.addToHistory);


    const history = usePlayerStore(state => state.history);
    const initHistory = usePlayerStore(state => state.initHistory);
    useEffect(() => {
        initHistory();
    }, [initHistory]);

    const playTrack = usePlayerStore(state => state.playTrack);

    const scrollMore = useRef<HTMLDivElement>(null);
    const scrollRecently = useRef<HTMLDivElement>(null);
    const scrollArtist = useRef<HTMLDivElement>(null);
    const scrollGenre = useRef<HTMLDivElement>(null);
    const scrollDiscover = useRef<HTMLDivElement>(null);

    const [showLeftMore, setShowLeftMore] = useState(false);
    const [showRightMore, setShowRightMore] = useState(false);

    const [showLeftRecently, setShowLeftRecently] = useState(false);
    const [showRightRecently, setShowRightRecently] = useState(false);

    const [showLeftArtist, setShowLeftArtist] = useState(false);
    const [showRightArtist, setShowRightArtist] = useState(false);

    const [showLeftGenre, setShowLeftGenre] = useState(false);
    const [showRightGenre, setShowRightGenre] = useState(false);

    const [showLeftDiscover, setShowLeftDiscover] = useState(false);
    const [showRightDiscover, setShowRightDiscover] = useState(false);




    useEffect(() => {
        // функція для оновлення кнопок конкретного контейнера
        const attachScrollListener = (
            ref: React.RefObject<HTMLDivElement | null>,
            setLeft: React.Dispatch<React.SetStateAction<boolean>>,
            setRight: React.Dispatch<React.SetStateAction<boolean>>
        ) => {
            const container = ref.current;
            if (!container) return () => {}; // повертаємо пустий cleanup

            const updateButtons = () => {
                setLeft(container.scrollLeft > 0);
                setRight(container.scrollLeft + container.clientWidth < container.scrollWidth);
            };

            updateButtons();

            container.addEventListener("scroll", updateButtons);
            window.addEventListener("resize", updateButtons);

            return () => {
                container.removeEventListener("scroll", updateButtons);
                window.removeEventListener("resize", updateButtons);
            };
        };

        // підключаємо обидва контейнера
        const cleanupMore = attachScrollListener(scrollMore, setShowLeftMore, setShowRightMore);
        const cleanupRecently = attachScrollListener(scrollRecently, setShowLeftRecently, setShowRightRecently);
        const cleanupArtist = attachScrollListener(scrollArtist, setShowLeftArtist, setShowRightArtist);
        const cleanupGenre = attachScrollListener(scrollGenre, setShowLeftGenre, setShowRightGenre);
        const cleanupDiscover = attachScrollListener(scrollDiscover, setShowLeftDiscover, setShowRightDiscover);

        // повертаємо cleanup обох
        return () => {
            cleanupMore?.();
            cleanupRecently?.();
            cleanupArtist?.();
            cleanupGenre?.();
            cleanupDiscover?.();

        };
    }, [tracks]);


    const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollBy({ left: -200, behavior: "smooth" });
    };

    const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollBy({ left: 200, behavior: "smooth" });
    };


    useEffect(() => {
        albumService.getAllAlbums()
            .then((data) => setAlbums(data))
            .catch((err) => console.error(err));
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));

    }, []);
    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${track.imageUrl}`;
    };
    const getAlbumImageUrl = (album?: IAlbum | null) => {
        if (!album || !album.coverUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122/${album.coverUrl}`;
    };
    const getUserAvatarUrl = (user: IUser) => {
        if (!user.avatar) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${user.avatar}`;
    };
    const [users, setUsers] = useState<IUser[]>([]);
    const topCount = 5;
    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getTopUsers(topCount);
            setUsers(data);
        };

        fetchUsers();
    }, []);




    //для лайків
    const [likedTracksIds, setLikedTracksIds] = useState<number[]>([]);
    useEffect(() => {
        trackService.getAll()
            .then((data) => {
                setTracks(data);
                const likedIds = data.filter(t => t.isLikedByCurrentUser).map(t => t.id);
                setLikedTracksIds(likedIds);
            })
            .catch((err) => console.error(err));
    }, []);

    const toggleLike = async (track: ITrack) => {
        try {
            if (likedTracksIds.includes(track.id)) {
                // анлайк
                await trackService.unlike(track.id);
                setLikedTracksIds(prev => prev.filter(id => id !== track.id));
                track.isLikedByCurrentUser = false; // оновлюємо локально
                addtoHistory(track);
                trackService.getAll()
            } else {
                // лайк
                await trackService.like(track.id);
                setLikedTracksIds(prev => [...prev, track.id]);
                track.isLikedByCurrentUser = true; // оновлюємо локально
                addtoHistory(track);
                trackService.getAll()
            }
        } catch (err) {
            console.error("Error liking track:", err);
        }
    };

    function formatTimeSpan(ts: string): string {
        const [h, m, s] = ts.split(":");
        const seconds = s.split(".")[0];

        const totalMinutes = Number(h) * 60 + Number(m);
        return `${totalMinutes}:${seconds}`;
    }

    //для follow
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const topUsers = await getTopUsers(4); // беремо топ юзерів
                const usersWithStatus = await Promise.all(
                    topUsers.map(async (u) => {
                        try {
                            const status = await followService.getFollowStatus(u.id);
                            return { ...u, isFollowing: status.isFollowing };
                        } catch {
                            return { ...u, isFollowing: false };
                        }
                    })
                );
                setUsers(usersWithStatus);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const toggleFollow = async (userId: number) => {
        try {
            setUsers(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
                )
            );

            const user = users.find(u => u.id === userId);
            if (!user) return;

            if (user.isFollowing) {
                await followService.unfollow(userId);
            } else {
                await followService.follow(userId);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    // метод для переходу на профіль
    const navigate = useNavigate();

    const goToUserProfile = (userId: number) => {
        navigate(`/user/${userId}`);
    };

    return (
        <main className="layout_container mb-[1750px]">
            <div className="first_first_container relative">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    Albums
                </div>

                {/* {showLeftMore && (
                    <button
                        className="button_side_bar_left_container"
                        onClick={() => scrollLeft(scrollMore)}
                    >
                        <img src="src/images/icons/arrow_left_side_bar.png"
                             alt="ArrowLeft"/>
                    </button>
                )}
                {showRightMore && (
                    <button
                        className="button_side_bar_right_container"
                        onClick={() => scrollRight(scrollMore)}
                    >
                        <img src="src/images/icons/arrow_right_side_bar.png"
                             alt="ArrowRight"/>
                    </button>
                )} */}
                <div
                    className="first_first_container_album flex overflow-x-auto gap-4 py-4"
                    ref={scrollMore}
                >
                    {albums.map(album => (
                        <li className="first_first_album flex-shrink-0 w-40" key={album.id}>
                            <img
                                className="album_image_home_page"
                                src={getAlbumImageUrl(album)}
                                alt=""
                                // onClick={() => playAlbum(album, albums)}
                            />
                            <div className="album_information_container">
                    <span className="album_name baloo2">
                        {album.title.length > 16 ? album.title.slice(0, 16) + "…" : album.title}
                    </span>
                                <span className="album_author_home_page baloo2">{album.ownerName}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
            <div className="second_first_container">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    Novelty
                </div>
                <div className="frame-548">

                    {tracks.map((track, index) => (
                    <>
                        {index !== 0 &&
                    <svg className={"vector-9"} width="1527" height="1" viewBox="0 0 1527 1" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.5 0.5H1526.5" stroke="#64707C" stroke-linecap="round"/>
                    </svg>}

                    <div className="frame-359">
                        <div className="frame-349">
                            <img className="rounded-rectangle" src={getTrackImageUrl(track)} alt=""/>
                            <div className="frame-322">
                                <div className="adore-you">{track.title}</div>
                            </div>
                        </div>
                        <div className="frame-358">
                            <div className="frame-356">
                                <div className="harry-styles">{track.author}</div>
                                <div className="pop-rock">{track.genre}</div>
                                <div className="frame-355">
                                </div>
                            </div>
                            <div className="frame-357">
                                <svg className="icon-park-outline-like" width="22" height="20" viewBox="0 0 22 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M6.5 1C3.4625 1 1 3.4625 1 6.5C1 12 7.5 17 11 18.163C14.5 17 21 12 21 6.5C21 3.4625 18.5375 1 15.5 1C13.64 1 11.995 1.9235 11 3.337C10.4928 2.61469 9.81897 2.0252 9.03568 1.61841C8.25238 1.21162 7.38263 0.999502 6.5 1Z"
                                        stroke="#9E7FCF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>

                                <div className="_3-39">{formatTimeSpan(track.duration)}</div>
                            </div>
                        </div>
                    </div></>))}
                </div>
            </div>
            {/* <div className="third_first_container">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    ARTIST TO WATCH OUT FOR
                </div>
                {showLeftArtist && (
                    <button
                        className="button_side_bar_left_container"
                        onClick={() => scrollLeft(scrollArtist)}
                    >
                        <img src="src/images/icons/arrow_left_side_bar.png" alt="ArrowLeft"/>
                    </button>
                )}
                {showRightArtist && (
                    <button
                        className="button_side_bar_right_container"
                        onClick={() => scrollRight(scrollArtist)}
                    >
                        <img src="src/images/icons/arrow_right_side_bar.png" alt="ArrowRight"/>
                    </button>
                )}
                <div className="first_first_container_track" ref={scrollArtist}>
                    {users.length === 0 ? (
                        <div className="user_info_container">
                            <span className="txt_style">You don`t have Followings</span>
                        </div>
                    ) : (
                        users.map(u => (
                            <li key={u.id} className="first_first_track">
                                <img
                                    className="following_img_style"
                                    src={getUserAvatarUrl(u)}
                                    alt="avatar"
                                    onClick={() => goToUserProfile(u.id)}
                                />
                                <div className="track_information_container">
                                    <span className="track_name baloo2">{u.username}</span>
                                </div>
                            </li>
                        ))
                    )}
                </div>
            </div> */}
            {/* <div className="playlist_container">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    PLAYLIST
                </div>
                <div className="first_first_container_track">
                    <span
                        className="text-white text-lightpurple font-size-2xl font-bold">You don`t have Playlists</span>
                    {tracks.map(track => (
                       <li className="first_first_track" key={track.id}>
                           <img className="track_image" src={getTrackImageUrl(track)} alt={""}
                                onClick={() => playTrack(track)}
                           />
                           <div className="track_information_container">
                               <span className="track_name baloo2">{track.title}</span>
                               <span className="track_author baloo2">{track.author}</span>
                           </div>
                       </li>
                    ))}
                </div>
            </div> */}
            <div className="trending_by_genre_container">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    Popular albums
                </div>
                {showLeftGenre && (
                    <button
                        className="button_side_bar_left_container"
                        onClick={() => scrollLeft(scrollGenre)}
                    >
                        <img src="src/images/icons/arrow_left_side_bar.png"
                             alt="ArrowLeft"/>
                    </button>
                )}
                {showRightGenre && (
                    <button
                        className="button_side_bar_right_container"
                        onClick={() => scrollRight(scrollGenre)}
                    >
                        <img src="src/images/icons/arrow_right_side_bar.png"
                             alt="ArrowRight"/>
                    </button>
                )}
                <div className="first_first_container_track" ref={scrollGenre}>
                    {tracks.map(track => (
                        <li className="first_first_track" key={track.id}>
                            <img className="track_image_home_page" src={getTrackImageUrl(track)} alt={""}
                                 onClick={() => playTrack(track, tracks)}
                            />
                            <div className="track_information_container">
                                <span className="track_name baloo2">
                                    {track.title.length > 16 ? track.title.slice(0, 16) + "…" : track.title}
                                </span>
                                <span className="track_author_home_page baloo2">{track.author}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
            <div className="discover_new_songs_container">
                <div className="first_first_container_text baloo2 text-lightpurple text-[24px] font-bold">
                    Novelty
                </div>
                {showLeftDiscover && (
                    <button
                        className="button_side_bar_left_container"
                        onClick={() => scrollLeft(scrollDiscover)}
                    >
                        <img src="src/images/icons/arrow_left_side_bar.png"
                             alt="ArrowLeft"/>
                    </button>
                )}
                {showRightDiscover && (
                    <button
                        className="button_side_bar_right_container"
                        onClick={() => scrollRight(scrollDiscover)}
                    >
                        <img src="src/images/icons/arrow_right_side_bar.png"
                             alt="ArrowRight"/>
                    </button>
                )}
                <div className="first_first_container_track" ref={scrollDiscover}>
                    {tracks.map(track => (
                        <li className="first_first_track" key={track.id}>
                            <img className="track_image_home_page" src={getTrackImageUrl(track)} alt={""}
                                 onClick={() => playTrack(track, tracks)}
                            />
                            <div className="track_information_container">
                                <span className="track_name baloo2">{track.title.length > 16 ? track.title.slice(0, 16) + "…" : track.title}</span>
                                <span className="track_author_home_page baloo2">{track.author}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
            {/* <div className="top_creators_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    TOP CREATORS
                </div>
                <div className="top_creators_creators_container">
                    {users.slice(0, 4).map((user, index) => (
                        <li key={user.id} className="top_creator_container baloo2 text-white text-[20px] font-bold">
                            <div className="top_creators_numeration">{index + 1}.</div>
                            <img className="top_creators_avatar_container"
                                 src={getUserAvatarUrl(user)}
                                 alt="userAvatar"
                                 onClick={() => goToUserProfile(user.id)}
                            />
                            <div className="top_creators_author_container">{user.username}</div>
                            <button
                                className={user.isFollowing ? "top_creators_unfollow_button_container" : "top_creators_follow_button_container"}
                                onClick={() => toggleFollow(user.id)}
                            >
                                            <span className="user_button_text_style">
                                                {user.isFollowing ? "Unfollow" : "Follow"}
                                            </span>
                            </button>
                        </li>
                    ))}
                </div>
            </div>
            <div className="recommended_for_you_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    RECOMMENDED TO YOU
                </div>
                <div className="top_creators_creators_container">
                    {users.slice(0,4).map((user) => (
                        <li className="top_creator_container baloo2
                     text-white text-[20px] font-bold"
                            key={user.id}>
                            <img className="top_creators_avatar_container" src={getUserAvatarUrl(user)}
                                 alt={"userAvatar"}
                                 onClick={() => goToUserProfile(user.id)}/>
                            <div className="recommended_for_you_author_container">
                                {user.username}
                            </div>
                            <button
                                className={user.isFollowing ? "top_creators_unfollow_button_container" : "top_creators_follow_button_container"}
                                onClick={() => toggleFollow(user.id)}
                            >
                                            <span className="user_button_text_style">
                                                {user.isFollowing ? "Unfollow" : "Follow"}
                                            </span>
                            </button>
                        </li>
                    ))}
                </div>
            </div>
            <div className="history_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    HISTORY
                </div>
                <div className="top_creators_creators_container">
                    {history.length === 0 ? (
                        <p className="baloo2 text-lightpurple text-[24px] font-bold">You haven't listened to the music yet, but you can start right now!</p>
                    ) : (
                        history.slice(0,4).map((track) => (
                            <li className="top_creator_container baloo2
                     text-white text-[20px] font-bold"
                                key={track.id}>
                                <img className="history_track_image_container" src={getTrackImageUrl(track)}
                                     alt={"userAvatar"}
                                     onClick={() => playTrack(track, tracks)}
                                />
                                <div className="history_track_information_container">
                                    <div className="history_track_author baloo2">
                                        {track.author}
                                    </div>
                                    <div className="history_track_title baloo2">
                                        {track.title.length > 16 ? track.title.slice(0, 16) + "…" : track.title}
                                    </div>
                                </div>
                                <div className="history_buttons_container">
                                    <div className="history_like">
                                        <img
                                            src={track.isLikedByCurrentUser ? "src/images/icons/like.png" : "src/images/icons/unlike.png"}
                                            alt="like"
                                            onClick={() => toggleLike(track)}
                                            style={{cursor: "pointer"}}
                                        />
                                    </div>
                                    <div className="history_add_info">
                                        <img src="src/images/icons/more_info.png"
                                             alt={"like"}/>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </div>
            </div> */}
        </main>
    );
};

export default HomePage;