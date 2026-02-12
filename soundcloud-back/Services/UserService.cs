using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data;
using soundcloud_back.Data.Entities;
using Google.Apis.Auth;
using soundcloud_back.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace soundcloud_back.Services;

public class UserService : IUserService
{
    private readonly SoundCloudDbContext _db;

    public UserService(SoundCloudDbContext db)
    {
        _db = db;
    }

    public async Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload p)
    {
        if (p == null) throw new ArgumentNullException(nameof(p));
        var email = (p.Email ?? "").Trim().ToLower();
        var subject = p.Subject ?? "";
        var picture = p.Picture;

        var u = await _db.Users.FirstOrDefaultAsync(x => x.GoogleSubject == subject);
        if (u != null)
        {
            if (u.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
            bool dirty = false;
            if (!string.IsNullOrEmpty(picture) && u.AvatarUrl != picture)
            {
                u.AvatarUrl = picture;
                dirty = true;
            }

            if (u.IsLocalPasswordSet == false && u.AuthProvider != AuthProvider.Google)
            {
                u.AuthProvider = AuthProvider.Google;
                dirty = true;
            }

            if (dirty)
            {
                u.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            return u;
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user != null)
        {
            if (user.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
            if (string.IsNullOrEmpty(user.GoogleSubject))
            {
                user.GoogleSubject = p.Subject;
                if (!string.IsNullOrEmpty(picture) && user.AvatarUrl != picture)
                    user.AvatarUrl = picture;

                if (user.IsLocalPasswordSet == false)
                {
                    user.AuthProvider = AuthProvider.Google;
                }

                user.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            return user;
        }

        user = new UserEntity
        {
            Username = await MakeUniqueUsernameAsync(email.Split('@')[0]),
            Email = email,
            AuthProvider = AuthProvider.Google,
            GoogleSubject = subject,
            IsLocalPasswordSet = false,
            PasswordHash = Array.Empty<byte>(),
            PasswordSalt = Array.Empty<byte>(),
            Role = UserRole.User,
            AvatarUrl = picture,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<UserEntity> FindOrCreateFromFacebookAsync(string facebookId, string email, string name, string? pictureUrl)
    {
        if (string.IsNullOrWhiteSpace(facebookId))
            throw new ArgumentException("Facebook ID is required", nameof(facebookId));

        var emailNorm = (email ?? "").Trim().ToLower();

        var u = await _db.Users.FirstOrDefaultAsync(x => x.FacebookSubject == facebookId);
        if (u != null)
        {
            if (u.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
            bool dirty = false;
            if (!string.IsNullOrEmpty(pictureUrl) && u.AvatarUrl != pictureUrl)
            {
                u.AvatarUrl = pictureUrl;
                dirty = true;
            }

            if (u.IsLocalPasswordSet == false && u.AuthProvider != AuthProvider.Facebook)
            {
                u.AuthProvider = AuthProvider.Facebook;
                dirty = true;
            }

            if (dirty)
            {
                u.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            return u;
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);
        if (user != null)
        {
            if (user.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
            if (string.IsNullOrEmpty(user.FacebookSubject))
            {
                user.FacebookSubject = facebookId;
                if (!string.IsNullOrEmpty(pictureUrl) && user.AvatarUrl != pictureUrl)
                    user.AvatarUrl = pictureUrl;

                if (user.IsLocalPasswordSet == false)
                {
                    user.AuthProvider = AuthProvider.Facebook;
                }

                user.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            return user;
        }

        user = new UserEntity
        {
            Username = await MakeUniqueUsernameAsync(name.Split(' ')[0] ?? emailNorm.Split('@')[0]),
            Email = emailNorm,
            AuthProvider = AuthProvider.Facebook,
            FacebookSubject = facebookId,
            IsLocalPasswordSet = false,
            PasswordHash = Array.Empty<byte>(),
            PasswordSalt = Array.Empty<byte>(),
            Role = UserRole.User,
            AvatarUrl = pictureUrl,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    private async Task<string> MakeUniqueUsernameAsync(string baseName)
    {
        var candidate = baseName;
        var i = 0;
        while (await _db.Users.AnyAsync(u => u.Username == candidate))
            candidate = $"{baseName}{++i}";
        return candidate;
    }
}
