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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Зберігаємо enum Role як РЯДОК у БД
            modelBuilder.Entity<UserEntity>()
                .Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(16);

            modelBuilder.Entity<UserEntity>()
                .ToTable(t => t.HasCheckConstraint(
                    "CK_Users_Role_Enum",
                    "\"Role\" IN ('User','Moderator','Admin')"
                ));

            // Унікальні індекси
            modelBuilder.Entity<UserEntity>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<UserEntity>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // зберігаємо enum як string + check-constraint
            modelBuilder.Entity<UserEntity>()
                .Property(x => x.AuthProvider)
                .HasConversion<string>();

            // унікальний індекс на GoogleSubject (NULL дозволений, але якщо не NULL — має бути унікальним)
            modelBuilder.Entity<UserEntity>()
                .HasIndex(u => u.GoogleSubject)
                .IsUnique()
                .HasFilter("\"GoogleSubject\" IS NOT NULL");

            modelBuilder.Entity<UserEntity>()
                .ToTable(t => t.HasCheckConstraint("CK_Users_AuthProvider",
                    "\"AuthProvider\" in ('Local','Google')"));
        }
    }
}
