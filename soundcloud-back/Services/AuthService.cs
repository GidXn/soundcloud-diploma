using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using soundcloud_back.Data;
using soundcloud_back.Data.Entities;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Interfaces;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace soundcloud_back.Services
{
    public class AuthService : IAuthService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(SoundCloudDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public string IssueJwtForUser(UserEntity user)
        {
            return GenerateJwtToken(user);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            var emailNorm = dto.Email.Trim().ToLower();
            var usernameNorm = dto.Username.Trim();

            var existing = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);

            if (existing != null)
            {
                if (existing.AuthProvider == AuthProvider.Google && existing.IsLocalPasswordSet == false)
                    throw new InvalidOperationException(
                        "Цей email вже прив'язано до Google-акаунта. Увійдіть через Google і у профілі встановіть локальний пароль.");

                throw new InvalidOperationException("Користувач з таким email вже існує.");
            }

            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == usernameNorm.ToLower()))
                throw new InvalidOperationException("Користувач з таким ім'ям вже існує.");

            CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new UserEntity
            {
                Username = usernameNorm,
                Email = emailNorm,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow,
                AuthProvider = AuthProvider.Local,
                IsLocalPasswordSet = true,
                GoogleSubject = null
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Username = user.Username
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var emailNorm = dto.Email.Trim().ToLower();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);

            if (user == null)
                throw new UnauthorizedAccessException("Неправильний email або пароль.");

            if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
                throw new UnauthorizedAccessException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            if (user.PasswordHash == null || user.PasswordSalt == null ||
                user.PasswordHash.Length == 0 || user.PasswordSalt.Length == 0)
                throw new UnauthorizedAccessException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
                throw new UnauthorizedAccessException("Неправильний email або пароль.");

            if (user.IsBlocked)
            {
                throw new UnauthorizedAccessException("Користувач заблокований.");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Username = user.Username
            };
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(storedHash);
        }

        private string GenerateJwtToken(UserEntity user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            var user = await _db.Users
                .Where(u => u.Id.ToString() == userId)
                .Select(u => new
                {
                   u.Id,
                   u.Username,
                   u.Email,
                   u.AvatarUrl,
                   u.CreatedAt,
                   u.Bio,
                   u.Role,
                   u.BannerUrl,
                   u.IsBlocked,
                   u.UpdatedAt,
                   u.AuthProvider,
                   u.IsLocalPasswordSet
                })
                .FirstOrDefaultAsync(); 

            if (user == null)
                throw new KeyNotFoundException("Користувач не знайдений.");

            if (user.IsBlocked)
                throw new UnauthorizedAccessException("Користувач заблокований.");

            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                AvatarUrl = user.AvatarUrl,
                CreatedAt = user.CreatedAt,
                Bio = user.Bio,
                BannerUrl = user.BannerUrl,
                Role = user.Role,
                UpdatedAt = user.UpdatedAt,
                AuthProvider = user.AuthProvider.ToString(),
                IsLocalPasswordSet = user.IsLocalPasswordSet
            };
        }

        public async Task SetLocalPasswordAsync(int userId, string newPassword)
        {
            var user = await _db.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("Користувача не знайдено.");

            CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            user.IsLocalPasswordSet = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
