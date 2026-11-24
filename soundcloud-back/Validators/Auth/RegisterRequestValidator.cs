using FluentValidation;
using soundcloud_back.Models.Auth;
using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data;

namespace soundcloud_back.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        private readonly SoundCloudDbContext _db; // field for DB access
        public RegisterRequestValidator(SoundCloudDbContext db)
        {
            _db = db;

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required")
                //.MinimumLength(3).WithMessage("Username must contain at least 3 characters");
                .Length(3, 30).WithMessage("Name length is 3–30 characters")
                .Matches(@"^[A-Za-z0-9_.-]+$").WithMessage("Only Latin letters, digits, _, . , -")
                .MustAsync(UniqueUsername).WithMessage("A user with this name already exists");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid format Email")
                .MustAsync(UniqueEmail).WithMessage("A user with this email already exists");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must contain at least 6 characters");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword is required")
                .Equal(x => x.Password).WithMessage("ConfirmPassword must match Password");
        }

        // Uniqueness checks (custom methods)
        private async Task<bool> UniqueUsername(string username, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(username)) return false;
            return !await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.Username.ToLower() == username.ToLower(), ct);
        }

        private async Task<bool> UniqueEmail(string email, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            return !await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.Email.ToLower() == email.ToLower(), ct);
        }
    }
}

