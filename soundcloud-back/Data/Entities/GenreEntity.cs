using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Principal;

namespace soundcloud_back.Data.Entities;

public class GenreEntity 
{
    [Key]
    public int Id { get; set; } // Matches genre_id in the database

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } // Genre name
    public int PlayCount { get; set; } = 0;

}