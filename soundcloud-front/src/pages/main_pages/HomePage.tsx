import React, {useEffect, useState} from 'react';

import "../../styles/main_pages/home_page/layout.css"
import {trackService} from "../../services/trackApi.ts";
import {ITrack} from "../../types/track.ts";
import {IAlbum} from "../../types/album.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import { albumService } from '../../services/albumAPI.ts';
//import { IUserFollow } from "../../types/follow.ts";


const HomePage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [albums, setAlbums] = useState<IAlbum[]>([]);

    const playTrack = usePlayerStore(state => state.playTrack);
    const playAlbum = usePlayerStore(state => state.playAlbum);

    const [albumTracks, setAlbumTracks] = useState<{ [albumId: number]: ITrack[] }>({});

    useEffect(() => {
        albumService.getAllAlbums()
            .then((data) => setAlbums(data))
            .catch((err) => console.error(err));
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));

    }, []);

    // Fetch tracks for each album
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
                console.error("Failed to load album tracks", err);
            }
        };

        if (albums.length > 0) {
            loadAllAlbumTracks();
        }
    }, [albums]);

    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${track.imageUrl}`;
    };
    const getAlbumImageUrl = (album?: IAlbum | null) => {
        if (!album || !album.coverUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122/${album.coverUrl}`;
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
            <img className="music_buddy_banner" src="\public\inside\homep_banner.png" />
            <div className="albumsContainer relative">
                <div className="sectionTitle baloo2 text-lightpurple text-[24px] font-bold">
                    Albums
                </div>
                <div
                    className="albumsScroll flex overflow-x-auto gap-4 py-4">
                    {albums.slice(0, 7).map(album => (
                        <li className="albumCard flex-shrink-0 w-40" key={album.id}>
                            <img
                                className="albumImage"
                                src={getAlbumImageUrl(album)}
                                alt=""
                                onClick={() => playAlbum(album, albumTracks[album.id] || [])}
                            />
                            <div className="albumInfo">
                                <span className="albumTitle baloo2">
                                    {album.title.length > 16 ? album.title.slice(0, 16) + "…" : album.title}
                                </span>
                                <span className="albumArtist baloo2">{album.description}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
            <div className="noveltyContainer">
                <div className="sectionTitle baloo2 text-lightpurple text-[24px] font-bold">
                    Novelty
                </div>
                <div className="noveltyList">

                    {[...tracks].reverse().slice(0, 20).map((track, index) => (
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
            <img className="hit_fm_banner" src="\public\inside\homep_banner2.png" />
            <div className="popularAlbumsContainer">
                <div className="sectionTitle">
                    Popular albums
                </div>
                <div className="scrollGrid">
                    {[...albums].reverse().slice(0, 12).map(album => (
                        <li className="albumCard flex-shrink-0 w-40" key={album.id}>
                            <img
                                className="albumImage"
                                src={getAlbumImageUrl(album)}
                                alt=""
                                onClick={() => playAlbum(album, albumTracks[album.id] || [])}
                            />
                            <div className="albumInfo">
                    <span className="albumTitle baloo2">
                        {album.title.length > 20 ? album.title.slice(0, 16) + "…" : album.title}
                    </span>
                                <span className="albumArtist baloo2">{album.ownerName}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
            <div className="artistsContainer">
                <div className="sectionTitle baloo2 text-lightpurple text-[24px] font-bold">
                    Artists
                </div>
                <div className="artistsGrid">
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <img className="artistImage" src="public\artists\MaxBarskih.png" />
                        </div>
                        <div className="artistName">Max Barskih</div>
                    </div>
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <img className="artistImage" src="public\artists\Rammstein.png" />
                        </div>
                        <div className="artistName">Rammstein</div>
                    </div>
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <img className="artistImage" src="public\artists\KlavdiaPetrivna.png" />
                        </div>
                        <div className="artistName">Klavdia Petrivna</div>
                    </div>
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <img className="artistImage" src="public\artists\Yaktak.png" />
                        </div>
                        <div className="artistName">Yaktak</div>
                    </div>
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <img className="artistImage" src="public\artists\Volkanov.png" />
                        </div>
                        <div className="artistName">Volkanov</div>
                    </div>
                    <div className="artistCard">
                        <div className="artistImageContainer">
                        <div className="artistImageWrapper">
                            <img className="artistImage" src="public\artists\Drevo.png" />
                        </div>
                        </div>
                        <div className="artistName">Drevo</div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default HomePage;