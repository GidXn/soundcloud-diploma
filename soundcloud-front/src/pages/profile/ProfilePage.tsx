import React, {useState, useEffect} from "react";
import { trackService } from "../../services/trackApi";
import { ITrack } from "../../types/track";
import { IPlaylist } from "../../types/playlist";
import {IAlbum} from "../../types/album";
import { albumService} from "../../services/albumAPI.ts";
import "../../styles/profile_page/profile_layout.css"
import {playlistService} from "../../services/playlistApi.ts";
import {getCurrentUser, updateUserProfile, uploadUserBanner} from "../../services/User/user_info.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import {IUser} from "../../types/user.ts";

import {IGenre} from "../../types/genre.ts";
import {genreService} from "../../services/genreApi.ts";
import { followService } from "../../services/followApi.ts";
import {IUserFollow} from "../../types/follow.ts";
import {useNavigate} from "react-router-dom";
//import {IUserFollow} from "../../types/follow.ts";
//import {useSelector} from "react-redux";
//import {RootState} from "../../store/store.ts";

const tabs = ["Tracks", "Albums", "Playlists"];

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("Tracks");
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);

    const [userTracksCount, setUserTracksCount] = useState<number | null>(null);
    const [userAlbumsCount, setUserAlbumsCount] = useState<number | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [albumId, setAlbumId] = useState<number|null>(null);
    const [genreId, setGenreId] = useState<number>(0);
    const [file, setFile] = useState<File | undefined>();
    const [cover, setCover] = useState<File | undefined>();

    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState("");

    const playTrack = usePlayerStore(state => state.playTrack);
    const pauseTrack = usePlayerStore((state) => state.pauseTrack);
    const playAlbum = usePlayerStore(state => state.playAlbum);


    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);

    // const [selectedPlaylist, setSelectedPlaylist] = useState<IPlaylist | null>(null);
    // const [playlistName, setPlaylistName] = useState("");
    // const [playlistCoverFile, setPlaylistCoverFile] = useState<File | undefined>();
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

    const [playlistTracks, setPlaylistTracks] = useState<{ [playlistId: number]: ITrack[] |null}>({});


    const [genres, setGenres] = useState<IGenre[]>([]);

    const [albums, setAlbums] = useState<IAlbum[]>([]);

    const [albumModalOpen, setAlbumModalOpen] = useState(false);
    const [albumTitle, setAlbumTitle] = useState("");
    const [albumCoverFile, setAlbumCoverFile] = useState<File | undefined>();

    const [albumDescription, setAlbumDescription] = useState("");
    const [albumIsPublic, setAlbumIsPublic] = useState(true);


    const [albumTracks, setAlbumTracks] = useState<{ [albumId: number]: ITrack[] }>({});

    const [addToAlbumModalOpen, setAddToAlbumModalOpen] = useState(false);
    const [selectedTrackToAddToAlbum, setSelectedTrackToAddToAlbum] = useState<number | null>(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatarFile] = useState<File | null>(null);


    const [isUserEditOpen, setUserEditOpen] = useState(false);

    const [bannerModalOpen, setBannerModalOpen] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Add to playlist modal
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const [selectedTrackToAdd, setSelectedTrackToAdd] = useState<number | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    //Edit track
    const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const handleTrackClick = (track: ITrack) => {
        setSelectedTrack(track);
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = async (trackId: number, formData: FormData) => {
        try {
            // Виклик методу з id треку
            const updatedTrack = await trackService.updateTrack(trackId, formData);

            // Оновлюємо локальний стан треків
            setTracks((prev) =>
                prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t))
            );

            // Оновлюємо вибраний трек для модалки
            setSelectedTrack(updatedTrack);

            alert("Track updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update track.");
        }
    };


    useEffect(() => {
        if (selectedTrack) {
            const foundGenre = genres.find(g => g.name === selectedTrack.genre);

            if (foundGenre) {
                setGenreId(foundGenre.id); // тут явно передаємо number
            } else {
                setGenreId(null); // якщо не знайшли, можна передати null
            }
        }
    }, [selectedTrack, genres]);

    useEffect(() => {
        if (selectedTrack) {
            setTitle(selectedTrack.title);
            setCoverUrl(selectedTrack.imageUrl??null); // скидаємо, щоб показувався існуючий imageUrl
            setFileUrl(selectedTrack.url);
        }

    }, [selectedTrack]);

    const refreshPage = () => {
        window.location.reload();
    };

    const { track: currentTrack, isPlaying,currentAlbumId } = usePlayerStore();
    console.log(tracks);
    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));

    }, []);



    useEffect(() => {
        if (bannerModalOpen||isUserEditOpen||isModalOpen||playlistModalOpen||albumModalOpen) {
            // Забороняємо скрол
            document.body.style.overflow = "hidden";
        } else {
            // Повертаємо як було
            document.body.style.overflow = "";
        }

        // Cleanup на всяк випадок
        return () => {
            document.body.style.overflow = "";
        };
    }, [bannerModalOpen,isUserEditOpen,isModalOpen, playlistModalOpen,albumModalOpen]);

    useEffect(() => {
        if (isUserEditOpen && user) {
            setUsername(user.username || "");
            setEmail(user.email || "");
            setBio(user.bio || "");
        }
    }, [isUserEditOpen, user]);


    // Fetch tracks and playlists on mount
    useEffect(() => {
        trackService.getMyTracks().then(setTracks).catch(console.error);
        playlistService.getAll().then(setPlaylists).catch(console.error);
        albumService.getMyAlbums().then(setAlbums).catch(console.error);
        genreService.getGenres().then(setGenres).catch(console.error);
        trackService.getMyTracksCount().then(setUserTracksCount).catch(console.error);
        albumService.getMyAlbumsCount().then(setUserAlbumsCount).catch(console.error);
    }, []);

    const handleUserUpdate = async (updateData: {
        username?: string;
        email?: string;
        bio?: string;
        avatar?: File | null;
    }) => {
        if (!user?.id) {
            alert("User not found!");
            return;
        }

        setUploading(true);

        try {
            const updatedUser = await updateUserProfile(user.id, {
                username: updateData.username,
                email: updateData.email,
                bio: updateData.bio,
                avatar: updateData.avatar ?? undefined,
            });

            // Оновлюємо локальний стан користувача
            setUser(updatedUser);

            // Якщо потрібно, можна скинути файли
            // updateData.avatarFile = undefined;
            // updateData.bannerFile = undefined;

        } catch (err) {
            console.error("Profile update failed", err);
            alert("Failed to update profile");
        } finally {
            setUploading(false);
        }
    };



    const handleBannerUpload = async () => {
        if (!bannerFile || !user?.id) {
            alert("Please select a file!");
            return;
        }

        setUploading(true);
        try {
            const data = await uploadUserBanner.updateBanner(user.id, bannerFile);
            // Оновлюємо локальний стейт юзера
            setUser({ ...user, banner: data.bannerUrl });
            setBannerModalOpen(false);
            setBannerFile(null);
        } catch (err) {
            console.error("Banner upload failed", err);
            alert("Failed to upload banner");
        } finally {
            setUploading(false);
        }
    };

    //const getPlaylistImageUrl = (Playlist?: IPlaylist | null) => {
    //    if (!Playlist || !Playlist.coverUrl) return "/default-cover.png";
    //    return `http://localhost:5122/${Playlist.coverUrl}`;
    //};
    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122/${track.imageUrl}`;
    };
    const getAlbumImageUrl = (album?: IAlbum | null) => {
        if (!album || !album.coverUrl) return "/default-cover.png";
        return `http://localhost:5122/${album.coverUrl}`;
    };
    const getUserImageUrl = (user?: IUser | null) => {
        if (!user?.avatar) return "/default-cover.png";
    
        return user.avatar.startsWith("http")
            ? user.avatar
            : `http://localhost:5122/${user.avatar}`;
    };
    const getUserBannerUrl = (user?: IUser | null) => {
        if (!user || !user.banner) return "src/images/profile/banner.png";
        console.log(user)
        return `http://localhost:5122${user.banner}`;
    };
    const handleUpload = async () => {
        if (!title || !file || !cover ) {
            alert("Please fill all required fields and select files!");
            return;
        }

        try {
            const newTrack = await trackService.createTrack(title, albumId, file, cover, genreId);
            setTracks([...tracks, newTrack]);

            // Очистка полів і закриття модалки
            setTitle("");
            setAlbumId(0);
            setGenreId(0);
            setFile(undefined);
            setCover(undefined);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload track. Check console for details.");
        }
    };


