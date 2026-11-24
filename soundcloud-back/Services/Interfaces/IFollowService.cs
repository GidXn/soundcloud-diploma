using soundcloud_back.Data.Entities;
using soundcloud_back.Models.Auth;

namespace soundcloud_back.Services.Interfaces
{
    public interface IFollowService
    {
        Task<bool> FollowAsync(int followerId, int followingId);
        Task<bool> UnfollowAsync(int followerId, int followingId);
        Task<List<UserEntity>> GetFollowersAsync(int userId);
        Task<List<UserEntity>> GetFollowingAsync(int userId);
        Task<int> GetFollowersCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);

        // new
        Task<bool> IsFollowingAsync(int followerId, int followingId);
        // New method for the controller
        Task<UserFollowDto?> GetUserFollowStatusAsync(int currentUserId, int targetUserId);
    }
}
