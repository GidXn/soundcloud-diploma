using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soundcloud_back.Data.Entities
{
    public class FollowEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FollowerId { get; set; }   // who follows: my followers

        [Required]
        public int FollowingId { get; set; }  // whom they follow: my followings

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey(nameof(FollowerId))]
        public UserEntity Follower { get; set; }

        [ForeignKey(nameof(FollowingId))]
        public UserEntity Following { get; set; }
    }
}
