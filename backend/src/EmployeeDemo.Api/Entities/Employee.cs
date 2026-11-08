namespace EmployeeDemo.Api.Entities;

/// <summary>
/// An employee. The properties were chosen so the React form needs every common input type:
/// text, email, phone, date, number, checkbox, enum dropdown and a foreign-key dropdown.
/// </summary>
public class Employee
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public DateOnly HireDate { get; set; }

    public decimal Salary { get; set; }

    public bool IsActive { get; set; } = true;

    public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;

    // Foreign key + navigation property (many Employees → one Department).
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }

    /// <summary>
    /// SQL Server rowversion column used for optimistic concurrency.
    /// If two users edit the same employee, the second save gets HTTP 409.
    /// </summary>
    public byte[] RowVersion { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
