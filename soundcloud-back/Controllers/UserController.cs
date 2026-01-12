using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Models.Auth;
using soundcloud_back.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentValidation;

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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("User ID not found in token.");
            }
            var profile = await _authService.GetUserProfileAsync(userId);
            return Ok(profile);
        }

        [Authorize]
        [HttpPost("password/set")]
        [SwaggerOperation(
            OperationId = "SetOwnPassword",
            Summary = "Встановити пароль користувача")]
        public async Task<IActionResult> SetPassword(
            [FromBody] SetPasswordRequest req,
            [FromServices] IAuthService auth)
        {
            if (req is null)
                return BadRequest(new { error = "Невірний формат запиту" });

            if (string.IsNullOrWhiteSpace(req?.NewPassword) || req.NewPassword.Length < 6)
                return BadRequest(new { error = "Пароль має містити щонайменше 6 символів" });

            if (string.IsNullOrWhiteSpace(req.ConfirmPassword) || req.ConfirmPassword != req.NewPassword)
                return BadRequest(new { error = "Підтвердження пароля не збігається" });

            var fv = HttpContext.RequestServices.GetService(
                typeof(IValidator<SetPasswordRequest>))
                     as IValidator<SetPasswordRequest>;

            if (fv is not null)
            {
                var result = await fv.ValidateAsync(req);
                if (!result.IsValid)
                {
                    var errors = result.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                    return BadRequest(new { errors });
                }
            }

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized(new { error = "No user in context" });

            await auth.SetLocalPasswordAsync(int.Parse(userIdStr), req.NewPassword);
            return Ok(new { ok = true, isLocalPasswordSet = true });
        }
    }
}
