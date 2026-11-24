using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services;
using soundcloud_back.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
//using soundcloud_back.SMTP

namespace soundcloud_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public UserController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
        {
            try
            {
                var response = await _authService.RegisterAsync(model);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                // Email/name is already taken: 409 with a message (the frontend shows it to the user)
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            try
            {
                var response = await _authService.LoginAsync(model);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                // Invalid email/password: 401 instead of 500 (the frontend shows a readable message)
                return Unauthorized(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("User ID not found in token.");
            }
            var profile = await _authService.GetUserProfileAsync(userId);
            return Ok(profile);
        }

        [HttpPut("{id}/banner")]
        [SwaggerOperation(Summary = "Update own banner")]
        public async Task<IActionResult> UpdateBanner(int id, [FromForm] UpdateUserBannerDto dto)
        {
            var bannerUrl = await _userService.UpdateBannerAsync(id, dto.Banner);
            return Ok(new { BannerUrl = bannerUrl });
        }

        [Authorize]
        [HttpPut("profile")]
        [SwaggerOperation(
    OperationId = "UpdateOwnProfile",
    Summary = "Update own profile [Authorize]")]
        public async Task<IActionResult> UpdateOwnProfile([FromForm] UpdateUserRequestDto dto)
        {
            // Get userId from the token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim);
            var updated = await _userService.UpdateAsync(userId, dto);
            return Ok(updated);
        }

        /// <summary>
        /// Top authors by the total plays of their tracks (for Feed → Top creators).
        /// </summary>
        [HttpGet("top")]
        public async Task<IActionResult> GetTop([FromQuery] int take = 4)
        {
            var top = await _userService.GetTopUsersAsync(Math.Clamp(take, 1, 50));
            return Ok(top);
        }

        /// <summary>
        /// Public user profile (without email and internal fields).
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPublicProfile(int id)
        {
            try
            {
                var u = await _userService.GetByIdAsync(id);
                return Ok(new
                {
                    Id = id,
                    u.Username,
                    u.AvatarUrl,
                    u.BannerUrl,
                    u.Bio,
                    u.CreatedAt,
                    u.Role,
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto model)
        {
            await _authService.GeneratePasswordResetTokenAsync(model.Email);
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto model)
        {
            await _authService.ResetPasswordAsync(model.Token, model.NewPassword);
            return Ok();
        }
    }
}