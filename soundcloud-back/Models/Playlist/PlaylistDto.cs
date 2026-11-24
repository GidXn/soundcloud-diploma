using soundcloud_back.Models.Track;

namespace soundcloud_back.Models.Playlist
{
    public class PlaylistDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // New field: owner user ID
        public int OwnerId { get; set; }

        // Optional: owner username for frontend convenience
        public string OwnerName { get; set; }

        // ✅ Add tracks
        public List<TrackDto> Tracks { get; set; } = new();

        // ✅ Add the playlist cover
        public string? CoverUrl { get; set; }
    }
}
