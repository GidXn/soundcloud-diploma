using soundcloud_back.Models.Playlist;
using soundcloud_back.Models.Track;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soundcloud_back.Services.Interfaces
{
    public interface IPlaylistService
    {
        // Get all playlists of a specific user
        Task<IEnumerable<PlaylistDto>> GetAllAsync(int userId);

        // Get a playlist by ID
        Task<PlaylistDto?> GetByIdAsync(int id);

        // Create a playlist for a specific user
        Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto);

        // Update a playlist
        Task UpdateAsync(int playlistId, CreatePlaylistDto dto);

        // Delete a playlist
        Task DeleteAsync(int playlistId);

        // Update the playlist cover
        Task SetCoverAsync(int playlistId, IFormFile url);


        //
        Task AddTrackAsync(int playlistId, int trackId);
        Task RemoveTrackAsync(int playlistId, int trackId);

        Task<IEnumerable<TrackDto>> GetTracksByPlaylistAsync(int playlistId);


        //Task<IEnumerable<TrackDto>> GetTracksByPlaylistAsync(int playlistId);

        Task<IEnumerable<PlaylistDto>> GetAllByUserIdAsync(int userId);


    }
}