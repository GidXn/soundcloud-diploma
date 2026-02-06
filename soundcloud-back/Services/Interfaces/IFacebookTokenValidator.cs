namespace soundcloud_back.Services.Interfaces;

public class FacebookUserInfo
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Picture { get; set; }
}

public interface IFacebookTokenValidator
{
    Task<FacebookUserInfo> ValidateAsync(string accessToken);
}