//     const handlePlaylistCreate = async () => {
//         if (!playlistName) {
//             alert("Enter playlist name");
//             return;
//         }
//
//         try {
//             const formData = new FormData();
//             formData.append("name", playlistName);
//             if (playlistCoverFile) {
//                 formData.append("cover", playlistCoverFile);
//             }
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error тимчасово: сервіс приймає FormData у рантаймі
//             const newPlaylist = await playlistService.create(formData); // метод сервісу приймає FormData
//             setPlaylists([...playlists, newPlaylist]);
//
//             // Очистка полів і закриття модалки
//             setPlaylistName("");
//             setPlaylistCoverFile(undefined);
//             setPlaylistModalOpen(false);
//         } catch (err) {
//             console.error("Playlist creation failed", err);
//             alert("Failed to create playlist. Check console for details.");
//         }
//     };

    // const handleAddToPlaylistClick = (trackId: number) => {
    //     if (!playlists.length) {
    //         alert("You have no playlists yet!");
    //         return;
    //     }
    //     setSelectedTrackToAdd(trackId);
    //     setSelectedPlaylistId(playlists[0].id); // вибір по-замовчуванню — перший плейлист
    //     setAddToPlaylistModalOpen(true);
    // };

    const handleConfirmAddToPlaylist = async () => {
        if (!selectedPlaylistId || !selectedTrackToAdd) {
            alert("Choose playlist");
            return;
        }

        try {
            await playlistService.addTrack(selectedPlaylistId, selectedTrackToAdd);

            alert("Track added to playlist!");
            setAddToPlaylistModalOpen(false);
            setSelectedTrackToAdd(null);
            setSelectedPlaylistId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to add track to playlist.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (activeTab === "Tracks") {
                    const userTracks = await trackService.getMyTracks();
                    setTracks(userTracks);
                } else if (activeTab === "Playlists") {
                    const userPlaylists = await playlistService.getAll();
                    setPlaylists(userPlaylists);

                    // Одразу підтягуємо треки для всіх плейлістів
                    const tracksByPlaylist: { [playlistId: number]: ITrack[] } = {};
                    for (const p of userPlaylists) {
                        tracksByPlaylist[p.id] = await playlistService.getTracks(p.id);
                    }
                    setPlaylistTracks(tracksByPlaylist);
                } else if (activeTab === "Albums") {
                    const userAlbums = await albumService.getMyAlbums();
                    setAlbums(userAlbums);

                    // Одразу підтягуємо треки для всіх альбомів
                    const tracksByAlbum: { [albumId: number]: ITrack[] } = {};
                    for (const a of userAlbums) {
                        tracksByAlbum[a.id] = await albumService.getTracks(a.id);
                        console.log(albumService.getTracks(a.id))
                    }

                    setAlbumTracks(tracksByAlbum);
                }
            } catch (err) {
                console.error("Failed to fetch data for tab:", activeTab, err);
            }
        };

        fetchData();
    }, [activeTab]);



    useEffect(() => {
        const loadAllTracks = async () => {
            try {
                const results = await Promise.all(
                    playlists.map(async (pl) => {
                        const tracks = await playlistService.getTracks(pl.id);
                        return { id: pl.id, tracks };
                    })
                );

                const tracksByPlaylist = results.reduce(
                    (acc, { id, tracks }) => ({ ...acc, [id]: tracks }),
                    {}
                );

                setPlaylistTracks(tracksByPlaylist);
            } catch (err) {
                console.error("Failed to load all tracks", err);
                alert("Не вдалося завантажити треки для плейлістів");
            }
        };

        if (playlists.length > 0) {
            loadAllTracks();
        }
    }, [playlists]);


    //Для альбомів
    useEffect(() => {
        const loadAllAlbumTracks = async () => {
            try {
                const results = await Promise.all(
                    albums.map(async (a) => {
                        const tracks = await albumService.getTracks(a.id);
                        return { id: a.id, tracks };
                    })
                );

                const tracksByAlbum = results.reduce(
                    (acc, { id, tracks }) => ({ ...acc, [id]: tracks }),
                    {} as Record<number, ITrack[]>
                );

                setAlbumTracks(tracksByAlbum);
            } catch (err) {
                console.error("Failed to load all play_album tracks", err);
            }
        };

        if (albums.length > 0) {
            loadAllAlbumTracks();
        }
    }, [albums]);

    const handleViewAlbumTracks = async (albumId: number) => {
        try {
            const tracks = await albumService.getTracks(albumId);
            setAlbumTracks((prev) => ({ ...prev, [albumId]: tracks }));
        } catch (err) {
            console.error(err);
            alert("Failed to load tracks");
        }
    };

    // const handleAddToAlbumClick = (trackId: number) => {
    //     if (!albums.length) {
    //         alert("You have no albums yet!");
    //         return;
    //     }
    //     setSelectedTrackToAddToAlbum(trackId);
    //     setSelectedAlbumId(albums[0].id); // вибір першого альбому по-замовчуванню
    //     setAddToAlbumModalOpen(true);
    // };


    const handleConfirmAddToAlbum = async () => {
        if (!selectedAlbumId || !selectedTrackToAddToAlbum) {
            alert("Choose an play_album");
            return;
        }

        try {
            await albumService.addTrack(selectedAlbumId, selectedTrackToAddToAlbum);
            alert("Track added to play_album!");
            setAddToAlbumModalOpen(false);
            setSelectedTrackToAddToAlbum(null);
            setSelectedAlbumId(null);
            handleViewAlbumTracks(selectedAlbumId); // оновлюємо треки альбому
        } catch (err) {
            console.error(err);
            alert("Failed to add track to play_album.");
        }
    };
    useEffect(() => {
        console.log("Current user:", user);
    }, [user]);


    useEffect(() => {
        if (!isEditModalOpen) {
            setTitle(null);
            setAlbumId(null);
            setGenreId(null);
            setCover(null);
            setCoverUrl(null);
            setFile(null);

            setSelectedTrack(null);
        }
    }, [isEditModalOpen]);
    const handleAlbumCreate = async () => {
        try {
            const currentUser = await getCurrentUser();

            if (!currentUser || !currentUser.id) {
                alert("Не вдалося визначити користувача. Будь ласка, увійдіть в систему.");
                return;
            }

            if (!albumTitle) {
                alert("Enter play_album title");
                return;
            }

            const newAlbum = await albumService.create({
                title: albumTitle,
                description: albumDescription,
                ownerId: currentUser.id,
                cover: albumCoverFile,
                isPublic: albumIsPublic,

            });


            setAlbums([...albums, newAlbum]);

            setAlbumTitle("");
            setAlbumDescription("");
            setAlbumCoverFile(undefined);
            setAlbumIsPublic(true);
            setAlbumModalOpen(false);
        } catch (err) {
            console.error("Failed to create play_album:", err);
            alert("Failed to create play_album. Check console for details.");
        }
    };

    //для follow
    // Кількість підписників і підписок
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);

    const [followingUsers, setFollowingUsers] = useState<IUserFollow[]>([]);


    useEffect(() => {
        if (!user) return;

        const fetchFollowCounts = async () => {
            try {
                const followers = await followService.getFollowersCount(user.id);
                const following = await followService.getFollowingCount(user.id);

                setFollowersCount(followers);
                setFollowingCount(following);

                console.log("Followers:", followers, "Following:", following);
            } catch (error) {
                console.error("Помилка при отриманні кількості підписок:", error);
            }
        };

        fetchFollowCounts();
    }, [user]);



    useEffect(() => {
        if (!user) return;

        const fetchFollowingUsers = async () => {
            try {
                const usersFromApi = await followService.getFollowing(user.id);

                setFollowingUsers(
                    usersFromApi.map(u => ({
                        id: u.id,
                        username: u.username,
                        avatarUrl: u.avatarUrl,
                        isFollowing: true
                    }))
                );
            } catch (error) {
                console.error("Помилка при отриманні списку Following:", error);
            }
        };

        fetchFollowingUsers();
    }, [user]);

