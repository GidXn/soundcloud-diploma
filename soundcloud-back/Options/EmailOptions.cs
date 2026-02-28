namespace soundcloud_back.Options
{
    public class EmailOptions
    {
        public string SmtpHost { get; set; } = "";
        public int SmtpPort { get; set; }
        public bool UseSsl { get; set; } = true;
        public string FromAddress { get; set; } = "";
        public string FromName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string FrontendBaseUrl { get; set; } = "";
    }
}

