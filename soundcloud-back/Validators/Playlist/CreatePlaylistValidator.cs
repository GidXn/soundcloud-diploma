using FluentValidation;
using soundcloud_back.Models.Playlist;

namespace soundcloud_back.Validators.Playlist
{
    public class CreatePlaylistValidator : AbstractValidator<CreatePlaylistDto>
    {
        public CreatePlaylistValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Назва плейлиста обов'язкова")
                .MaximumLength(200);
        }
    }
}
