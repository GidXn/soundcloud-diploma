using FluentValidation;
using soundcloud_back.Models.Auth;

namespace soundcloud_back.Validators.Auth
{
    public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequestDto>
    {
        public ResetPasswordRequestValidator()
        {
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(6).WithMessage("Password має містити хоча б 6 символів");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword обов'язковий")
                .Equal(x => x.NewPassword).WithMessage("ConfirmPassword має збігатися з Password");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Token обов'язковий");
        }
    }
}

