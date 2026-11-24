namespace soundcloud_back
{
    public class EmailMessage
    {
        /// <summary>
        /// Email subject
        /// </summary>
        public string Subject { get; set; } = string.Empty;
        /// <summary>
        /// Email body
        /// </summary>
        public string Body { get; set; } = string.Empty;
        /// <summary>
        /// Recipient email address
        /// </summary>
        public string To { get; set; } = string.Empty;
    }
}

