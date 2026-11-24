import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { userService } from "../../services/userApi.ts";
import { followService } from "../../services/followApi.ts";
import { trackService } from "../../services/trackApi.ts";
import { albumService } from "../../services/albumAPI.ts";
import { playlistService } from "../../services/playlistApi.ts";
import { IUser } from "../../types/user.ts";
import { ITrack } from "../../types/track.ts";
import { IAlbum } from "../../types/album.ts";
import { IPlaylist } from "../../types/playlist.ts";
import ProfilePeoplePanel from "../../components/people/ProfilePeoplePanel.tsx";
import ProfileHero, { FollowIcon } from "../../components/profile/ProfileHero.tsx";
import RecentRelease from "../../components/profile/RecentRelease.tsx";
import { MediaCard, TrackTable, yearOf } from "../../components/detail/DetailParts";
import { mediaUrl } from "../../components/catalog/catalogUtils";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/profile_page/profile_figma.css";

/* Another user's profile, Figma «profile PEOPLE» (2649:647):
   banner + avatar + name + Follow, 32px, tabs All / Popular Tracks / Track / Albums / PlayList, 40px,
   content (1132) and the people panel (332) 64px apart. «All» is the «Recent» card from the design. */

const TABS = ["All", "Popular Tracks", "Track", "Albums", "PlayList"] as const;
type Tab = typeof TABS[number];

const byDateDesc = <T extends { createdAt?: string; id: number }>(a: T, b: T) =>
    (b.createdAt || "").localeCompare(a.createdAt || "") || b.id - a.id;

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const navigate = useNavigate();
    const myId = useSelector((state: RootState) => state.user.user?.id);

    const [user, setUser] = useState<IUser | null>(null);
    const [tab, setTab] = useState<Tab>("All");
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersVersion, setFollowersVersion] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setTab("All");
        setLoading(true);
        // The API answers 404 when a user has no tracks: treat it as an empty list
        Promise.all([
            userService.getById(userId).then(setUser).catch((err) => console.error("Failed to load user", err)),
            trackService.getAllByUser(userId).catch(() => [] as ITrack[]).then((t) => setTracks(t.filter((x) => !x.isHidden))),
            albumService.getAllByUser(userId).catch(() => [] as IAlbum[]).then(setAlbums),
            playlistService.getAllByUser(userId).catch(() => [] as IPlaylist[]).then(setPlaylists),
        ]).finally(() => setLoading(false));
        if (localStorage.getItem("token")) {
            followService.getFollowStatus(userId).then((s) => setIsFollowing(s.isFollowing)).catch(() => undefined);
        }
    }, [userId]);

    const toggleFollow = async () => {
        try {
            if (isFollowing) await followService.unfollow(userId);
            else await followService.follow(userId);
            setIsFollowing(!isFollowing);
            setFollowersVersion((v) => v + 1);
        } catch (err) {
            console.error("Failed to follow/unfollow", err);
        }
    };

    const popular = useMemo(() => [...tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0) || b.id - a.id), [tracks]);
    const newest = useMemo(() => [...tracks].sort(byDateDesc), [tracks]);
    const latestAlbum = useMemo(() => [...albums].sort(byDateDesc)[0] ?? null, [albums]);

    const canFollow = !!localStorage.getItem("token") && userId !== myId;
    const followButton = canFollow ? (
        <button className={`profile_follow_btn ${isFollowing ? "is_following" : ""}`} onClick={toggleFollow}>
            <FollowIcon />
            <span>{isFollowing ? "Following" : "Follow"}</span>
        </button>
    ) : undefined;

    return (
        <main className="catalog_page profile_figma_page profile_people_page">
            <ProfileHero user={user} variant="people" action={followButton} />

            <nav className="profile_tabs" aria-label="Profile sections">
                {TABS.map((t) => (
                    <button key={t} className={`profile_tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                        {t}
                    </button>
                ))}
            </nav>

            <div className="profile_body">
                <div className="profile_main">
                    {loading && <div className="catalog_state">Loading…</div>}

                    {!loading && tab === "All" && (
                        latestAlbum || newest.length
                            ? <RecentRelease album={latestAlbum} fallbackTracks={newest} ownerName={user?.username ?? ""} />
                            : <div className="detail_empty">No releases yet</div>
                    )}

                    {!loading && tab === "Popular Tracks" && (
                        popular.length ? <TrackTable tracks={popular} /> : <div className="detail_empty">No tracks yet</div>
                    )}

                    {!loading && tab === "Track" && (
                        newest.length ? <TrackTable tracks={newest} /> : <div className="detail_empty">No tracks yet</div>
                    )}

                    {!loading && tab === "Albums" && (
                        albums.length ? (
                            <div className="profile_cards">
                                {albums.map((a) => (
                                    <MediaCard
                                        key={a.id}
                                        cover={mediaUrl(a.coverUrl)}
                                        title={a.title}
                                        meta={[yearOf(a.createdAt), a.ownerName]}
                                        onClick={() => navigate(`/album/${a.id}`)}
                                    />
                                ))}
                            </div>
                        ) : <div className="detail_empty">No albums yet</div>
                    )}

                    {!loading && tab === "PlayList" && (
                        playlists.length ? (
                            <div className="profile_cards">
                                {playlists.map((p) => (
                                    <MediaCard
                                        key={p.id}
                                        cover={mediaUrl(p.coverUrl)}
                                        title={p.name}
                                        meta={[p.ownerName]}
                                        onClick={() => navigate(`/play-playlist/${p.id}`)}
                                    />
                                ))}
                            </div>
                        ) : <div className="detail_empty">No playlists yet</div>
                    )}
                </div>

                {userId > 0 && (
                    <ProfilePeoplePanel userId={userId} isOwn={false} tracksCount={tracks.length} followersVersion={followersVersion} />
                )}
            </div>
        </main>
    );
};

export default UserProfilePage;
