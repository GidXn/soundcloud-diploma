import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { followService } from "../../services/followApi";
import { trackService } from "../../services/trackApi";
import { IUserFollow } from "../../types/follow";
import { ITrack } from "../../types/track";
import { trackImageUrl } from "../catalog/catalogUtils";
import { avatarUrl, formatCount, HeartIcon, PersonIcon, PlayTriangle } from "./peopleUtils";
import "../../styles/main_pages/people/layout.css";

interface Props {
    userId: number;
    /** Свій профіль: показуємо LIKES (бекенд віддає лайки лише поточного користувача) */
    isOwn: boolean;
    tracksCount: number;
    /** Зовнішня зміна кількості підписників (кнопка Follow у шапці чужого профілю) */
    followersVersion?: number;
}

const LIKES_PREVIEW = 3;
const FOLLOWERS_PREVIEW = 5;
const FOLLOWING_PREVIEW = 2;

// Права панель профілю з макету «profile PEOPLE»:
// Followers / Following / Tracks, LIKES, аватари підписників, список підписок з кнопкою Follow.
const ProfilePeoplePanel: React.FC<Props> = ({ userId, isOwn, tracksCount, followersVersion = 0 }) => {
    // не показуємо кнопку Follow навпроти самого себе (бек відповідає 400)
    const myId = useSelector((state: RootState) => state.user.user?.id);
    const navigate = useNavigate();
    const [followers, setFollowers] = useState<IUserFollow[]>([]);
    const [following, setFollowing] = useState<IUserFollow[]>([]);
    const [likes, setLikes] = useState<ITrack[]>([]);
    // Чи підписаний поточний користувач на людей зі списку Following
    const [followed, setFollowed] = useState<Record<number, boolean>>({});

    const base = isOwn ? "" : `/user/${userId}`;

    const loadPeople = useCallback(async () => {
        try {
            const [fs, fg] = await Promise.all([
                followService.getFollowers(userId),
                followService.getFollowing(userId),
            ]);
            setFollowers(fs);
            setFollowing(fg);

            if (localStorage.getItem("token")) {
                const preview = fg.slice(0, FOLLOWING_PREVIEW);
                const statuses = await Promise.all(
                    preview.map((u) => followService.getFollowStatus(u.id).catch(() => null))
                );
                const map: Record<number, boolean> = {};
                preview.forEach((u, i) => { map[u.id] = statuses[i]?.isFollowing ?? isOwn; });
                setFollowed(map);
            }
        } catch (err) {
            console.error("Failed to load followers/following", err);
        }
    }, [userId, isOwn]);

    useEffect(() => { loadPeople(); }, [loadPeople, followersVersion]);

    useEffect(() => {
        if (!isOwn) return;
        const load = () => trackService.getLikedTracks().then(setLikes).catch(() => setLikes([]));
        load();
        window.addEventListener("favorites-changed", load);
        return () => window.removeEventListener("favorites-changed", load);
    }, [isOwn]);

    const toggleFollow = async (u: IUserFollow) => {
        const isFollowing = followed[u.id];
        try {
            if (isFollowing) await followService.unfollow(u.id);
            else await followService.follow(u.id);
            setFollowed((prev) => ({ ...prev, [u.id]: !isFollowing }));
            if (isOwn) setFollowing((prev) => prev.map((x) => x.id === u.id
                ? { ...x, followersCount: (x.followersCount || 0) + (isFollowing ? -1 : 1) }
                : x));
        } catch (err) {
            console.error("Failed to toggle follow", err);
        }
    };

    const openUser = (u: IUserFollow) => navigate(`/user/${u.id}`);

    return (
        <aside className="people_panel">
            <div className="people_panel_stats">
                <button className="people_stat" onClick={() => navigate(`${base}/followers`)}>
                    <span className="people_stat_label">Followers</span>
                    <span className="people_stat_value">{followers.length}</span>
                </button>
                <button className="people_stat" onClick={() => navigate(`${base}/following`)}>
                    <span className="people_stat_label">Following</span>
                    <span className="people_stat_value">{following.length}</span>
                </button>
                <div className="people_stat">
                    <span className="people_stat_label">Tracks</span>
                    <span className="people_stat_value">{tracksCount}</span>
                </div>
            </div>

            <div className="people_panel_sections">
                {isOwn && (
                    <section className="people_section">
                        <div className="people_section_head">
                            <span>{likes.length} LIKES</span>
                            <button className="people_view_all" onClick={() => navigate("/favorite")}>View all</button>
                        </div>
                        <div className="people_likes">
                            {likes.length === 0 && <span className="people_empty">You don’t have likes yet</span>}
                            {likes.slice(0, LIKES_PREVIEW).map((t) => (
                                <div key={t.id} className="people_like">
                                    <img className="people_like_cover" src={trackImageUrl(t)} alt="" />
                                    <div className="people_like_info">
                                        <span className="people_like_text">{t.author}</span>
                                        <span className="people_like_text">{t.author} - {t.title}</span>
                                        <div className="people_like_meta">
                                            <span><PlayTriangle />{formatCount(t.playCount)}</span>
                                            <span><HeartIcon size={13} color="#D9D9D9" filled />{formatCount((t as ITrack & { likesCount?: number }).likesCount)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="people_section">
                    <div className="people_section_head">
                        <span>{followers.length} Followers</span>
                        <button className="people_view_all" onClick={() => navigate(`${base}/followers`)}>View all</button>
                    </div>
                    {followers.length === 0 ? (
                        <span className="people_empty">No followers yet</span>
                    ) : (
                        <div className="people_stack">
                            {followers.slice(0, FOLLOWERS_PREVIEW).map((u) => (
                                <img
                                    key={u.id}
                                    className="people_stack_avatar"
                                    src={avatarUrl(u.avatarUrl)}
                                    alt={u.username}
                                    title={u.username}
                                    onClick={() => openUser(u)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="people_section">
                    <div className="people_section_head">
                        <span>{following.length} Following</span>
                        <button className="people_view_all" onClick={() => navigate(`${base}/following`)}>View all</button>
                    </div>
                    <div className="people_following">
                        {following.length === 0 && <span className="people_empty">Not following anyone yet</span>}
                        {following.slice(0, FOLLOWING_PREVIEW).map((u) => (
                            <div key={u.id} className="people_following_row">
                                <button className="people_following_user" onClick={() => openUser(u)}>
                                    <img className="people_following_avatar" src={avatarUrl(u.avatarUrl)} alt="" />
                                    <span className="people_following_text">
                                        <span className="people_following_name">{u.username}</span>
                                        <span className="people_following_count">
                                            <PersonIcon size={12} />{formatCount(u.followersCount)}
                                        </span>
                                    </span>
                                </button>
                                {localStorage.getItem("token") && u.id !== myId && (
                                    <button
                                        className={`people_follow_btn ${followed[u.id] ? "is_following" : ""}`}
                                        onClick={() => toggleFollow(u)}
                                    >
                                        {followed[u.id] ? "Following" : "Follow"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </aside>
    );
};

export default ProfilePeoplePanel;
