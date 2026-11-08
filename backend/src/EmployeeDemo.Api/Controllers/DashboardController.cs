using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDemo.Api.Controllers;

/// <summary>GET /api/dashboard → summary numbers for the home page.</summary>
[ApiController]
[Route("api/[controller]")]
public class DashboardController(IEmployeeService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken ct) => Ok(await service.GetDashboardAsync(ct));
}
