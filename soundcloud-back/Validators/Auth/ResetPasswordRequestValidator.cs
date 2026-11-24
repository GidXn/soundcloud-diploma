using FluentValidation;
using soundcloud_back.Models.Auth;

namespace soundcloud_back.Validators.Auth
{
    public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequestDto>
    {
        public ResetPasswordRequestValidator()
        {
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must contain at least 6 characters");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword is required")
                .Equal(x => x.NewPassword).WithMessage("ConfirmPassword must match Password");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Token is required");
        }
    }
}

