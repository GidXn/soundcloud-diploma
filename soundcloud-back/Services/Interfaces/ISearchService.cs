using soundcloud_back.Models;

public interface ISearchService
{
    /// <summary>
    /// Searches tracks, albums, playlists and users.
    /// </summary>
    /// <param name="q">Search query</param>
    /// <param name="trackPage">Tracks page</param>
    /// <param name="trackPageSize">Tracks per page</param>
    /// <param name="albumPage">Albums page</param>
    /// <param name="albumPageSize">Albums per page</param>
    /// <param name="playlistPage">Playlists page</param>
    /// <param name="playlistPageSize">Playlists per page</param>
    /// <param name="userPage">Users page</param>
    /// <param name="userPageSize">Users per page</param>
    /// <param name="types">Which object types to search: tracks, albums, playlists, users</param>
    /// <returns>Search result</returns>
    Task<SearchResponseDto> SearchAsync(
        string q,
        int trackPage = 1,
        int trackPageSize = 8,
        int albumPage = 1,
        int albumPageSize = 6,
        int playlistPage = 1,
        int playlistPageSize = 6,
        int userPage = 1,
        int userPageSize = 6,
        string[]? types = null
    );
}