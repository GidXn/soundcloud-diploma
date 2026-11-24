using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace soundcloud_back.Models.Album
{
    public class CreateAlbumDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        // Required album owner
        [Required]
        public int OwnerId { get; set; }

        public IFormFile? CoverUrl { get; set; }

        // New field: album visibility
        public bool IsPublic { get; set; } = true; // public by default
    }
}
