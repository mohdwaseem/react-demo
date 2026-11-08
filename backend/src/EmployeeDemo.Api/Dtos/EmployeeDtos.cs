using System.ComponentModel.DataAnnotations;
using EmployeeDemo.Api.Entities;

namespace EmployeeDemo.Api.Dtos;

// Matching TypeScript types live in frontend/src/types/employee.ts.

/// <summary>Returned by GET endpoints.</summary>
public class EmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; }
    public decimal Salary { get; set; }
    public bool IsActive { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;

    /// <summary>Base64 rowversion. The client must send it back on update (optimistic concurrency).</summary>
    public string RowVersion { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Body of POST /api/employees.</summary>
public class EmployeeCreateDto
{
    [Required, StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Phone, StringLength(20)]
    public string? Phone { get; set; }

    [Required]
    public DateOnly HireDate { get; set; }

    [Range(0, 10_000_000)]
    public decimal Salary { get; set; }

    public bool IsActive { get; set; } = true;

    [EnumDataType(typeof(EmploymentType))]
    public EmploymentType EmploymentType { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Please select a department.")]
    public int DepartmentId { get; set; }
}

/// <summary>Body of PUT /api/employees/{id}. Same fields + the RowVersion we read earlier.</summary>
public class EmployeeUpdateDto : EmployeeCreateDto
{
    [Required]
    public string RowVersion { get; set; } = string.Empty;
}

/// <summary>
/// Query-string parameters of GET /api/employees, bound with [FromQuery].
/// Example: /api/employees?search=ali&amp;departmentId=2&amp;sortBy=salary&amp;sortDir=desc&amp;page=2&amp;pageSize=10
/// </summary>
public class EmployeeQuery
{
    public string? Search { get; set; }
    public int? DepartmentId { get; set; }
    public bool? IsActive { get; set; }

    /// <summary>name | email | hireDate | salary | department</summary>
    public string? SortBy { get; set; }

    /// <summary>asc | desc</summary>
    public string? SortDir { get; set; }

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
}
