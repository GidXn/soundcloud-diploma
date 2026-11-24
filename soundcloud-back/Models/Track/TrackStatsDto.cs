namespace soundcloud_back.Models.Track
{
    public class TrackStatsDto
    {
        public int TrackId { get; set; }
        public string Title { get; set; }

        // Track play counter
        public int PlayCount { get; set; }

        // Track likes
        public int LikeCount { get; set; }
        public string AuthorAvatarUrl { get; set; }

        // Optional: AuthorId and AuthorName, if needed for statistics
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
    }
}