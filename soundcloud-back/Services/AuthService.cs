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

using soundcloud_back.Services.Abstractions;

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

            ///// Перевірка, чи користувач з таким email вже існує, більш точна перевірка

            ////if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            ////{
            ////    throw new InvalidOperationException("Користувач з таким email вже існує.");
            ////}
            //if (await _db.Users.AnyAsync(u => u.Email.ToLower() == emailNorm))
            //    throw new InvalidOperationException("Користувач з таким email вже існує.");
            // 1) спершу шукаємо, чи існує користувач з таким email
            
            var existing = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);

            if (existing != null)
            {
                // якщо це Google-акаунт без локального пароля — підказка
                if (existing.AuthProvider == AuthProvider.Google && existing.IsLocalPasswordSet == false)
                    throw new InvalidOperationException(
                        "Цей email вже прив’язано до Google-акаунта. Увійдіть через Google і у профілі встановіть локальний пароль.");

                // інакше — стандартне повідомлення
                throw new InvalidOperationException("Користувач з таким email вже існує.");
            }

            // 2) перевірка username як і було
            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == usernameNorm.ToLower()))
                throw new InvalidOperationException("Користувач з таким ім'ям вже існує.");

            // Хешування пароля
            CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new UserEntity
            {
                //Username = dto.Username,
                //Email = dto.Email,
                Username = usernameNorm,
                Email = emailNorm,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow,
                //new
                AuthProvider = AuthProvider.Local,
                IsLocalPasswordSet = true,
                GoogleSubject = null
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Генерація JWT-токена
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

            //var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);
            //if (user == null || !VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
            //{
            //    throw new UnauthorizedAccessException("Неправильний email або пароль.");
            //}

            //if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
            //    throw new UnauthorizedAccessException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            if (user == null)
                throw new UnauthorizedAccessException("Неправильний email або пароль.");

            if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
                throw new UnauthorizedAccessException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            // Додатковий захист від “старих”/неконсистентних даних (порожній хеш/сіль)
            if (user.PasswordHash == null || user.PasswordSalt == null ||
                user.PasswordHash.Length == 0 || user.PasswordSalt.Length == 0)
                throw new UnauthorizedAccessException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            // Перевірка пароля
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
                   u.AuthProvider,//new
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
                AvatarUrl=user.AvatarUrl,
                CreatedAt = user.CreatedAt,
                Bio = user.Bio,
                BannerUrl=user.BannerUrl,
                Role = user.Role,
                UpdatedAt   = user.UpdatedAt,
                    // new:
                AuthProvider = user.Role != null ? user.AuthProvider.ToString() : "Local",
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
            user.IsLocalPasswordSet = true;// тепер локальний логін дозволено / критично
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        private string GeneratePasswordResetToken(UserEntity user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("token_type", "password_reset")
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

        public async Task<string> GeneratePasswordResetTokenAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email обов'язковий.", nameof(email));

            var emailNorm = email.Trim().ToLower();

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm)
                ?? throw new InvalidOperationException("Користувача з таким email не знайдено.");

            if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
                throw new InvalidOperationException("Акаунт створено через Google. Увійдіть через Google або спершу встановіть локальний пароль.");

            if (user.IsBlocked)
                throw new InvalidOperationException("Користувач заблокований.");

            return GeneratePasswordResetToken(user);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Token обов'язковий.", nameof(token));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            try
            {
                var principal = tokenHandler.ValidateToken(
                    token,
                    new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = key,
                        ValidateIssuer = true,
                        ValidIssuer = _config["Jwt:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = _config["Jwt:Audience"],
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    },
                    out var validatedToken);

                if (validatedToken is not JwtSecurityToken jwt ||
                    !jwt.Claims.Any(c => c.Type == "token_type" && c.Value == "password_reset"))
                {
                    throw new SecurityTokenException("Невалідний тип токена.");
                }

                var userIdStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out var userId))
                    throw new SecurityTokenException("Невалідний токен.");

                var user = await _db.Users.FindAsync(userId)
                    ?? throw new KeyNotFoundException("Користувача не знайдено.");

                if (user.IsBlocked)
                    throw new UnauthorizedAccessException("Користувач заблокований.");

                CreatePasswordHash(newPassword, out var passwordHash, out var passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
                user.IsLocalPasswordSet = true;
                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();
            }
            catch (SecurityTokenException)
            {
                throw new UnauthorizedAccessException("Токен для скидання паролю недійсний або прострочений.");
            }
        }
    }
}
