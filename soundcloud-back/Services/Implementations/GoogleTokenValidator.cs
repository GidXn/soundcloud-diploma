using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using soundcloud_back.Options;
using soundcloud_back.Services.Interfaces;
using System.Security;

namespace soundcloud_back.Services.Implementations;

public class GoogleTokenValidator : IGoogleTokenValidator
{
    private readonly GoogleAuthOptions _opts;
    public GoogleTokenValidator(IOptions<GoogleAuthOptions> opts) => _opts = opts.Value;

    public async Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _opts.ClientId }
        };
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (payload == null || string.IsNullOrWhiteSpace(payload.Email) || payload.EmailVerified != true)
                throw new SecurityException("Google token invalid or email not verified.");

            return payload;
        }
        catch (InvalidJwtException ex)
        {
            Console.WriteLine("[GoogleTokenValidator] expected ClientId=" + _opts.ClientId);
            Console.WriteLine("[GoogleTokenValidator] InvalidJwtException: " + ex.Message);
            throw;
        }
    }
}
