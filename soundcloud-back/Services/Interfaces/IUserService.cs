using Google.Apis.Auth;
using soundcloud_back.Data.Entities;

namespace soundcloud_back.Services.Interfaces;

public interface IUserService
{
    Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload payload);
    Task<UserEntity> FindOrCreateFromFacebookAsync(string facebookId, string email, string name, string? pictureUrl);
}
