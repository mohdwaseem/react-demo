using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeDemo.Api.Controllers;

/// <summary>
///   GET    /api/departments        → all departments (+ employee count)
///   GET    /api/departments/{id}
///   POST   /api/departments        (requires login)
///   PUT    /api/departments/{id}   (requires login)
///   DELETE /api/departments/{id}   (requires login, 409 if it still has employees)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController(IDepartmentService service) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<DepartmentDto>>> GetAll(CancellationToken ct)
        => Ok(await service.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<DepartmentDto>> GetById(int id, CancellationToken ct)
        => Ok(await service.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<DepartmentDto>> Create(DepartmentSaveDto dto, CancellationToken ct)
    {
        var created = await service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DepartmentDto>> Update(int id, DepartmentSaveDto dto, CancellationToken ct)
        => Ok(await service.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
