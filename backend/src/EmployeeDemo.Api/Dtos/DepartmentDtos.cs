using System.ComponentModel.DataAnnotations;

namespace EmployeeDemo.Api.Dtos;

// DTO = Data Transfer Object: the JSON shape the API sends/receives.
// We never expose EF entities directly. The React app has matching TypeScript types
// in frontend/src/types/department.ts.

/// <summary>Returned by GET endpoints.</summary>
public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int EmployeeCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Body of POST /api/departments and PUT /api/departments/{id}.</summary>
public class DepartmentSaveDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(10, MinimumLength = 2)]
    [RegularExpression("^[A-Za-z0-9]+$", ErrorMessage = "Code may contain only letters and digits.")]
    public string Code { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}
