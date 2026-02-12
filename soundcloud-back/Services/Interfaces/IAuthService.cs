using soundcloud_back.Models.Auth;
using System.Threading.Tasks;
using soundcloud_back.Data.Entities;

namespace soundcloud_back.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        string IssueJwtForUser(UserEntity user);
        Task SetLocalPasswordAsync(int userId, string newPassword);
    }
}
