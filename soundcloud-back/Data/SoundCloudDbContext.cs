using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data.Entities;

namespace soundcloud_back.Data;

public class SoundCloudDbContext : DbContext
{
    public SoundCloudDbContext(DbContextOptions<SoundCloudDbContext> options)
        : base(options)
    {
    }
    public DbSet<GenreEntity> Genres { get; set; }
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<TrackEntity> Tracks { get; set; }
    public DbSet<AlbumEntity> Albums { get; set; }
    public DbSet<PlaylistEntity> Playlists { get; set; }
    public DbSet<CategoryEntity> Categories { get; set; }
    public DbSet<TrackListenEntity> TrackListens { get; set; }
    public DbSet<TrackLikeEntity> TrackLikes { get; set; }
    public DbSet<AlbumTrackEntity> AlbumTracks { get; set; }
    public DbSet<FollowEntity> Follows { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // base configuration call (keep it)

        // Store the Role enum as a STRING in the DB (so the column shows 'User'/'Moderator'/'Admin')
        modelBuilder.Entity<UserEntity>()
        .Property(u => u.Role)
        .HasConversion<string>()
        .HasMaxLength(16);

        modelBuilder.Entity<UserEntity>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Users_Role_Enum",
                "\"Role\" IN ('User','Moderator','Admin')"
            ));

        // Unique indexes
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Album → User (Owner)
        modelBuilder.Entity<AlbumEntity>()
            .HasOne(a => a.Owner)
            .WithMany(u => u.Albums)
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Playlist → User (Owner)
        modelBuilder.Entity<PlaylistEntity>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Playlists)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Track → User (Author)
        modelBuilder.Entity<TrackEntity>()
            .HasOne(t => t.Author)          // new navigation property in TrackEntity
            .WithMany(u => u.Tracks)            // in UserEntity: ICollection<TrackEntity> Tracks
            .HasForeignKey(t => t.AuthorId)     // is required
            .OnDelete(DeleteBehavior.Restrict);

      

        modelBuilder.Entity<TrackListenEntity>()
       .HasOne(p => p.User)
       .WithMany(u => u.TrackPlays)
       .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<TrackListenEntity>()
            .HasOne(p => p.Track)
            .WithMany(t => t.UserPlays)
            .HasForeignKey(p => p.TrackId);

        // TrackLike: uniqueness of a user's like
        modelBuilder.Entity<TrackLikeEntity>()
            .HasIndex(x => new { x.TrackId, x.UserId })
            .IsUnique();


        modelBuilder.Entity<TrackLikeEntity>()
            .HasOne(l => l.Track).WithMany()
            .HasForeignKey(l => l.TrackId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TrackLikeEntity>()
            .HasOne(l => l.User).WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // store the enum as string + check-constraint
        modelBuilder.Entity<UserEntity>()
            .Property(x => x.AuthProvider)
            .HasConversion<string>();

        // unique index on GoogleSubject (NULL allowed, but if not NULL it must be unique)
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.GoogleSubject)
            .IsUnique()
            .HasFilter("\"GoogleSubject\" IS NOT NULL");

        modelBuilder.Entity<UserEntity>()
         .ToTable(t => t.HasCheckConstraint("CK_Users_AuthProvider",
            "\"AuthProvider\" in ('Local','Google')"));

        // 🔹 AlbumTrack (many-to-many: Album ↔ Track)
        modelBuilder.Entity<AlbumTrackEntity>()
            .HasKey(at => new { at.AlbumId, at.TrackId });

        modelBuilder.Entity<AlbumTrackEntity>()
            .HasOne(at => at.Album)
            .WithMany(a => a.AlbumTracks)
            .HasForeignKey(at => at.AlbumId);

        modelBuilder.Entity<AlbumTrackEntity>()
            .HasOne(at => at.Track)
            .WithMany(t => t.AlbumTracks)
            .HasForeignKey(at => at.TrackId);

        // Follow: uniqueness of the pair (FollowerId, FollowingId)
        modelBuilder.Entity<FollowEntity>()
            .HasIndex(f => new { f.FollowerId, f.FollowingId })
            .IsUnique();

        modelBuilder.Entity<FollowEntity>()
            .HasOne(f => f.Follower)
            .WithMany()
            .HasForeignKey(f => f.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FollowEntity>()
            .HasOne(f => f.Following)
            .WithMany()
            .HasForeignKey(f => f.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);
    }

}

