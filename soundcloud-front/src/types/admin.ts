// Rows of the admin tables (shapes returned by the Admin / Track / Album / Playlist / Categories endpoints)

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: number | string; // 0 / 2 or "User" / "Admin"
    isBlocked?: boolean;
}

export interface AdminTrack {
    id: number;
    title: string;
    duration?: string;
    albumId?: number;
    genreId?: number;
    hidden?: boolean;
}

export interface AdminAlbum {
    id: number;
    title: string;
    description?: string;
    ownerId?: number;
    owner?: { id?: number; username?: string };
    isPublic?: boolean;
}

export interface AdminPlaylist {
    id: number;
    name?: string;
    title?: string;
    description?: string;
}

export interface AdminCategory {
    id: number;
    name: string;
    slug: string;
}

// Values of the admin forms: antd gives loosely typed objects
export type FormValues = Record<string, unknown>;

// antd Upload value: a list of files with the original File
export type UploadList = { originFileObj?: File }[] | undefined;

export interface TrackFormValues {
    title: string;
    duration: string;
    albumId: string | number;
    genreId: string | number;
    file?: UploadList;
    cover?: UploadList;
}
