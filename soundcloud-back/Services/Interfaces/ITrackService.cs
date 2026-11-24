using System.Collections.Generic;
using System.Threading.Tasks;
using soundcloud_back.Models.Track;

namespace soundcloud_back.Services.Interfaces
{
    /// <summary>
    /// Service for working with tracks
    /// </summary>
    public interface ITrackService
    {
        // Get all tracks
        Task<IEnumerable<TrackDto>> GetAllByUserAsync(int userId);

        Task<IEnumerable<TrackDto>> GetAllAsync();


        // Get a track by ID
        Task<TrackDto?> GetByIdAsync(int id);
        Task<TrackDto> GetByIdInternalAsync(int id, bool includeUserLikes);

        // Get all tracks (for the frontend)
        Task<IEnumerable<TrackDto>> GetAllTracksAsync();

        // Create a track
        Task<TrackDto> CreateAsync(CreateTrackDto dto);

        // Create a track with a file
        Task<TrackDto> CreateAsyncFile(CreateTrackDto dto);

        // Update a track
        Task<TrackDto> UpdateAsyncFile(int trackId, UpdateTrackDto dto);

        // Delete a track
        Task DeleteAsync(int trackId);

        // Hide/show a track
        Task HideAsync(int id);
        Task UnhideAsync(int id);

        // Update the cover
        Task SetImageAsync(int trackId, string imageUrl);

        // Likes and plays
        Task LikeAsync(int trackId);
        Task UnlikeAsync(int trackId);
        Task AddPlayAsync(int trackId);

        // Statistics
        Task<TrackStatsDto> GetTrackStatsAsync(int trackId);
        Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId);


        Task<List<TrackDto>> GetLikedByUserAsync(int userId);

    }
}
