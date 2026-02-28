namespace soundcloud_back.Interfaces;

public interface ISmtpService
{
    Task<bool> SendEmailAsync(EmailMessage message);
}
