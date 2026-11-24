namespace soundcloud_back.Models.Auth
{
    /// <summary>
    /// Public user data for lists Followers / Following
    /// (without email, password hash, etc).
    /// </summary>
    public class FollowUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; }
    }
}
