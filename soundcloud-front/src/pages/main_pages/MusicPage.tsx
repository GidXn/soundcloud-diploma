import React, { useEffect, useState } from 'react';
import { ITrack } from "../../types/track";
import { trackService } from "../../services/trackApi.ts";
import { usePlayerStore } from "../../store/player_store.tsx";
import "../../styles/main_pages/music_page/layout.css"

const MusicPage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);

    const playTrack = usePlayerStore(state => state.playTrack);


    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));

    }, []);
    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${track.imageUrl}`;
    };




    //для лайків
    // const [likedTracksIds, setLikedTracksIds] = useState<number[]>([]);
    // useEffect(() => {
    //     trackService.getAll()
    //         .then((data) => {
    //             setTracks(data);
    //             const likedIds = data.filter(t => t.isLikedByCurrentUser).map(t => t.id);
    //             setLikedTracksIds(likedIds);
    //         })
    //         .catch((err) => console.error(err));
    // }, []);

    // const toggleLike = async (track: ITrack) => {
    //     try {
    //         if (likedTracksIds.includes(track.id)) {
    //             // анлайк
    //             await trackService.unlike(track.id);
    //             setLikedTracksIds(prev => prev.filter(id => id !== track.id));
    //             track.isLikedByCurrentUser = false; // оновлюємо локально
    //             addtoHistory(track);
    //             trackService.getAll()
    //         } else {
    //             // лайк
    //             await trackService.like(track.id);
    //             setLikedTracksIds(prev => [...prev, track.id]);
    //             track.isLikedByCurrentUser = true; // оновлюємо локально
    //             addtoHistory(track);
    //             trackService.getAll()
    //         }
    //     } catch (err) {
    //         console.error("Error liking track:", err);
    //     }
    // };

    function formatTimeSpan(ts: string): string {
        const [h, m, s] = ts.split(":");
        const seconds = s.split(".")[0];

        const totalMinutes = Number(h) * 60 + Number(m);
        return `${totalMinutes}:${seconds}`;
    }


    return (
        <main className="layout_container mb-[2050px]">
            <img className="music_hit_fm_banner" src="\public\inside\homep_banner2.png" />
            {/* Music List */}
            <div className="musicContainer">
                <div className="sectionTitle baloo2 text-lightpurple text-[24px] font-bold">
                    Music
                </div>
                <div className="musicList">

                    {[...tracks].sort(() => Math.random() - 0.5).slice(0, 30).map((track, index) => (
                    <>
                        {index !== 0 &&
                    <svg className={"divider"} width="1527" height="1" viewBox="0 0 1527 1" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.5 0.5H1526.5" stroke="#64707C" stroke-linecap="round"/>
                    </svg>}

                    <div className="trackItem" onClick={() => playTrack(track, tracks)}>
                        <div className="trackImageWrapper">
                            <img className="trackCover" src={getTrackImageUrl(track)} alt={""}/>
                            <div className="trackHeader">
                                <div className="trackName">{track.title}</div>
                            </div>
                        </div>
                        <div className="trackMeta">
                            <div className="trackDetails">
                                <div className="trackArtistNovelt">{track.author}</div>
                                <div className="trackGenre">{track.genre}</div>
                                {/* <div className="frame-355">
                                </div> */}
                            </div>
                            <div className="trackActions">
                                <svg className="likeIcon" width="22" height="20" viewBox="0 0 22 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M6.5 1C3.4625 1 1 3.4625 1 6.5C1 12 7.5 17 11 18.163C14.5 17 21 12 21 6.5C21 3.4625 18.5375 1 15.5 1C13.64 1 11.995 1.9235 11 3.337C10.4928 2.61469 9.81897 2.0252 9.03568 1.61841C8.25238 1.21162 7.38263 0.999502 6.5 1Z"
                                        stroke="#9E7FCF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>

                                <div className="trackDuration">{formatTimeSpan(track.duration)}</div>
                            </div>
                        </div>
                    </div></>))}
                </div>
            </div>
        </main>
    );
}

export default MusicPage;
