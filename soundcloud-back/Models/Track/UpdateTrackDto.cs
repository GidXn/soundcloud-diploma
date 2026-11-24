using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace soundcloud_back.Models.Track
{
    public class UpdateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string? Title { get; set; }


        // The track file can be updated, optional
        public IFormFile? File { get; set; }

        // The cover can be updated, optional
        public IFormFile? Cover { get; set; }
        public int? GenreId { get; set; }

        // New field: list of albums the track belongs to
        public List<int>? AlbumIds { get; set; }
    }
}