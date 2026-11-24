namespace soundcloud_back.Models.Album
{
    public class AlbumDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }

        // New fields for the relation to the user
        public int OwnerId { get; set; }

        // Optional: owner name for display on the frontend
        public string OwnerName { get; set; }

        public string? CoverUrl { get; set; }

        // New field: album visibility
        public bool IsPublic { get; set; }
    }
}
