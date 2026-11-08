using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDemo.Api.Controllers;

/// <summary>
/// REST endpoints for employees. Compared with an MVC controller, an API controller
/// returns JSON (data) instead of a View (HTML). The React app is now the "View".
///
///   GET    /api/employees          → list (search, filter, sort, paging)
///   GET    /api/employees/{id}     → one employee
///   POST   /api/employees          → create      (requires login)
///   PUT    /api/employees/{id}     → update      (requires login)
///   DELETE /api/employees/{id}     → delete      (requires login)
/// </summary>
[ApiController]                 // automatic 400 ValidationProblemDetails + [FromBody] inference
[Route("api/[controller]")]
[Authorize]                     // every action requires a JWT unless marked [AllowAnonymous]
public class EmployeesController(IEmployeeService service) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<EmployeeDto>>> GetAll([FromQuery] EmployeeQuery query, CancellationToken ct)
        => Ok(await service.GetPagedAsync(query, ct));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<EmployeeDto>> GetById(int id, CancellationToken ct)
        => Ok(await service.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        // 201 Created + Location header pointing to GET /api/employees/{id}
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> Update(int id, EmployeeUpdateDto dto, CancellationToken ct)
        => Ok(await service.UpdateAsync(id, dto, ct)); // returns the new RowVersion to the client

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent(); // 204
    }
}
