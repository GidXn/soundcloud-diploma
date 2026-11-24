using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data;
using soundcloud_back.Data.Entities;
using soundcloud_back.Models.Album;
using soundcloud_back.Models.Track;
using soundcloud_back.Services.Interfaces;
using System.Security.Claims;
using TagLib;

namespace soundcloud_back.Services.Implementations
{
    public class TrackService : ITrackService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TrackService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private (int ActorId, UserRole ActorRole) GetActor()
        {
            var principal = _httpContextAccessor.HttpContext?.User
                ?? throw new UnauthorizedAccessException("No user in context");

            var idStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("No NameIdentifier claim");

            var roleStr = principal.FindFirst(ClaimTypes.Role)?.Value ?? nameof(UserRole.User);
            if (!Enum.TryParse<UserRole>(roleStr, out var role)) role = UserRole.User;

            return (int.Parse(idStr), role);
        }



        public async Task AddPlayAsync(int trackId)
        {
            // Find the track in the DB
            var track = await _db.Tracks
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new Exception("Track not found");

            var ownerId = track.AuthorId; // id the user who created the track

            // Add one play to the track itself
            track.PlayCount += 1;

            // Look for an existing TrackListen record for the owner
            var listen = await _db.TrackListens
                .FirstOrDefaultAsync(x => x.TrackId == trackId && x.UserId == ownerId);

            if (listen != null)
            {
                listen.PlayCount = track.PlayCount;
            }
            else
            {
                listen = new TrackListenEntity
                {
                    TrackId = trackId,
                    UserId = ownerId,
                    PlayCount = 1
                };
                await _db.TrackListens.AddAsync(listen);
            }

            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<TrackDto>> GetAllByUserAsync(int userId)
        {
            var tracks = await _db.Tracks
                .AsNoTracking()
                .Where(t => t.AuthorId == userId) // filter only the user's tracks
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .ToListAsync();

            return tracks.Select(t => new TrackDto
            {
                Id = t.Id,
                Title = t.Title,
                AuthorId = t.AuthorId,
                Author = t.Author.Username,
                Duration = t.Duration,
                Url = t.Url,
                ImageUrl = t.ImageUrl,
                IsHidden = t.IsHidden,
                PlayCount = t.PlayCount,
                CreatedAt = t.CreatedAt,
                GenreId = t.GenreId ?? 0,
                Genre = t.Genre != null ? t.Genre.Name : null,
                Albums = t.AlbumTracks.Select(at => new AlbumDto
                {
                    Id = at.Album.Id,
                    Title = at.Album.Title,
                    OwnerId = at.Album.OwnerId,
                    OwnerName = at.Album.Owner.Username,
                    CoverUrl = at.Album.CoverUrl,
                    CreatedAt = at.Album.CreatedAt,
                    IsPublic = at.Album.IsPublic
                }).ToList()
            });
        }


        public async Task<IEnumerable<TrackDto>> GetAllAsync()
        {
            var (actorId, _) = GetActor(); // id of the current user

            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.TrackLikes) // load likes
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    CreatedAt = t.CreatedAt,
                    GenreId = t.GenreId.HasValue ? (int)t.GenreId.Value : 0,
                    Genre = t.Genre != null ? t.Genre.Name : null,
                    Albums = t.AlbumTracks
                        .Select(at => new AlbumDto
                        {
                            Id = at.Album.Id,
                            Title = at.Album.Title,
                            OwnerId = at.Album.OwnerId,
                            OwnerName = at.Album.Owner.Username,
                            CoverUrl = at.Album.CoverUrl,
                            CreatedAt = at.Album.CreatedAt,
                            IsPublic = at.Album.IsPublic
                        })
                        .ToList(),

                    // ===== new like fields =====
                    LikesCount = t.TrackLikes.Count(),
                    IsLikedByCurrentUser = t.TrackLikes.Any(l => l.UserId == actorId)
                })
                .ToListAsync();
        }



        public async Task<IEnumerable<TrackDto>> GetAllTracksAsync()
        {
            var (actorId, _) = GetActor(); // id of the current user

            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.TrackLikes) // load likes
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    CreatedAt = t.CreatedAt,
                    GenreId = t.GenreId.HasValue ? (int)t.GenreId.Value : 0,
                    Genre = t.Genre != null ? t.Genre.Name : null,

                    Albums = t.AlbumTracks.Select(at => new AlbumDto
                    {
                        Id = at.Album.Id,
                        Title = at.Album.Title,
                        OwnerId = at.Album.OwnerId,
                        OwnerName = at.Album.Owner.Username,
                        CoverUrl = at.Album.CoverUrl,
                        CreatedAt = at.Album.CreatedAt,
                        IsPublic = at.Album.IsPublic
                    }).ToList(),

                    LikesCount = t.TrackLikes.Count(),
                    IsLikedByCurrentUser = t.TrackLikes.Any(l => l.UserId == actorId)
                })
                .ToListAsync();
        }

        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            return await GetByIdInternalAsync(id, includeUserLikes: true);
        }

        public async Task<TrackDto> GetByIdInternalAsync(int id, bool includeUserLikes)
        {
            var (actorId, _) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner) // without this OwnerName threw a NullReference (500 on like/unlike)
                .Include(t => t.TrackLikes)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
                throw new Exception("Track not found");

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = track.Author.Username,
                Duration = track.Duration,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = track.PlayCount,
                CreatedAt = track.CreatedAt,
                GenreId = track.GenreId ?? 0,
                Genre = track.Genre?.Name,
                Albums = track.AlbumTracks.Select(at => new AlbumDto
                {
                    Id = at.Album.Id,
                    Title = at.Album.Title,
                    OwnerId = at.Album.OwnerId,
                    OwnerName = at.Album.Owner.Username,
                    CoverUrl = at.Album.CoverUrl,
                    CreatedAt = at.Album.CreatedAt,
                    IsPublic = at.Album.IsPublic
                }).ToList(),
                LikesCount = track.TrackLikes.Count,
                IsLikedByCurrentUser = includeUserLikes && track.TrackLikes.Any(l => l.UserId == actorId)
            };
        }



        public async Task<TrackDto> CreateAsync(CreateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();

            //// Check that the album and its owner exist
            //var album = await _db.Albums.Include(a => a.Owner)
            //    .FirstOrDefaultAsync(a => a.Id == dto.AlbumId)
            //    ?? throw new KeyNotFoundException($"Album {dto.AlbumId} not found");

            //if (actorRole != UserRole.Admin && album.OwnerId != actorId)
            //    throw new UnauthorizedAccessException("You are not owner of this album");

            // Check the author user
            var author = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"Author {actorId} not found");
            TrackEntity tr = new TrackEntity();
            TimeSpan duration;
            using (var tagFile = TagLib.File.Create(tr.Url))
            {
                duration = tagFile.Properties.Duration;
            }
            // Create the track
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                AuthorId = actorId,
                Duration = duration,
                GenreId = dto.GenreId,
                IsHidden = false,
                ImageUrl = null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync();

            // Add the track → album relation
            _db.AlbumTracks.Add(new AlbumTrackEntity
            {
                //commented out for now (error 'CreateTrackDto' does not contain a definition for 'AlbumId' and no accessible
                //extension method 'AlbumId' accepting a first argument
                //of type 'CreateTrackDto' could be found (are you missing a using directive or an assembly reference?))

                //AlbumId = dto.AlbumId,
                TrackId = track.Id
            });
            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = author.Username,
                Duration = track.Duration,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = 0,
                GenreId = (int)track.GenreId,
                Genre = track.Genre != null ? track.Genre.Name : null,
                // Albums the track belongs to
                Albums = new List<AlbumDto>
        {
                    //commented out for now (error 'CreateTrackDto' does not contain a definition for 'AlbumId' and no accessible
                    //extension method 'AlbumId' accepting a first argument
                    //of type 'CreateTrackDto' could be found (are you missing a using directive or an assembly reference?))
            //new AlbumDto
            //{
            //    Id = album.Id,
            //    Title = album.Title,
            //    Description = album.Description,
            //    OwnerId = album.OwnerId,
            //    OwnerName = album.Owner.Username,
            //    CoverUrl = album.CoverUrl,
            //    CreatedAt = album.CreatedAt
            //}
        }
            };
        }


        public async Task<TrackDto> CreateAsyncFile(CreateTrackDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                throw new ArgumentException("No file provided");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            var (actorId, actorRole) = GetActor();

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var url = $"/uploads/tracks/{fileName}";

            TimeSpan duration;
            using (var tagFile = TagLib.File.Create(filePath))
            {
                duration = tagFile.Properties.Duration;
            }



            // ===== Cover handling =====
            string? imageUrl = null;
            if (dto.Cover != null && dto.Cover.Length > 0)
            {
                var coverFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks", "cover");
                if (!Directory.Exists(coverFolder))
                    Directory.CreateDirectory(coverFolder);

                var coverFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Cover.FileName);
                var coverFilePath = Path.Combine(coverFolder, coverFileName);

                using (var coverStream = new FileStream(coverFilePath, FileMode.Create))
                {
                    await dto.Cover.CopyToAsync(coverStream);
                }

                imageUrl = $"/uploads/tracks/cover/{coverFileName}";
            }

            // ===== Creating a track =====
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                Url = url,
                Duration = duration,
                AuthorId = actorId,
                GenreId = dto.GenreId,
                IsHidden = false,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync(); // save the track to get Id

            // ===== Album binding (many-to-many) =====
            List<AlbumEntity> albums = new List<AlbumEntity>();
            if (dto.AlbumIds != null && dto.AlbumIds.Any())
            {
                albums = await _db.Albums
                    .Include(a => a.Owner)
                    .Where(a => dto.AlbumIds.Contains(a.Id))
                    .ToListAsync();

                foreach (var album in albums)
                {
                    _db.AlbumTracks.Add(new AlbumTrackEntity
                    {
                        TrackId = track.Id,
                        AlbumId = album.Id
                    });
                }

                await _db.SaveChangesAsync();
            }

            // ===== Get the genre name =====
            string? genreName = null;
            if (track.GenreId.HasValue)
            {
                var genre = await _db.Genres.FindAsync(track.GenreId.Value);
                genreName = genre?.Name;
            }

            // ===== Map albums to AlbumDto =====
            var albumDtos = albums.Select(a => new AlbumDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                OwnerId = a.OwnerId,
                OwnerName = a.Owner.Username,
                CoverUrl = a.CoverUrl,
                IsPublic = a.IsPublic
            }).ToList();

            // ===== Return TrackDto =====
            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                Url = track.Url,
                Duration = track.Duration,
                AuthorId = track.AuthorId,
                Author = (await _db.Users.FindAsync(track.AuthorId))!.Username,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                GenreId = (int)track.GenreId,
                Genre = genreName,
                Albums = albumDtos
            };
        }



        public async Task<TrackDto> UpdateAsyncFile(int trackId, UpdateTrackDto dto)
        {
            // Find the track
            var track = await _db.Tracks.FindAsync(trackId);
            if (track == null) throw new ArgumentException("Track not found");

            var (actorId, actorRole) = GetActor();
            if (track.AuthorId != actorId) throw new UnauthorizedAccessException("You are not the author");

            // ===== File update =====
            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                track.Url = $"/uploads/tracks/{fileName}";

                // Update the duration
                using (var tagFile = TagLib.File.Create(filePath))
                {
                    track.Duration = tagFile.Properties.Duration;
                }
            }

            // ===== Cover update =====
            if (dto.Cover != null && dto.Cover.Length > 0)
            {
                var coverFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks", "cover");
                if (!Directory.Exists(coverFolder))
                    Directory.CreateDirectory(coverFolder);

                var coverFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Cover.FileName);
                var coverFilePath = Path.Combine(coverFolder, coverFileName);

                using (var coverStream = new FileStream(coverFilePath, FileMode.Create))
                {
                    await dto.Cover.CopyToAsync(coverStream);
                }

                track.ImageUrl = $"/uploads/tracks/cover/{coverFileName}";
            }

                track.Title = dto.Title;

            if (dto.GenreId.HasValue)
                track.GenreId = dto.GenreId.Value;

            // ===== Albums update (many-to-many) =====
            if (dto.AlbumIds != null)
            {
                // Remove old relations
                var existingLinks = _db.AlbumTracks.Where(at => at.TrackId == track.Id);
                _db.AlbumTracks.RemoveRange(existingLinks);

                // Add new ones
                var albums = await _db.Albums.Where(a => dto.AlbumIds.Contains(a.Id)).ToListAsync();
                foreach (var album in albums)
                {
                    _db.AlbumTracks.Add(new AlbumTrackEntity
                    {
                        TrackId = track.Id,
                        AlbumId = album.Id
                    });
                }
            }

            await _db.SaveChangesAsync();

            // ===== Prepare the response DTO =====
            var albumDtos = (await _db.Albums
                .Include(a => a.Owner)
                .Where(a => _db.AlbumTracks.Any(at => at.TrackId == track.Id && at.AlbumId == a.Id))
                .ToListAsync())
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.Username,
                    CoverUrl = a.CoverUrl,
                    IsPublic = a.IsPublic
                }).ToList();

            string? genreName = null;
            if (track.GenreId.HasValue)
            {
                var genre = await _db.Genres.FindAsync(track.GenreId.Value);
                genreName = genre?.Name;
            }

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                Url = track.Url,
                Duration = track.Duration,
                AuthorId = actorId,
                Author = (await _db.Users.FindAsync(actorId))!.Username,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                GenreId = track.GenreId,
                Genre = genreName,
                Albums = albumDtos
            };
        }

        public async Task DeleteAsync(int id)
        {
            var (actorId, actorRole) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            _db.Tracks.Remove(track);
            await _db.SaveChangesAsync();
        }

        public async Task HideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var track = await _db.Tracks.FindAsync(id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            track.IsHidden = true;
            await _db.SaveChangesAsync();
        }

        public async Task UnhideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var track = await _db.Tracks.FindAsync(id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            track.IsHidden = false;
            await _db.SaveChangesAsync();
        }

        public async Task SetImageAsync(int trackId, string imageUrl)
        {
            var (actorId, actorRole) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                .FirstOrDefaultAsync(t => t.Id == trackId)
                ?? throw new KeyNotFoundException($"Track {trackId} not found");

            // Permission check: the user is an Admin or owns at least one album
            if (actorRole != UserRole.Admin && !track.AlbumTracks.Any(at => at.Album.OwnerId == actorId))
                throw new UnauthorizedAccessException("You are not allowed to set image for this track.");

            track.ImageUrl = imageUrl;
            await _db.SaveChangesAsync();
        }


        public async Task LikeAsync(int trackId)
        {
            var (userId, _) = GetActor(); // take the current user from the token

            var track = await _db.Tracks
                .Include(t => t.TrackLikes)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new KeyNotFoundException("Track not found");

            // If the user hasn't liked this track yet
            if (!track.TrackLikes.Any(l => l.UserId == userId))
            {
                track.TrackLikes.Add(new TrackLikeEntity
                {
                    TrackId = trackId,
                    UserId = userId
                });

                await _db.SaveChangesAsync();
            }
        }

        public async Task UnlikeAsync(int trackId)
        {
            var (userId, _) = GetActor(); // take the current user

            var like = await _db.TrackLikes
                .FirstOrDefaultAsync(l => l.TrackId == trackId && l.UserId == userId);

            if (like != null)
            {
                _db.TrackLikes.Remove(like);
                await _db.SaveChangesAsync();
            }
            // If there is no like, do nothing
        }

        //Get the liked tracks of the current user
        public async Task<List<TrackDto>> GetLikedByUserAsync(int userId)
        {
            var likedTracks = await _db.TrackLikes
                .Where(tl => tl.UserId == userId)
                .Select(tl => tl.Track)
                .Select(track => new TrackDto
                {
                    Id = track.Id,
                    Title = track.Title,
                    AuthorId = track.AuthorId,
                    Author = track.Author.Username, // or Name, depending on your User
                    GenreId = track.GenreId ?? 0,
                    Genre = track.Genre != null ? track.Genre.Name : "",
                    Duration = track.Duration,
                    Url = track.Url,
                    ImageUrl = track.ImageUrl,
                    PlayCount = track.PlayCount,
                    CreatedAt = track.CreatedAt,
                    LikesCount = track.TrackLikes.Count,
                    IsLikedByCurrentUser = true // because these are the current user's liked tracks
                })
                .ToListAsync();

            return likedTracks;
        }



        public async Task<TrackStatsDto> GetTrackStatsAsync(int trackId)
        {
            // Load the track together with its author
            var track = await _db.Tracks
                .Include(t => t.Author) // navigation property
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new KeyNotFoundException($"Track {trackId} not found");

            return new TrackStatsDto
            {
                TrackId = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                AuthorName = track.Author?.Username,
                AuthorAvatarUrl = track.Author?.AvatarUrl,
                PlayCount = track.PlayCount
            };
        }

        public async Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId)
        {
            var author = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == authorId);

            if (author == null) throw new KeyNotFoundException($"Author {authorId} not found");

            var totalPlays = await _db.Tracks
                .Where(t => t.AuthorId == authorId)
                .SumAsync(t => t.PlayCount);

            return new AuthorStatsDto
            {
                UserId = author.Id,
                Username = author.Username,
                AvatarUrl = author.AvatarUrl,
                TotalPlays = totalPlays
            };
        }
    }
}
