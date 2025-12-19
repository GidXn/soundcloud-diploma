using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Data.Entities
{
    public class GenreEntity
    {
        [Key]
        public int Id { get; set; } // Відповідає genre_id в базі даних

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } // Назва жанру
        public int PlayCount { get; set; } = 0;

    }
}
