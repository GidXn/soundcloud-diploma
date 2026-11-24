using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Data.Entities
{
    public class TrackEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        // Author as UserEntity (required)
        [Required]
        public int AuthorId { get; set; }
        public UserEntity Author { get; set; }

        // Track duration
        [Required]
        public TimeSpan Duration { get; set; }

        // URL or file path
        [Required]
        public string Url { get; set; }
        public int PlayCount { get; set; } = 0;


        // Play counter
        public ICollection<TrackListenEntity>? UserPlays { get; set; }

        // For moderation: if hidden, don't show it
        public bool IsHidden { get; set; } = false;

        // Relation «one track — many albums» (many-to-many)
        public ICollection<AlbumTrackEntity> AlbumTracks { get; set; } = new List<AlbumTrackEntity>();

        // Relation «one track — many playlists»
        public ICollection<PlaylistEntity> Playlists { get; set; }

        public string? ImageUrl { get; set; }

        // new
        public int? GenreId { get; set; }   
        public GenreEntity? Genre { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }

        // Relation «one track — many likes»
        public ICollection<TrackLikeEntity> TrackLikes { get; set; } = new List<TrackLikeEntity>();

    }
}
