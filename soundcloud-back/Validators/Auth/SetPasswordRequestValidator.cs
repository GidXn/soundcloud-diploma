using FluentValidation;
using soundcloud_back.Models.Auth;

namespace soundcloud_back.Validators.Auth
{
    public class SetPasswordRequestValidator : AbstractValidator<SetPasswordRequest>
    {
        public SetPasswordRequestValidator()
        {
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(6).WithMessage("Password має містити хоча б 6 символів");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword обов'язковий")
                .Equal(x => x.NewPassword).WithMessage("ConfirmPassword має збігатися з Password");
        }
    }
}
