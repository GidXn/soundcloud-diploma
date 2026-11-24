using FluentValidation;
using soundcloud_back.Models.Track;

namespace soundcloud_back.Validators.Track
{
    public class CreateTrackValidator : AbstractValidator<CreateTrackDto>
    {
        public CreateTrackValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().MaximumLength(200);

            //RuleFor(x => x.Url)
            //    .NotEmpty()
            //    .Must(u => Uri.IsWellFormedUriString(u, UriKind.Absolute))
            //    .WithMessage("URL must be valid");
            //
            //RuleFor(x => x.Duration)
            //    .Must(d => d > TimeSpan.Zero)
            //    .WithMessage("Duration must be greater than 0");

            //RuleFor(x => x.AlbumId)
            //    .GreaterThan(0);
        }
    }
}
