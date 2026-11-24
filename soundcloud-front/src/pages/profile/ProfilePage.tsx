import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateUserProfile, uploadUserBanner } from "../../services/User/user_info.ts";
import { IUser } from "../../types/user.ts";
import { useSubscriptionStore } from "../../store/subscription_store.ts";
import ProfileHero from "../../components/profile/ProfileHero.tsx";
import "../../styles/main_pages/catalog/layout.css";
import "../../styles/profile_page/profile_figma.css";

/* Own profile, Figma «profile» (2304:19314): banner + avatar + name, 64px, a settings list
   (Editing profile, Soc. network, Security, Information about you, Subscriptions and notifications),
   16px, «Send». Figma draws only the collapsed rows; each row opens the fields the backend supports. */

type SectionId = "edit" | "social" | "security" | "about" | "subs";

const Chevron: React.FC = () => (
    <svg className="settings_chevron" width="12" height="24" viewBox="0 0 12 24" fill="none" aria-hidden>
        <path d="M2.5 5.5L9 12l-6.5 6.5" stroke="#B8B8B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ICONS: Record<SectionId, React.ReactNode> = {
    edit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8" r="4.5" stroke="#FFF" strokeWidth="1.5" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    social: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="6" cy="12" r="3" fill="#FFF" /><circle cx="18" cy="5.5" r="3" fill="#FFF" /><circle cx="18" cy="18.5" r="3" fill="#FFF" />
            <path d="M8.6 10.6l6.8-3.7M8.6 13.4l6.8 3.7" stroke="#FFF" strokeWidth="1.5" />
        </svg>
    ),
    security: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="10" width="18" height="12" rx="2" stroke="#FFF" strokeWidth="2" />
            <path d="M7 10V7a5 5 0 019.6-2" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" stroke="#FFF" strokeWidth="2" />
        </svg>
    ),
    about: (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="#FFF" />
        </svg>
    ),
    subs: (
        <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden>
            <path d="M2 0h16a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 3.2V14h16V3.2l-8 5-8-5zM3 2l7 4.4L17 2H3z" fill="#FFF" />
        </svg>
    ),
};

const SECTIONS: { id: SectionId; title: string }[] = [
    { id: "edit", title: "Editing profile" },
    { id: "social", title: "Soc. network" },
    { id: "security", title: "Security" },
    { id: "about", title: "Information about you" },
    { id: "subs", title: "Subscriptions and notifications" },
];

const PLAN_NAMES: Record<string, string> = { free: "Free" };

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const plan = useSubscriptionStore((s) => s.plan);
    const [user, setUser] = useState<IUser | null>(null);
    const [open, setOpen] = useState<SectionId | null>(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((u) => {
                setUser(u);
                setUsername(u.username || "");
                setEmail(u.email || "");
                setBio(u.bio || "");
            })
            .catch((err) => console.error("Failed to load profile", err));
    }, []);

    const dirty = !!user && (
        username.trim() !== (user.username || "") ||
        email.trim() !== (user.email || "") ||
        bio !== (user.bio || "") ||
        !!avatar || !!banner
    );

    const send = async () => {
        if (!user) return;
        if (!dirty) {
            setStatus({ text: "Nothing to save" });
            return;
        }
        if (!username.trim()) {
            setStatus({ text: "Username can’t be empty", error: true });
            return;
        }
        setSaving(true);
        setStatus(null);
        try {
            let next: IUser = user;
            if (username.trim() !== user.username || email.trim() !== user.email || bio !== (user.bio || "") || avatar) {
                next = await updateUserProfile(user.id, {
                    username: username.trim(),
                    email: email.trim(),
                    bio,
                    avatar: avatar ?? undefined,
                });
            }
            if (banner) {
                const res = await uploadUserBanner.updateBanner(user.id, banner);
                next = { ...next, banner: res.bannerUrl };
            }
            setUser({ ...user, ...next });
            setAvatar(null);
            setBanner(null);
            setStatus({ text: "Saved" });
        } catch (err) {
            console.error("Failed to save profile", err);
            setStatus({ text: "Failed to save. Try again.", error: true });
        } finally {
            setSaving(false);
        }
    };

    const fileField = (label: string, file: File | null, onPick: (f: File | null) => void) => (
        <label className="settings_field">
            <span className="settings_field_label">{label}</span>
            <span className="settings_file">
                <span className="settings_file_btn" role="button">Choose file</span>
                <span>{file ? file.name : "No file chosen"}</span>
                <input type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            </span>
        </label>
    );

    const body = (id: SectionId) => {
        switch (id) {
            case "edit":
                return (
                    <>
                        <label className="settings_field">
                            <span className="settings_field_label">Username</span>
                            <input className="settings_input" value={username} maxLength={50} onChange={(e) => setUsername(e.target.value)} />
                        </label>
                        {fileField("Avatar", avatar, setAvatar)}
                        {fileField("Banner", banner, setBanner)}
                    </>
                );
            case "social":
                return <p className="settings_note">Sign-in with Google is available on the login page. Other social networks are not connected yet.</p>;
            case "security":
                return (
                    <>
                        <label className="settings_field">
                            <span className="settings_field_label">Email</span>
                            <input className="settings_input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </label>
                        <div>
                            <button className="settings_file_btn" onClick={() => navigate("/forgot-password")}>Change password</button>
                        </div>
                    </>
                );
            case "about":
                return (
                    <label className="settings_field">
                        <span className="settings_field_label">About you</span>
                        <textarea className="settings_input" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} />
                    </label>
                );
            case "subs":
                return (
                    <>
                        <p className="settings_note">Current plan: {PLAN_NAMES[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                        <div>
                            <button className="settings_file_btn" onClick={() => navigate("/subscribe")}>Manage subscription</button>
                        </div>
                    </>
                );
        }
    };

    return (
        <main className="catalog_page profile_figma_page profile_own_page">
            <ProfileHero user={user} variant="own" online />

            <section className="profile_settings">
                <div className="settings_list">
                    {SECTIONS.map((s) => (
                        <div key={s.id} className={`settings_item ${open === s.id ? "open" : ""}`}>
                            <button
                                className="settings_head"
                                aria-expanded={open === s.id}
                                onClick={() => setOpen((cur) => (cur === s.id ? null : s.id))}
                            >
                                <span className="settings_head_left">
                                    <span className="settings_icon">{ICONS[s.id]}</span>
                                    <span className="settings_title">{s.title}</span>
                                </span>
                                <Chevron />
                            </button>
                            {open === s.id && <div className="settings_body">{body(s.id)}</div>}
                        </div>
                    ))}
                </div>
                <div className="settings_actions">
                    <button className="settings_send" onClick={send} disabled={saving}>
                        {saving ? "Sending…" : "Send"}
                    </button>
                    {status && <span className={`settings_status ${status.error ? "error" : ""}`}>{status.text}</span>}
                </div>
            </section>
        </main>
    );
};

export default ProfilePage;
