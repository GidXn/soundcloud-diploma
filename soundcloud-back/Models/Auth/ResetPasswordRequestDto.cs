namespace soundcloud_back.Models.Auth
{
    public class ResetPasswordRequestDto
    {
        public string Token { get; set; } = "";
        public string NewPassword { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
    }
}

