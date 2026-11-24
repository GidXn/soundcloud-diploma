import { useParams } from "react-router-dom";
import { avatarUrl } from "../../components/people/peopleUtils";
import React, { useEffect, useState } from "react";
import { userService } from "../../services/userApi.ts";
import { IUser } from "../../types/user.ts";
import {followService} from "../../services/followApi.ts";
import ProfilePeoplePanel from "../../components/people/ProfilePeoplePanel.tsx";
import {ITrack} from "../../types/track.ts";
import {trackService} from "../../services/trackApi.ts";
import share from "../../images/icons/share.png";
import {usePlayerStore} from "../../store/player_store.tsx";

import playIcon from "../../images/player/play_icon.png";
import pauseIcon from "../../images/player/pause_icon.png";
import unlike from "../../images/icons/unlike.png";
import like from "../../images/icons/like.png";
import repeat from "../../images/player/repeat_icon.png";
import download from "../../images/icons/download.png";
import contentCopy from "../../images/icons/content_copy.png";
import addPlaylist from "../../images/icons/add_playlist.png";
import reply from "../../images/icons/reply.png";
import {IAlbum} from "../../types/album.ts";
import {albumService} from "../../services/albumAPI.ts";
import {IPlaylist} from "../../types/playlist.ts";
import {playlistService} from "../../services/playlistApi.ts";

const tabs = ["All","Tracks", "Albums", "Playlists" ,"Reposts"];


