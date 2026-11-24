using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Models.Playlist
{
    public class CreatePlaylistDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        // Owner
        [Required]
        public int OwnerId { get; set; }

        // Cover file
        public IFormFile? Cover { get; set; }
        public string? CoverUrl { get; set; }
    }
}
