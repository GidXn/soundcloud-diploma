using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace soundcloud_back.Models.Track
{
    public class CreateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        // Now we always pass AuthorId

        // For the track file
        [Required]
        public IFormFile File { get; set; }

        // Cover
        [Required]
        public IFormFile Cover { get; set; }


        // Album (required)
        //[Required]
        //public int AlbumId { get; set; }

        // Optional: genre
        public int? GenreId { get; set; }

        // Here we add the list of album IDs
        public List<int>? AlbumIds { get; set; }
    }
}
