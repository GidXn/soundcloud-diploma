using Microsoft.EntityFrameworkCore;
using soundcloud_back.Data;
using soundcloud_back.Data.Entities;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Interfaces;

namespace soundcloud_back.Services.Implementations
{
    public class FollowService : IFollowService
    {
        private readonly SoundCloudDbContext _context;

        public FollowService(SoundCloudDbContext context)
        {
            _context = context;
        }
        //follow someone
        public async Task<bool> FollowAsync(int followerId, int followingId)
        {
            if (followerId == followingId) return false;

            var exists = await _context.Follows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (exists) return false;

            _context.Follows.Add(new FollowEntity
            {
                FollowerId = followerId,
                FollowingId = followingId
            });

            await _context.SaveChangesAsync();
            return true;
        }
        //unfollow someone
        public async Task<bool> UnfollowAsync(int followerId, int followingId)
        {
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (follow == null) return false;

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return true;
        }
        //get the list of my followers
        public async Task<List<UserEntity>> GetFollowersAsync(int userId)
        {
            return await _context.Follows
                .Where(f => f.FollowingId == userId)
                .Select(f => f.Follower)
                .ToListAsync();
        }
        //get the list of users we follow
        public async Task<List<UserEntity>> GetFollowingAsync(int userId)
        {
            return await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.Following)
                .ToListAsync();
        }
        //get the follower count
        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FollowingId == userId);
        }
        //get the following count
        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FollowerId == userId);
        }
        // new
        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _context.Follows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        }

        public async Task<UserFollowDto?> GetUserFollowStatusAsync(int currentUserId, int targetUserId)
        {
            var user = await _context.Users.FindAsync(targetUserId);
            if (user == null) return null;

            var isFollowing = await IsFollowingAsync(currentUserId, targetUserId);

            return new UserFollowDto
            {
                Id = user.Id,
                Username = user.Username,
                IsFollowing = isFollowing
            };
        }


    }

}
