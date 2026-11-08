using System.Net.Http.Headers;
using System.Net.Http.Json;
using EmployeeDemo.Api.Data;
using EmployeeDemo.Api.Dtos;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeDemo.Api.Tests;

/// <summary>
/// Starts the real API in memory (no IIS/Kestrel port needed) against a separate test database.
/// The database is dropped and recreated once per test run, then seeded with the demo data.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    /// <summary>Local SQL Server by default; CI overrides it with the TEST_CONNECTION_STRING environment variable.</summary>
    public static readonly string TestConnectionString =
        Environment.GetEnvironmentVariable("TEST_CONNECTION_STRING")
        ?? "Server=localhost;Database=EmployeeDemoDb_Tests;Trusted_Connection=True;TrustServerCertificate=True";

    public ApiFactory()
    {
        // Environment variables override appsettings.json (same trick you use on a real server).
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", TestConnectionString);
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development"); // → migrate + seed on startup
    }

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(TestConnectionString).Options;
        await using var db = new AppDbContext(options);
        await db.Database.EnsureDeletedAsync();
        _ = Server; // starts the app → Program.cs runs MigrateAsync + DbSeeder
    }

    Task IAsyncLifetime.DisposeAsync() => Task.CompletedTask;

    /// <summary>HttpClient that already carries a valid JWT (logged in as the demo admin).</summary>
    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequestDto { Username = "admin", Password = "Admin@123" });
        response.EnsureSuccessStatusCode();
        var login = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);
        return client;
    }

    public AppDbContext CreateDbContext() => Services.CreateScope().ServiceProvider.GetRequiredService<AppDbContext>();
}

[CollectionDefinition(nameof(ApiCollection))]
public class ApiCollection : ICollectionFixture<ApiFactory>;
