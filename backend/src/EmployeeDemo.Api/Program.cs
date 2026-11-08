// =====================================================================================
//  Program.cs: the entry point. Same idea as Startup.cs in older .NET versions:
//  1) register services (dependency injection)   2) build the HTTP pipeline (middleware)
//  GUIDE: docs/guide/08-backend-api-walkthrough.md
// =====================================================================================
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using EmployeeDemo.Api.Data;
using EmployeeDemo.Api.Infrastructure;
using EmployeeDemo.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ---------- 1. Services ----------

// Controllers + JSON settings. Enums are sent as "FullTime" instead of 0.
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// EF Core + SQL Server. Connection string comes from appsettings / environment variables.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application services (Scoped = one instance per HTTP request, like the DbContext).
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Errors → ProblemDetails JSON (see Infrastructure/GlobalExceptionHandler.cs).
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// CORS: the browser blocks calls from http://localhost:3000 (Next.js) to http://localhost:5080 (this API)
// unless the API says that origin is allowed. GUIDE: docs/guide/09-integrating-backend-apis.md#cors
const string CorsPolicy = "frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

// JWT authentication. GUIDE: docs/guide/13-authentication.md
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwt.Issuer,
        ValidateAudience = true,
        ValidAudience = jwt.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    });
builder.Services.AddAuthorization();

// OpenAPI document (/openapi/v1.json) + Scalar UI (/scalar) to try the API in a browser.
builder.Services.AddOpenApi();

var app = builder.Build();

// ---------- 2. HTTP pipeline (order matters!) ----------

app.UseExceptionHandler();   // catches exceptions thrown below and returns ProblemDetails
app.UseStatusCodePages();    // empty 401/404 responses also get a ProblemDetails body

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// A tiny "minimal API" endpoint, the alternative to controllers. Used by deploy smoke tests.
var version = Assembly.GetExecutingAssembly()
    .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "dev";
app.MapGet("/api/health", (IWebHostEnvironment env) => Results.Ok(new
{
    status = "Healthy",
    version,
    environment = env.EnvironmentName
}));

// Development convenience: create/upgrade the database and insert demo data on startup.
// In production use the SQL script or migration bundle instead. GUIDE: docs/guide/16-build-and-package.md
if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    if (app.Configuration.GetValue<bool>("Database:SeedDemoData"))
        await DbSeeder.SeedAsync(db);
}

app.Run();

// Makes Program visible to the integration tests (WebApplicationFactory<Program>).
public partial class Program;