// 3️⃣ Функція toggleFollow для кнопки
    const toggleFollow = async (userId: number) => {
        try {
            const userToToggle = followingUsers.find(u => u.id === userId);
            if (!userToToggle) return;

            if (userToToggle.isFollowing) {
                await followService.unfollow(userId);
            } else {
                await followService.follow(userId);
            }

            // оновлюємо локально стан
            setFollowingUsers(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
                )
            );
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };


    //лайки
    // окремо зберігаємо саме лайкнуті треки
    const [likedTracks, setLikedTracks] = useState<ITrack[]>([]);

    useEffect(() => {
        const fetchLikedTracks = async () => {
            try {
                const liked = await trackService.getLikedTracks();
                setLikedTracks(liked);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLikedTracks();
    }, []);


    const handleRemoveTrack = async (playlistId: number, trackId: number) => {
        try {
            await playlistService.removeTrack(playlistId, trackId);
            // Можна оновити локальний стан плейліста після видалення
            setPlaylistTracks(prev => ({
                ...prev,
                [playlistId]: prev[playlistId]?.filter(t => t.id !== trackId) || []
            }));
        } catch (err) {
            console.error("Error removing track:", err);
        }
    };
    const handleRemoveTrackAlbum = async (albumId: number, trackId: number) => {
        try {
            await albumService.removeTrack(albumId, trackId);
            // Можна оновити локальний стан плейліста після видалення
            setAlbumTracks(prev => ({
                ...prev,
                [albumId]: prev[albumId]?.filter(t => t.id !== trackId) || []
            }));
        } catch (err) {
            console.error("Error removing track:", err);
        }
    };



    const toggleLike = async (track: ITrack) => {
        try {
            if (track.isLikedByCurrentUser) {
                // unlike
                await trackService.unlike(track.id);
                setLikedTracks(prev => prev.filter(t => t.id !== track.id));
            } else {
                // like
                await trackService.like(track.id);
                setLikedTracks(prev => [...prev, { ...track, isLikedByCurrentUser: true }]);
            }
        } catch (err) {
            console.error("Error liking/unliking track:", err);
        }
    };

    const handleDeleteTrack = async (id: number) => {
        if (!window.confirm("Delete this track? This action cannot be undone.")) return;
        try {
            await trackService.deleteTrack(id);
            setTracks(prev => prev.filter(t => t.id !== id));
            setUserTracksCount(prev => (prev !== null ? prev - 1 : prev));
        } catch (err) {
            console.error("Failed to delete track", err);
            alert("Failed to delete track");
        }
    };

    const handleDeleteAlbum = async (id: number) => {
        if (!window.confirm("Delete this album? This action cannot be undone.")) return;
        try {
            await albumService.delete(id);
            setAlbums(prev => prev.filter(a => a.id !== id));
            setAlbumTracks(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            setUserAlbumsCount(prev => (prev !== null ? prev - 1 : prev));
        } catch (err) {
            console.error("Failed to delete album", err);
            alert("Failed to delete album");
        }
    };

    const formatTimeSpan = (ts: string): string => {
        const [h, m, s] = ts.split(":");
        const seconds = s.split(".")[0];
        const totalMinutes = Number(h) * 60 + Number(m);
        return `${totalMinutes}:${seconds}`;
    };

    return (
        <div className="layout_container pb-[1900px] baloo2">
            <div className="banner_container">
                <img className="banner_image_style" src={getUserBannerUrl(user)} alt="Banner"/>
            </div>
            <button className="profile_page_banner_upload_container baloo2"
                    onClick={() => setBannerModalOpen(true)}
            >
                <span className="profile_page_banner_upload_button_txt_style">
                    Update image
                </span>
            </button>
            <div className="profile_page_user_avatar_container" >
                <img className="profile_page_user_avatar_style " src={getUserImageUrl(user)} alt="Avatar"/>
            </div>
            <div className="profile_page_user_name_container">
                {user?.username}
            </div>

            <div className="profile_page_following_tracks_info_container">
                <div className="followers_container">
                    <div className="title">
                        Albums
                    </div>
                    <div className="number">
                        <span>{userAlbumsCount}</span>
                    </div>
                </div>
                {/* <div className="following_container">
                    <div className="title">
                        Following
                    </div>
                    <div className="number">
                        <span>{followingCount}</span>
                    </div>
                </div> */}
                <div className="tracks_container">
                    <div className="title">
                        Tracks
                    </div>
                    <div className="number">
                        {userTracksCount}
                    </div>
                </div>
            </div>

            <div className="profile_page_right_sidebar">
                <div className="profile_page_bio_container">
                    {user?.bio ? <span>{user.bio}</span> : <span>You don’t have bio :(</span>}
                </div>

                <div className="profile_page_likes_users_container">
                    <div className="container_title_container">
                        <span className="header_txt_style">LIKES</span>
                    </div>

                    {likedTracks.length === 0 ? (
                        <div className="user_info_container">
                            <span className="txt_style">You don`t have Likes</span>
                        </div>
                    ) : (
                        likedTracks.map(track => (
                            <div key={track.id} className="user_info_container">
                                <div className="user_container">
                                    <div className="user_avatar_text_container">
                                        <div className="user_avatar_container">
                                            <img className="user_avatar_container"  src={getTrackImageUrl(track)} alt={track.title} />
                                        </div>
                                        <div className="user_text_container">
                                            <p>{track.title}</p>
                                        </div>
                                    </div>

                                    <div className="user_like_moreinfo_container">
                                        <div className="user_like_style">
                                            <img
                                                src={track.isLikedByCurrentUser ? "src/images/icons/like.png" : "src/images/icons/unlike.png"}
                                                alt="like"
                                                onClick={() => toggleLike(track)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </div>
                                        <div className="user_moreinfo_style">
                                            <img src="src/images/icons/more_info.png" alt="more info" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="profile_tabs_container">
                {tabs.map((tab) => (
                    <div className="profile_tab_buttons_container  text-white baloo2">
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? "profile_tab_buttons_container_activated"
                                    : "profile_tab_buttons_non_active cursor-pointer"
                            }`}
                        >
                            {tab}
                        </button>
                    </div>
                ))}
            </div>
            <div className="profile_page_user_button_controls">
                <button className="share_button cursor-pointer"
                        onClick={()=>setIsModalOpen(true)}>
                        <img className="img_style" src="src/images/icons/share.png" alt="shareIcon"/>
                        <span className="txt_style">Upload</span>
                </button>
                <button className="edit_button cursor-pointer"
                        onClick={() => setUserEditOpen(true)}
                >
                    <img className="img_style" src="src/images/icons/pen_icon.png" alt="penIcon"/>
                    <span className="txt_style">Edit</span>
                </button>
            </div>

            {/* Content */}
            <div className="profile_tracks_container">
                {/* Tracks Tab */}
                {activeTab === "All" && (
                    <>
                        {playlists.length ? (
                            <ul className="text-white baloo2">
                                {playlists.map((p) => (
                                    <li
                                        key={p.id}
                                        className="profile_track_container"
                                    >
                                        <div className="">
                                            <img
                                                src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                                alt={p.name}
                                                className="profile_page_playlist_image"
                                                onClick={() => navigate(`/play-playlist/${p.id}`)}
                                            />

                                        </div>

                                        {/* Треки конкретного плейлиста */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // використовуємо currentAlbumId для плейліста
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {p.name}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(playlistTracks[p.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, playlistTracks[p.id], p.id)}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                    ${currentTrack?.id === t.id && currentAlbumId === p.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 увімкнути
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style cursor-pointer">
                                                    <img src="src/images/icons/information_white.png" alt="information"/>
                                                </div>
                                            </div>
                                        </ul>
                                    </li>
                                ))}
                                {albums.map((a) => (
                                    <li key={a.id} className="profile_track_container">
                                        <div className="">
                                            <img
                                                src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                                alt={a.title}
                                                className="profile_page_playlist_image"
                                                onClick={() => navigate(`/play-album/${a.id}`)}
                                            />

                                        </div>

                                        {/* Треки конкретного альбому */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === a.id &&  // <-- додано
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {a.title}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(albumTracks[a.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks color">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, albumTracks[a.id])}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                        ${currentTrack?.id === t.id && currentAlbumId === a.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/information_white.png" alt="information_white"/>
                                                </div>
                                            </div>
                                        </ul>

                                    </li>

                                ))}
                            </ul>

                        ) : (
                            <p className="text-gray-400 py-4">You don't have any playlists or albums</p>
                        )}

                    </>
                )}



                {activeTab === "Tracks" && (
                    <>
                        {tracks.length ? (
                                <div className="profile_tracks_list_container">
                                {tracks.map((t, index) => (
                                    <React.Fragment key={t.id}>
                                        {index !== 0 && <div className="profile_track_divider"></div>}
                                        <div className="profile_track_item">
                                            <div className="profile_track_image_wrapper">
                                                <img 
                                                    src={getTrackImageUrl(t)} 
                                                    alt={t.title}
                                                    className="profile_track_cover"
                                                    onClick={() => playTrack(t, tracks)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                            <div className="profile_track_header">
                                                <div className="profile_track_name">{t.title}</div>
                                            </div>
                                            <div className="profile_track_meta">
                                                <div className="profile_track_details">
                                                    <span className="profile_track_artist">{t.author}</span>
                                                    <span className="profile_track_genre">{t.genre}</span>
                                                </div>
                                            </div>
                                            <div className="profile_track_actions">
                                                <img
                                                    src={t.isLikedByCurrentUser ? "src/images/icons/like.png" : "src/images/icons/unlike.png"}
                                                    alt="like"
                                                    className="profile_like_icon"
                                                    onClick={() => toggleLike(t)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <span className="profile_track_duration">{formatTimeSpan(t.duration)}</span>
                                                <img
                                                    src="src/images/icons/close_icon.png"
                                                    alt="delete"
                                                    className="profile_like_icon"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleDeleteTrack(t.id)}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                </div>
                        ) : (
                            <p className="text-gray-400 py-4">No tracks yet</p>
                        )}
                    </>
                )}

                {/* Playlists Tab */}
                {activeTab === "Playlists" && (
                    <>
                        {playlists.length ? (
                            <ul className="text-white baloo2">
                                {playlists.map((p) => (
                                    <li
                                        key={p.id}
                                        className="profile_track_container"
                                    >
                                        <div className="">
                                            <img
                                                src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                                alt={p.name}
                                                className="profile_page_playlist_image"
                                                onClick={() => navigate(`/play-playlist/${p.id}`)}
                                            />

                                        </div>

                                        {/* Треки конкретного плейлиста */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // використовуємо currentAlbumId для плейліста
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {p.name}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(playlistTracks[p.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, playlistTracks[p.id], p.id)}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                    ${currentTrack?.id === t.id && currentAlbumId === p.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                            <img
                                                                className="playlist_close_button_container cursor-pointer"
                                                                src="src/images/icons/close_icon.png"
                                                                onClick={() => handleRemoveTrack(p.id, t.id)}
                                                            />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="profile_page_track_controls_buttons">
                                            <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 увімкнути
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/information_white.png" alt="information_white"/>
                                                </div>
                                            </div>
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 py-4">No playlists yet</p>
                        )}
                    </>
                )}

                {/* Albums Tab */}
                {activeTab === "Albums" && (
                    <>
                        {albums.length ? (
                            <div className="profile_tracks_list_container">
                                {[...albums].map((album, index) => (
                                    <React.Fragment key={album.id}>
                                        {index !== 0 && <div className="profile_track_divider"></div>}
                                        <div
                                            className="profile_track_item"
                                            onClick={() => playAlbum(album, albumTracks[album.id] || [])}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="profile_track_image_wrapper">
                                                <img
                                                    src={getAlbumImageUrl(album)}
                                                    alt={album.title}
                                                    className="profile_track_cover"
                                                />
                                            </div>
                                            <div className="profile_track_header">
                                                <div className="profile_track_name">
                                                    {album.title.length > 60 ? album.title.slice(0, 57) + "…" : album.title}
                                                </div>
                                            </div>
                                            <div className="profile_track_meta">
                                                <div className="profile_track_details">
                                                    <div className="profile_track_artist">
                                                        {album.description && album.description.length > 80
                                                            ? album.description.slice(0, 77) + "…"
                                                            : (album.description || "No description")}
                                                    </div>
                                                    <div className="profile_track_genre">
                                                        {(() => {
                                                            const count = (albumTracks[album.id] || []).length;
                                                            if (count === 0) return "No tracks";
                                                            if (count === 1) return "1 track";
                                                            return `${count} tracks`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="profile_track_actions" onClick={(e) => e.stopPropagation()}>
                                                <img
                                                    src="src/images/icons/close_icon.png"
                                                    alt="delete"
                                                    className="profile_like_icon"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleDeleteAlbum(album.id)}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 py-4">No albums yet</p>
                        )}
                        <button
                            className="profile_page_button_create_album_playlist cursor-pointer"
                            onClick={() => setAlbumModalOpen(true)}
                        >
                            <span className="txt_style">Create album</span>
                        </button>
                    </>
                )}

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_track_upload_container">
                        <div className="upload_title_container">
                            <label className="txt_style_upload">Upload</label>
                            <div className="img_style cursor-pointer"
                                 onClick={() => setIsModalOpen(false)}
                            >
                                <img src="src/images/icons/close_icon.png" alt="close"/>
                            </div>
                        </div>
                        <div className="profile_page_track_info_container">
                            <div className="img_button_container">
                                {cover ? (
                                    <img
                                        className="img_container_style"
                                        src={URL.createObjectURL(cover)}
                                        alt="Selected banner preview"
                                    />
                                ) : (
                                    <img
                                        className="img_container_style"
                                    />
                                )}
                                <div className="button_add_container">
                                    <button className="profile_page_add_track_picture_button">
                                        <label className="relative txt_style">Add
                                            picture
                                            <input
                                                className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    setCover(e.target.files?.[0])
                                                }
                                            />
                                        </label>
                                    </button>
                                </div>

                            </div>
                            <div className="song_info_container">
                                <div className="track_title_container">
                                    <span className="txt_style">Song Title</span>
                                    <input
                                        type="text"
                                        placeholder="Song title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input_upload_track_container"
                                    />
                                </div>
                                <div className="album_container">
                                    <span className="txt_style">Album</span>
                                    <select
                                        value={albumId ?? ""}
                                        onChange={(e) => {
                                            setAlbumId(Number(e.target.value)); // якщо пусто → null
                                        }}
                                        className="input_upload_track_container"
                                    >
                                        <option value="">
                                            None (no album)
                                        </option>
                                        {albums.map((album) => (
                                            <option key={album.id} value={album.id}>
                                                {album.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="genre_container">
                                    <span className="txt_style">Genre</span>
                                    <select
                                        value={genreId ?? ""}
                                        onChange={(e) => setGenreId(Number(e.target.value))}
                                        className="input_upload_track_container"
                                    >
                                        <option value="">
                                            None (no Genre)
                                        </option>
                                        {genres.map((genre, index) => (
                                            <option key={genre.id} value={genre.id || index + 1}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="track_file_container">
                            <div className="title_instruction_container">
                                <span className="txt_style_up">Upload your audio file.</span>
                                <span className="txt_style_down">For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed.</span>
                            </div>
                                {file? (
                                    <div className="input_track_info_container">
                                        <div className="track_info_img_container">
                                            {cover ? (
                                            <img
                                                className="img_container_style"
                                                src={URL.createObjectURL(cover as File)}
                                                alt="Selected banner preview"
                                            />
                                            ) : (
                                            <img
                                                className="img_container_style"
                                                src="src/images/rectangles/rectangle_track.png"
                                            />
                                            )}
                                            <div className="track_file_path">
                                                <span className="txt_style">{file.name}</span>
                                            </div>
                                            <div className="delete_track_container cursor-pointer">
                                                <img src="src/images/icons/close_icon.png"
                                                onClick={()=>setFile(0)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="input_style_container">
                                        <div className="img_style_container">
                                            <img src="src/images/logo/logo_WaveCloud_background.png"/>
                                        </div>
                                        <span className="drag_text_style">
                                    Drag or drop your audio files to upload
                                         </span>
                                        <button className="choose_file_button_container cursor-pointer">
                                            <label className="txt_style relative ">
                                                Choose file
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        setFile(e.target.files?.[0])}
                                                    className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                                />
                                            </label>

                                        </button>
                                    </div>
                                    )}
                        </div>
                        <button
                            className="upload_button_container cursor-pointer"
                            onClick={handleUpload}
                        >
                            <span className="txt_style">Upload</span>
                        </button>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedTrack && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_track_upload_container">
                        <div className="upload_title_container_edit">
                            <label className="txt_style_upload">Edit Track</label>
                            <div className="img_style cursor-pointer" onClick={() => setIsEditModalOpen(false)}>
                                <img src="src/images/icons/close_icon.png" alt="close"/>
                            </div>
                        </div>

                        <div className="profile_page_track_info_container">
                            <div className="img_button_container">
                                {cover ? (
                                    <img
                                        className="img_container_style"
                                        src={URL.createObjectURL(cover)}
                                        alt="Selected banner preview"
                                    />
                                ) : (
                                    <img
                                        className="img_container_style"
                                        src={getTrackImageUrl(selectedTrack) || "src/images/rectangles/rectangle_track.png"}
                                        alt="Track cover"
                                    />
                                )}
                                <div className="button_add_container">
                                    <button className="profile_page_add_track_picture_button">
                                        <label className="relative txt_style">
                                            Change picture
                                            <input
                                                className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setCover(e.target.files?.[0])}
                                            />
                                        </label>
                                    </button>
                                </div>
                            </div>

                            <div className="song_info_container">
                                <div className="track_title_container">
                                    <span className="txt_style">Song Title</span>
                                    <input
                                        type="text"
                                        placeholder="Song title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="input_upload_track_container"
                                    />
                                </div>
                                <div className="genre_container">
                                    <span className="txt_style">Genre</span>
                                    <select
                                        value={genreId ?? ""}
                                        onChange={(e) => setGenreId(e.target.value)}
                                        className="input_upload_track_container"
                                    >
                                    <option value="">None (no Genre)</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="track_file_container">
                            <div className="title_instruction_container">
                                <span className="txt_style_up">Upload new audio file (optional).</span>
                                <span className="txt_style_down">
                        For best quality, use WAV, FLAC, AIFF, or ALAC. Max size 4GB.
                    </span>
                            </div>
                            {fileUrl? (
                                <div className="input_track_info_container">
                                    <div className="track_info_img_container">
                                            <img
                                                className="img_container_style"
                                                src={coverUrl ? getTrackImageUrl(selectedTrack) : "src/images/rectangles/rectangle_track.png"}
                                            />
                                        <div className="track_file_path">
                                            <span className="txt_style">{fileUrl}</span>
                                        </div>
                                        <div className="delete_track_container cursor-pointer">
                                            <img src="src/images/icons/close_icon.png"
                                                 onClick={()=>setFileUrl(0)}
                                            />
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="input_style_container">
                                    <div className="img_style_container">
                                        <img src="src/images/logo/logo_WaveCloud_background.png"/>
                                    </div>
                                    <span className="drag_text_style">
                                    Drag or drop your audio files to upload
                                         </span>
                                    <button className="choose_file_button_container cursor-pointer">
                                        <label className="txt_style relative ">
                                            Choose file
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    setFile(e.target.files?.[0])}
                                                className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                            />
                                        </label>

                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="delete_upload_button_container">
                            <button
                                className="delete_button_container cursor-pointer"
                                onClick={async () => {
                                    if (!selectedTrack) return;

                                    if (!window.confirm("Are you sure you want to delete this track?")) return;

                                    try {
                                        await trackService.deleteTrack(selectedTrack.id); // виклик на бек
                                        setTracks(prev => prev.filter(t => t.id !== selectedTrack.id)); // прибираємо з локального стейту
                                        setIsEditModalOpen(false); // закриваємо модалку
                                        alert("Track deleted successfully!");
                                    } catch (error) {
                                        console.error("Failed to delete track", error);
                                        alert("Failed to delete track.");
                                    }
                                }}
                            >
                                <span className="txt_style">Delete</span>
                            </button>
                            <button
                                className="upload_button_container cursor-pointer"
                                onClick={() => {
                                    const formData = new FormData();
                                    formData.append("Id", selectedTrack.id.toString());
                                    formData.append("Title", title);
                                    if (genreId !== null) formData.append("GenreId", genreId.toString());
                                    if (cover) formData.append("Cover", cover);
                                    if (file) formData.append("File", file);

                                    handleSaveChanges(selectedTrack.id, formData);
                                    setIsEditModalOpen(false);
                                }}
                            >
                                <span className="txt_style">Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*User Edit Modal*/}
            {isUserEditOpen && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_modal_user_edit_container">
                        <div className="profile_page_edit_profile_close_container">
                            <span className="txt_style">Edit Profile</span>
                            <div className="img_style cursor-pointer"
                                 onClick={() => setUserEditOpen(false)}
                            >
                                <img src="src/images/icons/close_icon.png" alt="close"/>
                            </div>
                        </div>
                        <div className="user_info_container">
                            <div className="img_container">
                                {avatar ? (
                                    <img className="img_style" src={URL.createObjectURL(avatar)} alt="UserImage"/>
                                ) : (
                                    <img className="img_style" src={getUserImageUrl(user)} alt="UserImage"/>
                                )}

                                <button className="button_container cursor-pointer">
                                    <label className="cursor-pointer txt_style">Edit picture
                                        <input
                                            type="file"
                                            className="cursor-pointer inset-0 opacity-0 absolute txt_style"
                                            accept="image/*"
                                            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </button>
                            </div>
                            <div className="user_info_tables_container">
                                <div className="username_container">
                                    <label className="username_title">Username</label>
                                    <label className="username_input">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            className="ml-[12px]"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="email_container">
                                    <label className="username_title">Email address</label>
                                    <label className="username_input">
                                        <input
                                            type="email"
                                            className="ml-[12px]"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="bio_container">
                                    <label className="username_title">Bio</label>
                                    <label className="bio_input">
                                    <textarea
                                        placeholder="Bio"
                                        className="bio_input_2 "
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                    </label>
                                </div>
                                <div className="button_cancel_save_container">
                                    <button
                                        className="cancel_button cursor-pointer"
                                        onClick={() => setUserEditOpen(false)}
                                        disabled={uploading}
                                    >
                                        <span className="txt_style">Cancel</span>
                                    </button>
                                    <button
                                        className="save_button cursor-pointer"
                                        onClick={async () => {
                                            await handleUserUpdate({
                                                username,
                                                email,
                                                bio,
                                                avatar,
                                            });
                                            setUserEditOpen(false);
                                            refreshPage();
                                        }}
                                        disabled={uploading}
                                    >
                                        <span className="txt_style">{uploading ? "Saving..." : "Save profile"}</span>
                                    </button>
                                </div>
                            </div>


                        </div>

                    </div>
                </div>
            )}

            {/*Banner Modal*/}
            {bannerModalOpen && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_banner_modal">
                        <div className="profile_page_title_and_close_button_container text-white">
                            <h1 className="profile_page_title_modal_style">Upload Banner</h1>
                            <div className="profile_page_modal_close_icon"
                                 onClick={() => setBannerModalOpen(false)}>
                                <img src="src/images/icons/close_icon.png" alt="closeIcon"/>
                            </div>
                        </div>
                        <div className="profile_page_modal_banner_preview">
                            {bannerFile ? (
                                <img
                                    className="profile_page_modal_banner_preview"
                                    src={URL.createObjectURL(bannerFile)}
                                    alt="Selected banner preview"
                                />
                            ) : (
                                <img
                                    className="profile_page_modal_banner_preview"
                                    src={getUserBannerUrl(user)}
                                    alt="Selected banner preview"
                                />
                            )}
                            <div className="profile_page_modal_banner_user_avatar">
                                <img className="img_style" src={getUserImageUrl(user)}
                                     alt="UserAvatar"/>
                            </div>
                            <div className="profile_page_modal_banner_avatar_container">
                                <span className="txt_style">{user?.username}</span>
                            </div>
                        </div>

                        <div className="profile_page_modal_banner_buttons_bottom_container">
                            <button className="profile_page_modal_upload_button_container cursor-pointer">
                                <label className="cursor-pointer relative txt_style">Upload
                                    Image
                                    <input
                                        className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setBannerFile(e.target.files ? e.target.files[0] : null)
                                        }
                                    />
                                </label>
                            </button>
                            <div className="profile_page_modal_banner_cancel_save_button_container">
                                <button
                                    className="button_cancel cursor-pointer"
                                    onClick={() => setBannerModalOpen(false)}
                                >
                                    <span className="txt_style">Cancel</span>
                                </button>
                                <button
                                    className="button_save cursor-pointer"
                                    onClick={handleBannerUpload}
                                    disabled={uploading}
                                >
                                    <span className="txt_style">{uploading ? "Saving..." : "Save"}</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            {/* Playlist Modal */}
            {/*{playlistModalOpen && (
                <div className="profile_page_modal_container">
                    <div className="edit_playlist_container">
                        <div className="title_close_container">
                            <div className="title_container">
                                <span className="txt_style">Edit playlist</span>
                            </div>
                            <div className="profile_page_modal_close_icon"
                                 onClick={() => setPlaylistModalOpen(false)}>
                                <img src="src/images/icons/close_icon.png" alt="closeIcon"/>
                            </div>
                        </div>
                        <div className="playlist_image_delete_upload_container">
                            <button className="button_upload_container cursor-pointer">
                                <label className="cursor-pointer relative txt_style">Upload
                                    Picture
                                </label>
                            </button>
                        </div>
                        <div className="playlist_edit_title_container">
                            <span className="txt_style">Playlist title</span>
                        <div className="save_cancel_container_playlist">
                            <div className="cancel_save_buttons_container">
                                <button onClick={() => setPlaylistModalOpen(false)}
                                        className="cancel_button_container cursor-pointer">
                                    <span className="txt_style">Cancel</span>
                                </button>
                                <button onClick={handlePlaylistCreate} className="save_button_container cursor-pointer">
                                    <span className="txt_style">Save</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}*/}

            {/* Add to Playlist Modal */}
            {addToPlaylistModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-sm">
                        <h3 className="text-lg mb-3">Add track to playlist</h3>
                        <select
                            value={selectedPlaylistId ?? ""}
                            onChange={(e) => setSelectedPlaylistId(Number(e.target.value))}
                            className="w-full mb-4 p-2 rounded bg-gray-800"
                        >
                            <option value="" disabled>
                                Choose playlist
                            </option>
                            {playlists.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setAddToPlaylistModalOpen(false);
                                    setSelectedTrackToAdd(null);
                                    setSelectedPlaylistId(null);
                                }}
                                className="px-4 py-2 bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button onClick={handleConfirmAddToPlaylist} className="px-4 py-2 bg-indigo-600 rounded">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add to Album Modal */}
            {addToAlbumModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-sm">
                        <h3 className="text-lg mb-3">Add track to album</h3>
                        <select
                            value={selectedAlbumId ?? ""}
                            onChange={(e) => setSelectedAlbumId(Number(e.target.value))}
                            className="w-full mb-4 p-2 rounded bg-gray-800"
                        >
                            <option value="" disabled>Choose album</option>
                            {albums.map((a) => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setAddToAlbumModalOpen(false);
                                    setSelectedTrackToAddToAlbum(null);
                                    setSelectedAlbumId(null);
                                }}
                                className="px-4 py-2 bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAddToAlbum} // <-- тут викликаємо функцію
                                className="px-4 py-2 bg-indigo-600 rounded"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Модалка для створення альбому */}
            {albumModalOpen && (

                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_modal_user_edit_container">
                        <div className="profile_page_edit_profile_close_container">
                            <span className="txt_style">Create album</span>
                            <div className="img_style cursor-pointer"
                                 onClick={() => setAlbumModalOpen(false)}

                            >
                                <img src="src/images/icons/close_icon.png" alt="close"/>
                            </div>
                        </div>
                        <div className="user_info_container">
                            <div className="img_container">
                                {albumCoverFile ? (
                                    <img className="img_style_album" src={URL.createObjectURL(albumCoverFile)} alt="UserImage"/>
                                ) : (
                                    <img className="img_style_album bg-white"/>
                                )}
                                <button className="button_container cursor-pointer">
                                    <label className="cursor-pointer txt_style">Edit picture
                                        <input
                                            type="file"
                                            onChange={(e) => setAlbumCoverFile(e.target.files?.[0])}
                                            className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                        />
                                    </label>
                                </button>
                            </div>
                            <div className="user_info_tables_container">
                            <div className="username_container">
                                    <label className="username_title ">Title</label>
                                    <label className="username_input">
                                        <input
                                            type="text"
                                            placeholder="Album Title"
                                            value={albumTitle}
                                            onChange={(e) => setAlbumTitle(e.target.value)}
                                            className="ml-[15px]"
                                        />
                                    </label>
                                </div>
                                <div className="bio_container">
                                    <label className="username_title">Description</label>
                                    <label className="bio_input">
                                    <textarea
                                        placeholder="Description (optional)"
                                        value={albumDescription}
                                        onChange={(e) => setAlbumDescription(e.target.value)}
                                        className="bio_input_2"
                                    />
                                    </label>
                                </div>
                                <div className="button_cancel_save_container">
                                    <button
                                        className="cancel_button cursor-pointer"
                                        onClick={() => setAlbumModalOpen(false)}
                                        disabled={uploading}
                                    >
                                        <span className="txt_style">Cancel</span>
                                    </button>
                                    <button
                                        className="save_button cursor-pointer"
                                        onClick={handleAlbumCreate}
                                    >
                                        <span className="txt_style">{uploading ? "Creating..." : "Create album"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
