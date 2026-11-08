using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Entities;

namespace EmployeeDemo.Api.Infrastructure;

/// <summary>
/// Hand-written mapping between entities and DTOs (no AutoMapper), so every mapping is visible.
/// </summary>
public static class MappingExtensions
{
    public static EmployeeDto ToDto(this Employee e) => new()
    {
        Id = e.Id,
        FirstName = e.FirstName,
        LastName = e.LastName,
        Email = e.Email,
        Phone = e.Phone,
        HireDate = e.HireDate,
        Salary = e.Salary,
        IsActive = e.IsActive,
        EmploymentType = e.EmploymentType,
        DepartmentId = e.DepartmentId,
        DepartmentName = e.Department?.Name ?? string.Empty,
        RowVersion = Convert.ToBase64String(e.RowVersion),
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    /// <summary>Copies the editable fields from a create/update DTO onto an entity.</summary>
    public static void Apply(this Employee e, EmployeeCreateDto dto)
    {
        e.FirstName = dto.FirstName.Trim();
        e.LastName = dto.LastName.Trim();
        e.Email = dto.Email.Trim().ToLowerInvariant();
        e.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
        e.HireDate = dto.HireDate;
        e.Salary = dto.Salary;
        e.IsActive = dto.IsActive;
        e.EmploymentType = dto.EmploymentType;
        e.DepartmentId = dto.DepartmentId;
    }

    public static void Apply(this Department d, DepartmentSaveDto dto)
    {
        d.Name = dto.Name.Trim();
        d.Code = dto.Code.Trim().ToUpperInvariant();
        d.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
    }
}
