using soundcloud_back.Data.Entities;
using System.ComponentModel.DataAnnotations;

namespace soundcloud_back.Models.Auth
{
    public class ChangeRoleRequestDto
    {
        [Required]
        [EnumDataType(typeof(UserRole))]
        public UserRole Role { get; set; }
    }

}
