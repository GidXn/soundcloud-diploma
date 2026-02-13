using FluentValidation;
using soundcloud_back.Models.Track;

namespace soundcloud_back.Validators.Track
{
    public class UpdateTrackValidator : AbstractValidator<UpdateTrackDto>
    {
        public UpdateTrackValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().MaximumLength(200)
                .WithMessage("Title має бути валідним");


        }
    }
}
