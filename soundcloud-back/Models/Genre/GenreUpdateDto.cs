using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Models.Genre
{
    public class GenreUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
    }
}
