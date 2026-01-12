namespace soundcloud_back.Models.Auth
{
    public sealed class SetPasswordRequest
    {
        public string NewPassword { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
    }
}
