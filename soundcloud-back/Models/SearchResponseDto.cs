using soundcloud_back.Models.Album;
using soundcloud_back.Models.Auth;
using soundcloud_back.Models.Playlist;
using soundcloud_back.Models.Track;

namespace soundcloud_back.Models
{
    public class SearchResponseDto
    {
        public PagedResult<TrackSummaryDto> Tracks { get; set; } = new();
        public PagedResult<AlbumSummaryDto> Albums { get; set; } = new();
        public PagedResult<PlaylistSummaryDto> Playlists { get; set; } = new();
        public PagedResult<UserSummaryDto> Users { get; set; } = new();
    }
}
