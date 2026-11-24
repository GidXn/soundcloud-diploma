namespace soundcloud_back.Models.Auth
{
    /// <summary>
    /// Публічні дані користувача для списків Followers / Following
    /// (без email, хешу пароля тощо).
    /// </summary>
    public class FollowUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; }
    }
}
