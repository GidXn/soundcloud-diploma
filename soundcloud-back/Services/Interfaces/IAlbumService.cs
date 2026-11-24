using System.Collections.Generic;
using System.Threading.Tasks;
using soundcloud_back.Models.Album;
using soundcloud_back.Models.Track;

namespace soundcloud_back.Services.Interfaces
{
    public interface IAlbumService
    {
        // ===== CRUD for albums =====

        // Get all public albums and albums of the current user
        Task<IEnumerable<AlbumDto>> GetAllByUserAsync(int userId);

        Task<IEnumerable<AlbumDto>> GetAllPublicAlbumsAsync();


        // Get an album by ID
        Task<AlbumDto?> GetByIdAsync(int albumId);

        // Create a new album
        Task<AlbumDto> CreateAsync(CreateAlbumDto dto);

        // Update an album
        Task UpdateAsync(int albumId, CreateAlbumDto dto);

        // Delete an album
        Task DeleteAsync(int albumId);

        // Upload an album cover
        Task SetCoverAsync(int albumId, string url);

        // ===== For the admin =====
        Task<IEnumerable<AlbumDto>> GetAllAlbumsForAdminAsync();

        // ===== Methods for album tracks =====
        Task<IEnumerable<TrackDto>> GetTracksByAlbumAsync(int albumId);

        Task AddTrackToAlbumAsync(int albumId, int trackId);

        Task RemoveTrackFromAlbumAsync(int albumId, int trackId);
    }
}
