using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data.Entities;

namespace soundcloud_back.Data
{
    public class SoundCloudDbContext : DbContext
    {
        public SoundCloudDbContext(DbContextOptions<SoundCloudDbContext> options)
            : base(options)
        {
        }
        public DbSet<GenreEntity> Genres { get; set; }
        public DbSet<UserEntity> Users { get; set; }
    }
}
