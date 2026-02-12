using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Models.Genre
{
    public class GenreCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
    }
}
