using EmployeeDemo.Api.Data;
using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Entities;
using EmployeeDemo.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDemo.Api.Services;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeDto>> GetPagedAsync(EmployeeQuery query, CancellationToken ct);
    Task<EmployeeDto> GetByIdAsync(int id, CancellationToken ct);
    Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto, CancellationToken ct);
    Task<EmployeeDto> UpdateAsync(int id, EmployeeUpdateDto dto, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<DashboardDto> GetDashboardAsync(CancellationToken ct);
}

/// <summary>
/// Business logic for employees. Controllers stay thin and only translate HTTP ↔ service calls.
/// </summary>
public class EmployeeService(AppDbContext db) : IEmployeeService
{
    public async Task<PagedResult<EmployeeDto>> GetPagedAsync(EmployeeQuery q, CancellationToken ct)
    {
        IQueryable<Employee> query = db.Employees.AsNoTracking().Include(e => e.Department);

        // ---- Filtering ----
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            query = query.Where(e =>
                e.FirstName.Contains(s) || e.LastName.Contains(s) || e.Email.Contains(s));
        }
        if (q.DepartmentId is not null) query = query.Where(e => e.DepartmentId == q.DepartmentId);
        if (q.IsActive is not null) query = query.Where(e => e.IsActive == q.IsActive);

        // ---- Sorting (whitelisted column names, never raw SQL from the client) ----
        var desc = string.Equals(q.SortDir, "desc", StringComparison.OrdinalIgnoreCase);
        query = (q.SortBy?.ToLowerInvariant()) switch
        {
            "email" => desc ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "hiredate" => desc ? query.OrderByDescending(e => e.HireDate) : query.OrderBy(e => e.HireDate),
            "salary" => desc ? query.OrderByDescending(e => e.Salary) : query.OrderBy(e => e.Salary),
            "department" => desc ? query.OrderByDescending(e => e.Department!.Name) : query.OrderBy(e => e.Department!.Name),
            _ => desc
                ? query.OrderByDescending(e => e.FirstName).ThenByDescending(e => e.LastName)
                : query.OrderBy(e => e.FirstName).ThenBy(e => e.LastName),
        };
        query = ((IOrderedQueryable<Employee>)query).ThenBy(e => e.Id); // stable paging

        // ---- Paging (OFFSET/FETCH in SQL) ----
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync(ct);

        return new PagedResult<EmployeeDto>
        {
            Items = items.Select(e => e.ToDto()).ToList(),
            Page = q.Page,
            PageSize = q.PageSize,
            TotalCount = total
        };
    }

    public async Task<EmployeeDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var employee = await db.Employees.AsNoTracking()
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"Employee {id} was not found.");
        return employee.ToDto();
    }

    public async Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto, CancellationToken ct)
    {
        await EnsureValidAsync(dto, excludeId: null, ct);

        var employee = new Employee();
        employee.Apply(dto);
        db.Employees.Add(employee);
        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(employee.Id, ct);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, EmployeeUpdateDto dto, CancellationToken ct)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"Employee {id} was not found.");

        await EnsureValidAsync(dto, excludeId: id, ct);

        // Tell EF which version the client saw. If SQL has a newer one,
        // SaveChanges throws DbUpdateConcurrencyException → 409 (see GlobalExceptionHandler).
        db.Entry(employee).Property(e => e.RowVersion).OriginalValue = Convert.FromBase64String(dto.RowVersion);

        employee.Apply(dto);
        employee.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"Employee {id} was not found.");
        db.Employees.Remove(employee);
        await db.SaveChangesAsync(ct);
    }

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
    {
        var byDepartment = await db.Departments.AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentCountDto { Department = d.Name, Count = d.Employees.Count })
            .ToListAsync(ct);

        return new DashboardDto
        {
            TotalEmployees = await db.Employees.CountAsync(ct),
            ActiveEmployees = await db.Employees.CountAsync(e => e.IsActive, ct),
            TotalDepartments = byDepartment.Count,
            AverageSalary = Math.Round(await db.Employees.Select(e => (decimal?)e.Salary).AverageAsync(ct) ?? 0, 2),
            EmployeesByDepartment = byDepartment
        };
    }

    /// <summary>Rules that need the database (DataAnnotations can't check these).</summary>
    private async Task EnsureValidAsync(EmployeeCreateDto dto, int? excludeId, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.Employees.AnyAsync(e => e.Email == email && e.Id != excludeId, ct))
            throw new ConflictException($"The email '{email}' is already used by another employee.", "email");

        if (!await db.Departments.AnyAsync(d => d.Id == dto.DepartmentId, ct))
            throw new ConflictException("The selected department does not exist.", "departmentId");
    }
}
