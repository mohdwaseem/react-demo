using System.ComponentModel.DataAnnotations;

namespace EmployeeDemo.Api.Dtos;

/// <summary>One page of results + the numbers the UI needs to draw a pager.</summary>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

/// <summary>Numbers for the dashboard (home page).</summary>
public class DashboardDto
{
    public int TotalEmployees { get; init; }
    public int ActiveEmployees { get; init; }
    public int TotalDepartments { get; init; }
    public decimal AverageSalary { get; init; }
    public IReadOnlyList<DepartmentCountDto> EmployeesByDepartment { get; init; } = [];
}

public class DepartmentCountDto
{
    public string Department { get; init; } = string.Empty;
    public int Count { get; init; }
}

public class LoginRequestDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}
