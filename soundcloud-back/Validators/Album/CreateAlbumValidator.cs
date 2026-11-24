using FluentValidation;
using soundcloud_back.Models.Album;

namespace soundcloud_back.Validators.Album
{
    public class CreateAlbumValidator : AbstractValidator<CreateAlbumDto>
    {
        public CreateAlbumValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Album title is required")
                .MaximumLength(200);

            // if the Description column in the DB is NOT NULL, use NotEmpty(); otherwise keep only MaximumLength
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Album description is required")
                .MaximumLength(1000);
        }
    }
}
