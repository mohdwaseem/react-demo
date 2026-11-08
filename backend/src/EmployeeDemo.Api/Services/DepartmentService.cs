using EmployeeDemo.Api.Data;
using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Entities;
using EmployeeDemo.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDemo.Api.Services;

public interface IDepartmentService
{
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken ct);
    Task<DepartmentDto> GetByIdAsync(int id, CancellationToken ct);
    Task<DepartmentDto> CreateAsync(DepartmentSaveDto dto, CancellationToken ct);
    Task<DepartmentDto> UpdateAsync(int id, DepartmentSaveDto dto, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}

public class DepartmentService(AppDbContext db) : IDepartmentService
{
    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken ct) =>
        await db.Departments.AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                EmployeeCount = d.Employees.Count, // translated to a SQL sub-query
                CreatedAt = d.CreatedAt
            })
            .ToListAsync(ct);

    public async Task<DepartmentDto> GetByIdAsync(int id, CancellationToken ct) =>
        await db.Departments.AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                EmployeeCount = d.Employees.Count,
                CreatedAt = d.CreatedAt
            })
            .FirstOrDefaultAsync(ct)
        ?? throw new NotFoundException($"Department {id} was not found.");

    public async Task<DepartmentDto> CreateAsync(DepartmentSaveDto dto, CancellationToken ct)
    {
        await EnsureUniqueCodeAsync(dto.Code, excludeId: null, ct);
        var department = new Department();
        department.Apply(dto);
        db.Departments.Add(department);
        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(department.Id, ct);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, DepartmentSaveDto dto, CancellationToken ct)
    {
        var department = await db.Departments.FindAsync([id], ct)
            ?? throw new NotFoundException($"Department {id} was not found.");
        await EnsureUniqueCodeAsync(dto.Code, excludeId: id, ct);
        department.Apply(dto);
        await db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var department = await db.Departments.FindAsync([id], ct)
            ?? throw new NotFoundException($"Department {id} was not found.");

        var employeeCount = await db.Employees.CountAsync(e => e.DepartmentId == id, ct);
        if (employeeCount > 0)
            throw new ConflictException(
                $"'{department.Name}' still has {employeeCount} employee(s). Move or delete them first.");

        db.Departments.Remove(department);
        await db.SaveChangesAsync(ct);
    }

    private async Task EnsureUniqueCodeAsync(string code, int? excludeId, CancellationToken ct)
    {
        var normalized = code.Trim().ToUpperInvariant();
        if (await db.Departments.AnyAsync(d => d.Code == normalized && d.Id != excludeId, ct))
            throw new ConflictException($"Department code '{normalized}' already exists.", "code");
    }
}
