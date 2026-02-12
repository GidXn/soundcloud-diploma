using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soundcloud_back.Data.Entities
{
    public class FollowEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FollowerId { get; set; }   // хто підписується мої підписники

        [Required]
        public int FollowingId { get; set; }  // на кого підписується мої підписки

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навігаційні властивості
        [ForeignKey(nameof(FollowerId))]
        public UserEntity Follower { get; set; }

        [ForeignKey(nameof(FollowingId))]
        public UserEntity Following { get; set; }
    }
}
