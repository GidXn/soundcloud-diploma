using soundcloud_back.Data.Entities;

namespace soundcloud_back.Models.Auth
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserRole Role { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AuthProvider { get; set; }
        public bool IsLocalPasswordSet { get; set; }
    }
}
