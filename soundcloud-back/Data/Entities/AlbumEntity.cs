using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Data.Entities
{
    public class AlbumEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Album author (required)
        [Required]
        public int OwnerId { get; set; }
        public UserEntity Owner { get; set; }

        // Tracks in the album
        public ICollection<AlbumTrackEntity> AlbumTracks { get; set; } = new List<AlbumTrackEntity>();

        public string? CoverUrl { get; set; }

        // new
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }

        public bool IsPublic { get; set; } = true; // public by default
    }
}