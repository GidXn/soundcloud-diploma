namespace soundcloud_back
{
    public static class EmailConfiguration
    {
        /// <summary>
        /// Хто відправляє листа
        /// </summary>
        public const string From = "yaroslav.bassaraba@ukr.net";
        /// <summary>
        /// Адреса SMTP сервера
        /// </summary>
        public const string SmtpServer = "smtp.ukr.net";
        /// <summary>
        /// Порт на якому працює сервер
        /// </summary>
        public const int Port = 2525;
        /// <summary>
        /// Імя користувача для авторизації
        /// </summary>
        public const string UserName = "yaroslav.bassaraba@ukr.net";
        /// <summary>
        /// Пароль, який видав сервер
        /// </summary>
        public const string Password = "bENr1hZJMB9J79zT";

        /// <summary>
        /// Базова адреса фронтенду для формування лінків
        /// </summary>
        public const string FrontendBaseUrl = "http://localhost:5173";
    }
}

