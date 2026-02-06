using Microsoft.Extensions.Options;
using soundcloud_back.Options;
using soundcloud_back.Services.Interfaces;
using System.Text.Json;

namespace soundcloud_back.Services.Implementations;

public class FacebookTokenValidator : IFacebookTokenValidator
{
    private readonly FacebookAuthOptions _opts;
    private readonly HttpClient _httpClient;

    public FacebookTokenValidator(IOptions<FacebookAuthOptions> opts, HttpClient httpClient)
    {
        _opts = opts.Value;
        _httpClient = httpClient;
    }

    public async Task<FacebookUserInfo> ValidateAsync(string accessToken)
    {
        // Перевірка токену через Facebook Graph API
        var debugUrl = $"https://graph.facebook.com/debug_token?input_token={accessToken}&access_token={_opts.AppId}|{_opts.AppSecret}";
        var debugResponse = await _httpClient.GetAsync(debugUrl);
        
        if (!debugResponse.IsSuccessStatusCode)
            throw new UnauthorizedAccessException("Invalid Facebook access token");

        var debugContent = await debugResponse.Content.ReadAsStringAsync();
        var debugJson = JsonDocument.Parse(debugContent);
        
        if (!debugJson.RootElement.GetProperty("data").GetProperty("is_valid").GetBoolean())
            throw new UnauthorizedAccessException("Facebook token is not valid");

        // Отримання інформації про користувача
        var userInfoUrl = $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={accessToken}";
        var userInfoResponse = await _httpClient.GetAsync(userInfoUrl);
        
        if (!userInfoResponse.IsSuccessStatusCode)
            throw new UnauthorizedAccessException("Failed to get user info from Facebook");

        var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
        var userInfoJson = JsonDocument.Parse(userInfoContent);

        var pictureUrl = "";
        if (userInfoJson.RootElement.TryGetProperty("picture", out var picture))
        {
            if (picture.TryGetProperty("data", out var pictureData))
            {
                if (pictureData.TryGetProperty("url", out var url))
                {
                    pictureUrl = url.GetString() ?? "";
                }
            }
        }

        return new FacebookUserInfo
        {
            Id = userInfoJson.RootElement.GetProperty("id").GetString() ?? "",
            Email = userInfoJson.RootElement.TryGetProperty("email", out var email) ? email.GetString() ?? "" : "",
            Name = userInfoJson.RootElement.GetProperty("name").GetString() ?? "",
            Picture = pictureUrl
        };
    }
}
