using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeDemo.Api.Dtos;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeDemo.Api.Services;

/// <summary>Bound from the "Jwt" section of appsettings.json.</summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    /// <summary>At least 32 characters. NEVER commit a real key: use user-secrets / environment variables.</summary>
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
}

/// <summary>Demo users from appsettings ("DemoUsers"). A real app would use ASP.NET Core Identity or an IdP.</summary>
public class DemoUser
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
}

public interface IAuthService
{
    LoginResponseDto? Login(LoginRequestDto request);
}

public class AuthService(IOptions<JwtOptions> jwtOptions, IConfiguration config) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public LoginResponseDto? Login(LoginRequestDto request)
    {
        var users = config.GetSection("DemoUsers").Get<List<DemoUser>>() ?? [];
        var user = users.FirstOrDefault(u =>
            string.Equals(u.Username, request.Username, StringComparison.OrdinalIgnoreCase) &&
            u.Password == request.Password);
        if (user is null) return null;

        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key)), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(_jwt.Issuer, _jwt.Audience, claims,
            expires: expires, signingCredentials: credentials);

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = expires
        };
    }
}
