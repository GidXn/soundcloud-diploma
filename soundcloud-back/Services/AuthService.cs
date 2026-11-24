using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using soundcloud_back.Data;
using soundcloud_back.Data.Entities;
using soundcloud_back.Interfaces;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Abstractions;
using soundcloud_back.Services.Interfaces;

namespace soundcloud_back.Services
{
    public class AuthService : IAuthService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender;
        private readonly ISmtpService _smtpService;

        public AuthService(SoundCloudDbContext db, IConfiguration config, IEmailSender emailSender,
            ISmtpService smtpService)
        {
            _db = db;
            _config = config;
            _emailSender = emailSender;
            _smtpService = smtpService;
        }

        public string IssueJwtForUser(UserEntity user)
        {
            return GenerateJwtToken(user);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            var emailNorm = dto.Email.Trim().ToLower();
            var usernameNorm = dto.Username.Trim();

            ///// Check whether a user with this email already exists, more precise check

            ////if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            ////{
            ////    throw new InvalidOperationException("A user with this email already exists.");
            ////}
            //if (await _db.Users.AnyAsync(u => u.Email.ToLower() == emailNorm))
            //    throw new InvalidOperationException("A user with this email already exists.");
            // 1) first check whether a user with this email
            
            var existing = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm);

            if (existing != null)
            {
                // if this is a Google account without a local password, give a hint
                if (existing.AuthProvider == AuthProvider.Google && existing.IsLocalPasswordSet == false)
                    throw new InvalidOperationException(
                        "This email is already linked to a Google account. Sign in with Google and set a local password in your profile.");

                // otherwise, the standard message
                throw new InvalidOperationException("A user with this email already exists.");
            }

            // 2) username check as before
            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == usernameNorm.ToLower()))
                throw new InvalidOperationException("A user with this name already exists.");

            // Password hashing
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

            // JWT token generation
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
            //    throw new UnauthorizedAccessException("Invalid email or password.");
            //}

            //if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
            //    throw new UnauthorizedAccessException("The account was created via Google. Sign in with Google or set a local password first.");

            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password.");

            if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
                throw new UnauthorizedAccessException("The account was created via Google. Sign in with Google or set a local password first.");

            // Extra protection against “old”/inconsistent data (empty hash/salt)
            if (user.PasswordHash == null || user.PasswordSalt == null ||
                user.PasswordHash.Length == 0 || user.PasswordSalt.Length == 0)
                throw new UnauthorizedAccessException("The account was created via Google. Sign in with Google or set a local password first.");

            // Password check
            if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
                throw new UnauthorizedAccessException("Invalid email or password.");

            if (user.IsBlocked)
            {
                throw new UnauthorizedAccessException("User is blocked.");
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
                throw new KeyNotFoundException("User not found.");

            if (user.IsBlocked)
                throw new UnauthorizedAccessException("User is blocked.");

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
                ?? throw new KeyNotFoundException("User not found.");

            CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            user.IsLocalPasswordSet = true;// local login is now allowed / critical
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
                throw new ArgumentException("Email is required.", nameof(email));

            var emailNorm = email.Trim().ToLower();

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm)
                ?? throw new InvalidOperationException("No user with this email was found.");

            if (user.AuthProvider == AuthProvider.Google && user.IsLocalPasswordSet == false)
                throw new InvalidOperationException("The account was created via Google. Sign in with Google or set a local password first.");

            if (user.IsBlocked)
                throw new InvalidOperationException("User is blocked.");

            var token = GeneratePasswordResetToken(user);

            var frontendBaseUrl = _config["Email:FrontendBaseUrl"] ?? "";
            var resetLink = string.IsNullOrWhiteSpace(frontendBaseUrl)
                ? token
                : $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";

            var subject = "Password reset";
            var body = $@"<p>You requested a password reset.</p>
<p>To set a new password, follow the link:</p>
<p><a href=""{resetLink}"">Reset password</a></p>
<p>If you didn't make this request, just ignore this email.</p>";

            //await _emailSender.SendEmailAsync(user.Email, subject, body);
            await _smtpService.SendEmailAsync(new EmailMessage
            {
                To = user.Email,
                Subject = subject,
                Body = body
            });

            return token;
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new ArgumentException("Token is required.", nameof(token));

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
                    throw new SecurityTokenException("Invalid token type.");
                }

                var userIdStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out var userId))
                    throw new SecurityTokenException("Invalid token.");

                var user = await _db.Users.FindAsync(userId)
                    ?? throw new KeyNotFoundException("User not found.");

                if (user.IsBlocked)
                    throw new UnauthorizedAccessException("User is blocked.");

                CreatePasswordHash(newPassword, out var passwordHash, out var passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
                user.IsLocalPasswordSet = true;
                user.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();
            }
            catch (SecurityTokenException)
            {
                throw new UnauthorizedAccessException("The password reset token is invalid or expired.");
            }
        }
    }
}
