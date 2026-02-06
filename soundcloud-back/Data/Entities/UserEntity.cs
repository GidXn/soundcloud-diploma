using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Data.Entities
{
    public enum UserRole
    {
        User,
        Moderator,
        Admin
    }

    public class UserEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public UserRole Role { get; set; } = UserRole.User;
        public bool IsBlocked { get; set; } = false;
        public string? AvatarUrl { get; set; }
        
        public string? BannerUrl { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public AuthProvider AuthProvider { get; set; } = AuthProvider.Local;
        public string? GoogleSubject { get; set; }
        public string? FacebookSubject { get; set; }
        public bool IsLocalPasswordSet { get; set; } = true;
    }
}
