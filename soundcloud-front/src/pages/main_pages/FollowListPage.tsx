import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { followService } from "../../services/followApi";
import { getCurrentUser } from "../../services/User/user_info";
import { IUserFollow } from "../../types/follow";
import { avatarUrl } from "../../components/people/peopleUtils";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/main_pages/people/layout.css";

interface Props {
    mode: "following" | "followers";
}

// Following / Followers pages (design: 6-column grid, round avatars 230px)
const FollowListPage: React.FC<Props> = ({ mode }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState<IUserFollow[]>([]);
    const [myId, setMyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const me = await getCurrentUser().catch(() => null);
                if (!cancelled) setMyId(me?.id ?? null);
                const userId = id ? Number(id) : me?.id;
                if (!userId) return;
                const list = mode === "following"
                    ? await followService.getFollowing(userId)
                    : await followService.getFollowers(userId);
                if (!cancelled) setUsers(list);
            } catch (err) {
                console.error(`Failed to load ${mode}`, err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id, mode]);

    const openUser = (u: IUserFollow) => navigate(u.id === myId ? "/profile" : `/user/${u.id}`);

    return (
        <main className="catalog_page people_page">
            <h1 className="catalog_title people_title">{mode === "following" ? "Following" : "Followers"}</h1>

            {loading && <div className="catalog_state">Loading…</div>}
            {!loading && users.length === 0 && (
                <div className="catalog_state">
                    {mode === "following" ? "You don't follow anyone yet" : "No followers yet"}
                </div>
            )}

            <div className="people_grid">
                {users.map((u) => (
                    <button key={u.id} className="people_card" onClick={() => openUser(u)}>
                        <img className="people_avatar" src={avatarUrl(u.avatarUrl)} referrerPolicy="no-referrer" alt="" />
                        <span className="people_name">{u.username}</span>
                    </button>
                ))}
            </div>
        </main>
    );
};

export default FollowListPage;
