namespace soundcloud_back.Data.Entities
{
    public class TrackListenEntity
    {
        public int Id { get; set; }
        public int TrackId { get; set; }
        public TrackEntity Track { get; set; } = default!;

        public int UserId { get; set; }   // who listened
        public UserEntity User { get; set; } = default!;
        public int PlayCount { get; set; } = 0;

        public DateTime ListenedAt { get; set; } = DateTime.UtcNow;
    }
}