const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("All");
    const [tracks, setTracks] = useState<ITrack[]>([]);

    // State for albums and tracks per album
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [albumTracks, setAlbumTracks] = useState<{ [albumId: number]: ITrack[] }>({});

    // State for playlists and tracks per playlist
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [playlistTracks, setPlaylistTracks] = useState<{ [playlistId: number]: ITrack[] }>({});

    const playTrack = usePlayerStore(state => state.playTrack);
    const pauseTrack = usePlayerStore((state) => state.pauseTrack);

    const { track: currentTrack, isPlaying,currentAlbumId } = usePlayerStore();
    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));

    }, []);


    useEffect(() => {
        if (!id) return;

        setLoading(true);
        userService.getById(Number(id))
            .then((data) => setUser(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    //for likes
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


    //to show the track count of a given user

    useEffect(() => {
        if (!user) return;

        trackService.getAllByUser(Number(user.id))
            .then(setTracks)
            .catch(err => console.error("Failed to load user tracks:", err));
    }, [user]);

    // Load the user's playlists and tracks
    useEffect(() => {
        if (!user) return;

        const loadUserPlaylistsAndTracks = async () => {
            try {
                // 1️⃣ Get all user playlists
                const userPlaylists = await playlistService.getAllByUser(user.id);
                setPlaylists(userPlaylists);

                // 2️⃣ Load tracks for each playlist
                const results = await Promise.all(
                    userPlaylists.map(async (pl) => {
                        const tracks = await playlistService.getTracks(pl.id);
                        return { id: pl.id, tracks };
                    })
                );

                const tracksByPlaylist = results.reduce(
                    (acc, { id, tracks }) => ({ ...acc, [id]: tracks }),
                    {} as Record<number, ITrack[]>
                );

                setPlaylistTracks(tracksByPlaylist);
            } catch (err) {
                console.error("Failed to load user playlists and tracks", err);
                alert("Failed to load the user's playlists or tracks");
            }
        };

        loadUserPlaylistsAndTracks();
    }, [user]);
    // Load the user's albums and tracks
    useEffect(() => {
        if (!user) return;

        const loadUserAlbumsAndTracks = async () => {
            try {
                // 1️⃣ Get all user albums
                const userAlbums = await albumService.getAllByUser(user.id);
                setAlbums(userAlbums);

                // 2️⃣ Load tracks for each album
                const results = await Promise.all(
                    userAlbums.map(async (a) => {
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
                console.error("Failed to load user albums and tracks", err);
            }
        };

        loadUserAlbumsAndTracks();
    }, [user]);


    //for follow
    // Follower and following counts
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [, setFollowingCount] = useState<number>(0);

    // Whether the current user follows the profile user
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    //following and follower counts
    useEffect(() => {
        const fetchFollowCounts = async () => {
            if (!user) return; // the check is here, not for the hook itself
            try {
                const followers = await followService.getFollowersCount(user.id);
                const following = await followService.getFollowingCount(user.id);

                setFollowersCount(followers);
                setFollowingCount(following);

            } catch (error) {
                console.error("Failed to get following counts:", error);
            }
        };

        fetchFollowCounts();
    }, [user]);


    //follow and unfollow button
    useEffect(() => {
        if (!user) return;

        const fetchFollowStatus = async () => {
            try {
                const status = await followService.getFollowStatus(user.id);
                setIsFollowing(status.isFollowing);
            } catch (error) {
                console.error("Failed to get follow status:", error);
            }
        };

        fetchFollowStatus();
    }, [user]);



    const toggleFollow = async () => {
        if (!user) return;

        try {
            if (isFollowing) {
                await followService.unfollow(user.id);
                setFollowersCount(prev => prev - 1);
            } else {
                await followService.follow(user.id);
                setFollowersCount(prev => prev + 1);
            }
            setIsFollowing(prev => !prev);
        } catch (error) {
            console.error("Failed to follow/unfollow:", error);
        }
    };







    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    const getUserBannerUrl = (user?: IUser | null) => {
        if (!user || !user.banner) return "/src/images/profile/banner.png"; // default banner
        return user.banner.startsWith("http")
            ? user.banner
            : `http://localhost:5122${user.banner}`;
    };

    const getUserImageUrl = (user?: IUser | null) => {
        return avatarUrl(user?.avatar);
    };

    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122/${track.imageUrl}`;
    };



    const toggleLike = async (track: ITrack) => {
        try {
            if (likedTracksIds.includes(track.id)) {
                // unlike
                await trackService.unlike(track.id);
                setLikedTracksIds(prev => prev.filter(id => id !== track.id));
                track.isLikedByCurrentUser = false; // update locally
            } else {
                // like
                await trackService.like(track.id);
                setLikedTracksIds(prev => [...prev, track.id]);
                track.isLikedByCurrentUser = true; // update locally
            }
        } catch (err) {
            console.error("Error liking track:", err);
        }
    };


    return (
        <div className="layout_container mb-[2900px] baloo2">
            <div className="banner_container">
                <img className="banner_image_style" src={getUserBannerUrl(user)} alt="Banner"/>
            </div>
            <div className="profile_page_user_avatar_container" >
                <img className="profile_page_user_avatar_style " src={getUserImageUrl(user)} referrerPolicy="no-referrer" alt="Avatar"/>
            </div>
            <div className="profile_page_user_name_container">
                {user?.username}
            </div>


            <div className="profile_page_right_sidebar">
                <div className="profile_page_bio_container">
                    {user?.bio ? <span>{user.bio}</span> : <span>You don’t have bio :(</span>}
                </div>

                <ProfilePeoplePanel userId={user.id} isOwn={false} tracksCount={tracks.length} followersVersion={followersCount}/>

            </div>

            {/* Tabs */}
            <div className="profile_tabs_container">
                {tabs.map((tab) => (
                    <div key={tab} className="profile_tab_buttons_container  text-white baloo2">
                        <button
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
                        onClick={()=>navigator.clipboard?.writeText(window.location.href)}>
                    <img className="img_style" src={share} alt="shareIcon"/>
                    <span className="txt_style">Share</span>
                </button>
                <div className="edit_button">
                    <button
                        className={isFollowing ? "unfollow_button_container cursor-pointer" : "follow_button_container cursor-pointer"}
                        onClick={toggleFollow}
                    >
                    <span className="txt_style">
                        {isFollowing ? "Unfollow" : "Follow"}
                    </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="profile_tracks_container">

                {activeTab === "All" && (
                    <>
                        {(playlists.length || albums.length) ? (
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
                                                onClick={() => {
                                                    // If the playlist is already playing, pause
                                                    if (
                                                        currentTrack &&
                                                        playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === p.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Otherwise play the first track of the playlist
                                                        playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Tracks of a specific playlist */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // use currentAlbumId for the playlist
                                                    isPlaying ? (
                                                        <img
                                                            src={pauseIcon}
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={playIcon}
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
                                                    <img src={unlike} alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src={repeat}
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 enable
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={download} alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={share} alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={contentCopy} alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={reply} alt="reply"/>
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
                                                onClick={() => {
                                                    // If the album is already playing, pause
                                                    if (
                                                        currentTrack &&
                                                        albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === a.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Otherwise play the first track of the album
                                                        playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Tracks of a specific album */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === a.id &&  // <-- added
                                                    isPlaying ? (
                                                        <img
                                                            src={pauseIcon}
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={playIcon}
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
                                                    <img src={unlike} alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src={repeat}
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={download} alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={share} alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={contentCopy} alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={reply} alt="reply"/>
                                                </div>
                                            </div>
                                        </ul>

                                    </li>

                                ))}
                            </ul>

                        ) : (
                            <p className="text-gray-400 py-4">No playlists or albums yet</p>
                        )}

                    </>
                )}


                {/* Tracks Tab */}
                {activeTab === "Tracks" && (
                    <>
                        {tracks.length ? (
                            <div>
                                {tracks.map((t) => (
                                    <li key={t.id}>
                                        {t.imageUrl && (
                                            <div className="track_container">
                                                <div className="profile_page_track_image_wrapper">
                                                    <img
                                                        src={getTrackImageUrl(t)}
                                                        alt={t.title}
                                                        className="profile_page_track_image"
                                                    />
                                                </div>
                                                <div className="track_controls_container">
                                                    <div className="play_info_track_container">
                                                        <div className="play_pause_track_container">
                                                            {currentTrack?.id === t.id && isPlaying ? (
                                                                <img src={pauseIcon}
                                                                     alt={"playIcon"}
                                                                     onClick={() => pauseTrack()}
                                                                />
                                                            ) : (
                                                                <img src={playIcon}
                                                                     alt={"playIcon"}
                                                                     onClick={() => playTrack(t,tracks)}
                                                                />
                                                            )}

                                                        </div>
                                                        <div className="track_title_author_container">
                                                            <div className="track_title_container">
                                                                {t.title.length > 80 ? t.title.slice(0, 50) + "…" : t.title}
                                                            </div>
                                                        </div>
                                                        <div className="track_duration_range_container">
                                                            <div className="track_author_container">
                                                                {t.author.length > 80 ? t.author.slice(0, 50) + "…" : t.author}
                                                            </div>
                                                        </div>
                                                        <div className="track_genre_container">
                                                            {t.genre}
                                                        </div>
                                                        <div className="track_more_controls_container">
                                                            <div className="track_more_controls_style">
                                                                <img
                                                                    src={t.isLikedByCurrentUser ? like : unlike }
                                                                    alt="like"
                                                                    onClick={() => toggleLike(t)}
                                                                    style={{cursor: "pointer"}}
                                                                />
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img
                                                                    src={repeat}
                                                                    alt="repeatIcon"
                                                                    id="hover_cursor_player"
                                                                />
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src={download}
                                                                     alt="download"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src={share} alt="share"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src={contentCopy}
                                                                     alt="copy"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src={addPlaylist}
                                                                     id="add_playlist_icon"
                                                                     alt="addPlaylist"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src={reply} alt="reply"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </li>
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
                                                onClick={() => {
                                                    // If the playlist is already playing, pause
                                                    if (
                                                        currentTrack &&
                                                        playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === p.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Otherwise play the first track of the playlist
                                                        playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Tracks of a specific playlist */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // use currentAlbumId for the playlist
                                                    isPlaying ? (
                                                        <img
                                                            src={pauseIcon}
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={playIcon}
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
                                                    <img src={unlike} alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src={repeat}
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 enable
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={download} alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={share} alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={contentCopy} alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={reply} alt="reply"/>
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
                            <ul className="text-white baloo2">
                                {albums.map((a) => (
                                    <li key={a.id} className="profile_track_container">
                                        <div className="">
                                            <img
                                                src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                                alt={a.title}
                                                className="profile_page_playlist_image"
                                                onClick={() => {
                                                    // If the album is already playing, pause
                                                    if (
                                                        currentTrack &&
                                                        albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === a.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Otherwise play the first track of the album
                                                        playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Tracks of a specific album */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === a.id &&  // <-- added
                                                    isPlaying ? (
                                                        <img
                                                            src={pauseIcon}
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={playIcon}
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
                                                    <img src={unlike} alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src={repeat}
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={download} alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={share} alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={contentCopy} alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src={reply} alt="reply"/>
                                                </div>
                                            </div>
                                        </ul>

                                    </li>

                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 py-4">No albums yet</p>
                        )}
                    </>
                )}

            </div>





        </div>
    );
};

export default UserProfilePage;
