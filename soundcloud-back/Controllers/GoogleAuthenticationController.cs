using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using soundcloud_back.Options;
using soundcloud_back.Services.Interfaces;
using System.Security;

namespace soundcloud_back.Controllers;

//[ApiController]
//[Route("auth")]
//public class GoogleAuthenticationController : ControllerBase
//{
//    private readonly IGoogleTokenValidator _google;
//    private readonly IUserService _users;
//    private readonly IAuthService _auth;

//    public GoogleAuthenticationController(
//        IGoogleTokenValidator google,
//        IUserService users,
//        IAuthService auth)
//    {
//        _google = google;
//        _users = users;
//        _auth = auth;
//    }

//    public class TokenRequest { public string Token { get; set; } = ""; }

//    [AllowAnonymous]
//    [HttpPost("google")]
//    public async Task<IActionResult> GoogleLogin(
//        [FromBody] TokenRequest req,
//        [FromServices] IOptions<GoogleAuthOptions> opts)
//    {
//        if (string.IsNullOrWhiteSpace(req?.Token))
//            return BadRequest(new { error = "Token is required" });

//        var dots = req.Token.Count(c => c == '.');
//        Console.WriteLine($"[AUTH/GOOGLE] token.len={req.Token.Length}, dots={dots}, sample='{req.Token[..Math.Min(20, req.Token.Length)]}...'");
//        Console.WriteLine($"[AUTH/GOOGLE] expected ClientId={opts.Value.ClientId}");

//        if (dots != 2)
//            return BadRequest(new { error = "Provided token is not a Google ID token (must contain two dots)." });

//        try
//        {
//            var payload = await _google.ValidateAsync(req.Token);

//            Console.WriteLine($"[AUTH/GOOGLE] iss={payload.Issuer}, aud={payload.Audience}, sub={payload.Subject}, email={payload.Email}, verified={payload.EmailVerified}");

//            var user = await _users.FindOrCreateFromGoogleAsync(payload);

//            var jwt = _auth.IssueJwtForUser(user);

//            return Ok(new
//            {
//                token = jwt,
//                expiresAt = DateTime.UtcNow.AddHours(1),
//                id = user.Id,
//                username = user.Username,
//                email = user.Email,
//                avatarUrl = user.AvatarUrl
//            });
//        }
//        catch (InvalidJwtException ex)
//        {
//            Console.WriteLine("[AUTH/GOOGLE] InvalidJwtException: " + ex);
//            return BadRequest(new { error = "Invalid Google ID token: " + ex.Message });
//        }
//        catch (SecurityException ex)
//        {
//            Console.WriteLine("[AUTH/GOOGLE] SecurityException: " + ex);
//            return BadRequest(new { error = ex.Message });
//        }
//        catch (Exception ex)
//        {
//            Console.WriteLine("[AUTH/GOOGLE] ERROR: " + ex);
//            return StatusCode(500, new { error = ex.Message });
//        }
//    }
//}
