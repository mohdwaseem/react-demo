namespace EmployeeDemo.Api.Entities;

/// <summary>
/// A department groups employees (one Department → many Employees).
/// This is the EF Core entity = one row in the dbo.Departments table.
/// </summary>
public class Department
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>Short unique code, e.g. "ENG". A unique index is configured in AppDbContext.</summary>
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property: lets EF load the employees of this department.
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
