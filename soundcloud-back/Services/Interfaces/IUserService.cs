using soundcloud_back.Data.Entities;
using Google.Apis.Auth;
using System.Threading.Tasks;

namespace soundcloud_back.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload payload);
    }
}
