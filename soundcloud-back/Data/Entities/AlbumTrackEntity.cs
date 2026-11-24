using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soundcloud_back.Data.Entities
{
    public class AlbumTrackEntity
    {
        [Key]
        public int Id { get; set; }

        // Relation to the album
        [Required]
        public int AlbumId { get; set; }
        public AlbumEntity Album { get; set; }

        // Relation to the track
        [Required]
        public int TrackId { get; set; }
        public TrackEntity Track { get; set; }

        // Extra fields (optional)
        public int Order { get; set; } // track position in the album
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
