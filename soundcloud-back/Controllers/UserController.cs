using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace soundcloud_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;

        public UserController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [SwaggerOperation(
            OperationId = "Register",
            Summary = "Створити користувача")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
        {
            var response = await _authService.RegisterAsync(model);
            return Ok(response);
        }

        [SwaggerOperation(
            OperationId = "Login",
            Summary = "Вхід користувача")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            var response = await _authService.LoginAsync(model);
            return Ok(response);
        }

        [Authorize]
        [SwaggerOperation(
            OperationId = "Profile",
            Summary = "Отримати дані поточного користувача [Authorize]")]
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
    }
}
