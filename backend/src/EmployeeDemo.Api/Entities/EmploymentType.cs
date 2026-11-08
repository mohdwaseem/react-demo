namespace EmployeeDemo.Api.Entities;

/// <summary>
/// Stored as a string in SQL ("FullTime") and serialized as a string in JSON,
/// so the React app works with readable values instead of magic numbers.
/// </summary>
public enum EmploymentType
{
    FullTime,
    PartTime,
    Contract,
    Intern
}
