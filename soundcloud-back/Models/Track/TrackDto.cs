using soundcloud_back.Models.Album;
using System;

namespace soundcloud_back.Models.Track
{
    public class TrackDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        // Now Author is a relation to User
        public int AuthorId { get; set; }

        // Optional: author name for the frontend
        public string Author { get; set; }
        public int? GenreId { get; set; }

        // Optional: category for the frontend
        public string? Genre { get; set; }

        public TimeSpan Duration { get; set; }

        public bool IsHidden { get; set; }

        // Relation to the album
        //public int AlbumId { get; set; }

        public string? Url { get; set; }

        public string? ImageUrl { get; set; }

        // New field: play count
        public int PlayCount { get; set; }

        // Upload date (for «Top of the year»)
        public DateTime CreatedAt { get; set; }

        public List<AlbumDto>? Albums { get; set; } = new List<AlbumDto>();

        public int LikesCount { get; set; }              // like count
        public bool IsLikedByCurrentUser { get; set; }  // whether the current user liked it
    }
}
