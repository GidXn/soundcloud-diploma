using Google.Apis.Auth;

namespace soundcloud_back.Services.Interfaces;

public interface IGoogleTokenValidator
{
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken);
}
