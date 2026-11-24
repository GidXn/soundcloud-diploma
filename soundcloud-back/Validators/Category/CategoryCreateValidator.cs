using FluentValidation;
using soundcloud_back.Models.Category;

namespace soundcloud_back.Validators.Category;

public class CategoryCreateValidator : AbstractValidator<CategoryCreateModel>
{
    public CategoryCreateValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(100)
            .WithMessage("Name must not exceed 100 characters.");
        RuleFor(x => x.Slug)
            .NotEmpty()
            .WithMessage("Slug is required.")
            .MinimumLength(3)
            .WithMessage("Slug must be at least 3 characters.")
            .MaximumLength(100)
            .WithMessage("Slug must not exceed 100 characters.");
        RuleFor(x => x.ImageFile)
            .NotEmpty()
            .WithMessage("Photo is required.")
            .Must(BeAValidImage)
            .WithMessage("The image file must be a valid image.");
    }
    private bool BeAValidImage(IFormFile? file)
    {
        if (file == null) return true; // Allow null files
        var validImageTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        return validImageTypes.Contains(file.ContentType);
    }
}
