import React, { useEffect, useState } from 'react';
import { IAlbum } from "../../types/album";
import { ITrack } from "../../types/track";
import { albumService } from "../../services/albumAPI.ts";
import { usePlayerStore } from "../../store/player_store.tsx";
import "../../styles/main_pages/albums_page/layout.css"

const AlbumsCollectionPage: React.FC = () => {
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [albumTracks, setAlbumTracks] = useState<{ [albumId: number]: ITrack[] }>({});

    const playAlbum = usePlayerStore(state => state.playAlbum);
    const playTrack = usePlayerStore(state => state.playTrack);

    useEffect(() => {
        albumService.getAllAlbums()
            .then((data) => setAlbums(data))
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

    const getAlbumImageUrl = (album?: IAlbum | null) => {
        if (!album || !album.coverUrl) return "/default-cover.png";
        return `http://localhost:5122/${album.coverUrl}`;
    };

    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122${track.imageUrl}`;
    };

    return (
        <main className="layout_container mb-[2050px]">
            <img className="nrj_fm_banner" src="\public\inside\homep_banner3.png" />
            {/* Albums List */}
            <div className="albumsListContainer">
                <div className="sectionTitle baloo2 text-lightpurple text-[24px] font-bold">
                    Albums
                </div>
                <div className="albumsList">
                    {[...albums].sort(() => Math.random() - 0.5).map((album, index) => (
                        <React.Fragment key={album.id}>
                            {index !== 0 &&
                                <svg className={"divider"} width="1527" height="1" viewBox="0 0 1527 1" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.5 0.5H1526.5" stroke="#64707C" stroke-linecap="round"/>
                                </svg>
                            }

                            <div className="albumItemRow" onClick={() => playAlbum(album, albumTracks[album.id] || [])}>
                                <div className="albumImageWrapper">
                                    <img className="albumCover" src={getAlbumImageUrl(album)} alt={album.title} />
                                    <div className="albumHeader">
                                        <div className="albumItemTitle">{album.title}</div>
                                    </div>
                                </div>

                                <div className="albumMeta">
                                    <div className="albumDetails">
                                        <span className="albumDescription">{album.description || 'No description'}</span>
                                    </div>
                                </div>

                                <div className="albumActions">
                                    {(albumTracks[album.id] || []).slice(0, 4).map((track) => (
                                        <img
                                            key={track.id}
                                            src={getTrackImageUrl(track)}
                                            alt={track.title}
                                            className="albumTrackIcon"
                                            title={track.title}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playTrack(track, albumTracks[album.id] || []);
                                            }}
                                        />
                                    ))}
                                    {(albumTracks[album.id] || []).length > 4 && (
                                        <div className="albumTracksMore">
                                            +{(albumTracks[album.id] || []).length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default AlbumsCollectionPage;
