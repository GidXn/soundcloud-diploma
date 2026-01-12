using Google.Apis.Auth;

namespace soundcloud_back.Services.Abstractions;

public interface IGoogleTokenValidator
{
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken);
}
