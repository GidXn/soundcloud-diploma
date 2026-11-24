using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Interfaces;
using System.Security.Claims;

namespace soundcloud_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FollowController : ControllerBase
    {
        private readonly IFollowService _followService;
        private readonly IUserService _userService;

        public FollowController(IFollowService followService, IUserService userService)
        {
            _followService = followService;
            _userService = userService;
        }

        /// <summary>
        /// Follow a user
        /// </summary>
        [HttpPost("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> Follow(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _followService.FollowAsync(userId, id);
            return success ? Ok("Subscribed successfully") : BadRequest("Already following or invalid request");
        }

        /// <summary>
        /// Unfollow a user
        /// </summary>
        [HttpDelete("{id}/unfollow")]
        [Authorize]
        public async Task<IActionResult> Unfollow(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _followService.UnfollowAsync(userId, id);
            return success ? Ok("Unsubscribed successfully") : NotFound("You are not following this user");
        }

        /// <summary>
        /// Get the list of followers for a specific user
        /// </summary>
        [HttpGet("{id}/followers")]
        public async Task<IActionResult> GetFollowers(int id)
        {
            var followers = await _followService.GetFollowersAsync(id);
            return Ok(await ToDtoAsync(followers));
        }

        /// <summary>
        /// Get the list of users a specific user follows (following)
        /// </summary>
        [HttpGet("{id}/following")]
        public async Task<IActionResult> GetFollowing(int id)
        {
            var following = await _followService.GetFollowingAsync(id);
            return Ok(await ToDtoAsync(following));
        }

        /// <summary>
        /// Get the user's follower count
        /// </summary>
        [HttpGet("{id}/followers/count")]
        public async Task<IActionResult> GetFollowersCount(int id)
        {
            var count = await _followService.GetFollowersCountAsync(id);
            return Ok(count);
        }

        /// <summary>
        /// Get the user's following count
        /// </summary>
        [HttpGet("{id}/following/count")]
        public async Task<IActionResult> GetFollowingCount(int id)
        {
            var count = await _followService.GetFollowingCountAsync(id);
            return Ok(count);
        }


        [HttpGet("{id}/status")]
        [Authorize]
        public async Task<ActionResult<UserFollowDto>> GetFollowStatus(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _followService.GetUserFollowStatusAsync(currentUserId, id);
            if (result == null) return NotFound();

            return Ok(result);
        }



        // Return only the user's public fields (previously the whole entity was returned, with email and password hash)
        private async Task<List<FollowUserDto>> ToDtoAsync(List<soundcloud_back.Data.Entities.UserEntity> users)
        {
            var result = new List<FollowUserDto>(users.Count);
            foreach (var u in users)
            {
                result.Add(new FollowUserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    AvatarUrl = u.AvatarUrl,
                    FollowersCount = await _followService.GetFollowersCountAsync(u.Id),
                });
            }
            return result;
        }

    }
}
