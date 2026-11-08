using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDemo.Api.Controllers;

/// <summary>POST /api/auth/login → returns a JWT the React app sends as "Authorization: Bearer &lt;token&gt;".</summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login(LoginRequestDto request)
    {
        var result = auth.Login(request);
        return result is null
            ? Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Login failed",
                      detail: "Invalid username or password.")
            : Ok(result);
    }
}
