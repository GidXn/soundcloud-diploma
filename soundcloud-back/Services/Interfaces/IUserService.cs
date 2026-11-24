using soundcloud_back.Data.Entities;
using soundcloud_back.Models.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Apis.Auth;
using soundcloud_back.Models.Track;


namespace soundcloud_back.Services.Interfaces
{
    public interface IUserService
    {
        // Get all users (may include track, album, playlist collections)
        Task<IEnumerable<UserProfileDto>> GetAllAsync();

        // Get a user by ID
        Task<UserProfileDto> GetByIdAsync(int id);

        // Update user data (name, email, avatar)
        Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto);

        //Update the user banner
        Task<string?> UpdateBannerAsync(int userId, IFormFile? bannerFile);


        // Delete a user
        Task DeleteAsync(int id);

        // Block/unblock a user
        Task BlockAsync(int id);
        Task UnblockAsync(int id);

        // Change the user role
        Task ChangeRoleAsync(int userId, UserRole newRole);

        Task SetAvatarAsync(int userId, string url);
        Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload payload);
        Task<IEnumerable<AuthorStatsDto>> GetTopUsersAsync(int take);

    }
}
