using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using soundcloud_back.Services.Interfaces;

namespace soundcloud_back.Controllers;

[ApiController]
[Route("auth")]
public class FacebookAuthenticationController : ControllerBase
{
    private readonly IFacebookTokenValidator _facebook;
    private readonly IUserService _users;
    private readonly IAuthService _auth;

    public FacebookAuthenticationController(
        IFacebookTokenValidator facebook,
        IUserService users,
        IAuthService auth)
    {
        _facebook = facebook;
        _users = users;
        _auth = auth;
    }

    public class TokenRequest { public string Token { get; set; } = ""; }

    [AllowAnonymous]
    [HttpPost("facebook")]
    public async Task<IActionResult> FacebookLogin([FromBody] TokenRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Token))
            return BadRequest(new { error = "Token is required" });

        try
        {
            var userInfo = await _facebook.ValidateAsync(req.Token);

            if (string.IsNullOrWhiteSpace(userInfo.Email))
                return BadRequest(new { error = "Email is required from Facebook account" });

            var user = await _users.FindOrCreateFromFacebookAsync(
                userInfo.Id,
                userInfo.Email,
                userInfo.Name,
                userInfo.Picture);

            var jwt = _auth.IssueJwtForUser(user);

            return Ok(new
            {
                token = jwt,
                expiresAt = DateTime.UtcNow.AddHours(1),
                id = user.Id,
                username = user.Username,
                email = user.Email,
                avatarUrl = user.AvatarUrl
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine("[AUTH/FACEBOOK] UnauthorizedAccessException: " + ex);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine("[AUTH/FACEBOOK] ERROR: " + ex);
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
