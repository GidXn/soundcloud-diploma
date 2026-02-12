# SoundCloud Back (soundcloud-back)

A minimal backend implementation for a SoundCloud-like application built with .NET 10 and C# 14.

Technologies
- .NET 10
- C# 14
- ASP.NET Core Web API
- Entity Framework Core with Npgsql (PostgreSQL)
- JWT authentication (Bearer)
- Google token validation for social login
- FluentValidation
- Swagger (OpenAPI)

Quick Requirements
- .NET 10 SDK
- PostgreSQL
- `dotnet-ef` (for database migrations)

Getting started

1. Clone the repository

    git clone <repo-url>
    cd soundcloud-back

2. Configure environment / `appsettings.json`

Required configuration sections:
- `ConnectionStrings:DefaultConnection` — PostgreSQL connection string
- `Jwt`:
  - `Key` — symmetric key for signing JWTs (keep secret)
  - `Issuer`
  - `Audience`
- `GoogleAuth` — configuration used by the Google token validator (client id, etc.)

Example minimal `appsettings.Development.json` snippet:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=soundcloud;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "super-secret-key-change-me",
    "Issuer": "soundcloud-api",
    "Audience": "soundcloud-client"
  },
  "GoogleAuth": {
    "ClientId": "your-google-client-id"
  }
}
```

3. Install dotnet-ef (if not installed)

    dotnet tool install --global dotnet-ef

4. Run migrations / create database

    dotnet ef database update --project soundcloud-back

5. Run the API

    dotnet run --project soundcloud-back

The API will run on the configured Kestrel port (by default `http://localhost:5000` / `https://localhost:5001`).

Useful endpoints
- Swagger UI: `/swagger`
- API controllers are under `Controllers` (browse the project)

CORS
- The project registers a CORS policy named `AllowFrontend` that allows `http://localhost:5173` by default. Change or extend the origins in `Program.cs` or via configuration if needed.

Notes
- The project suppresses automatic ModelState validation to use FluentValidation validators manually.
- JWT options are configured in `Program.cs` — ensure the `Jwt:Key` value is sufficiently long and stored securely in production.

Development tips
- Use the provided `soundcloud-back.http` file (if present) to exercise common API calls.
- Run and inspect Swagger during development to explore available endpoints.

License
- Project license not specified in repository. Add a `LICENSE` file if you intend to publish this project.
