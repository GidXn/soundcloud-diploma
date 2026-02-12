namespace soundcloud_back.Models.Auth
{
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }
}
