using System.Threading.Tasks;

namespace soundcloud_back.Services.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
    }
}

