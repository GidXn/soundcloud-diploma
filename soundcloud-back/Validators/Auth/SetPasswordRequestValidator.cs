using FluentValidation;
using soundcloud_back.Models.Auth;
using SetPasswordDto = soundcloud_back.Models.Auth.SetPasswordRequest;

namespace soundcloud_back.Validators.Auth
{
    public class SetPasswordRequestValidator : AbstractValidator<SetPasswordDto>
    {
        public SetPasswordRequestValidator()
        {
            // VARIANT A: the same policy as in registration (minimum  6)
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must contain at least 6 characters");

            // VARIANT B (recommended): stronger policy (8+, upper/lower case/digit.....)
            /*
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Minimum length is 8 characters")
                .Matches("[A-Z]").WithMessage("Must contain an uppercase letter")
                .Matches("[a-z]").WithMessage("Must contain a lowercase letter")
                .Matches("[0-9]").WithMessage("Must contain a digit");
            */

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword is required")
                .Equal(x => x.NewPassword).WithMessage("ConfirmPassword must match Password");
        }
    }
}
