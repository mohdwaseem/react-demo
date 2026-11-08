using EmployeeDemo.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDemo.Api.Data;

/// <summary>
/// Inserts demo data the first time the database is empty (Development only, see Program.cs),
/// so the React list page has enough rows to demonstrate paging, sorting and filtering.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Departments.AnyAsync()) return;

        var departments = new List<Department>
        {
            new() { Name = "Engineering", Code = "ENG", Description = "Builds and maintains our products" },
            new() { Name = "Human Resources", Code = "HR", Description = "Hiring, payroll and people care" },
            new() { Name = "Finance", Code = "FIN", Description = "Budgets, accounting and reporting" },
            new() { Name = "Marketing", Code = "MKT", Description = "Brand, campaigns and growth" },
            new() { Name = "Support", Code = "SUP", Description = "Helps customers every day" },
        };
        db.Departments.AddRange(departments);

        string[] firstNames = ["Aarav", "Fatima", "John", "Priya", "Omar", "Sara", "Wei", "Elena", "Rahul", "Aisha",
                               "Carlos", "Mina", "David", "Zara", "Yusuf", "Anna", "Ravi", "Leila", "Tom", "Noor"];
        string[] lastNames = ["Sharma", "Khan", "Smith", "Patel", "Ali", "Garcia", "Chen", "Rossi", "Verma", "Hussain"];
        var types = Enum.GetValues<EmploymentType>();
        var random = new Random(42); // fixed seed = same demo data every time

        for (var i = 0; i < 42; i++)
        {
            var first = firstNames[i % firstNames.Length];
            var last = lastNames[(i * 7) % lastNames.Length];
            db.Employees.Add(new Employee
            {
                FirstName = first,
                LastName = last,
                Email = $"{first}.{last}{i}@demo.local".ToLowerInvariant(),
                Phone = $"+1-555-{random.Next(100, 999)}-{random.Next(1000, 9999)}",
                HireDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-random.Next(30, 3000))),
                Salary = random.Next(35, 180) * 1000m,
                IsActive = i % 9 != 0,
                EmploymentType = types[i % types.Length],
                Department = departments[i % departments.Count],
            });
        }

        await db.SaveChangesAsync();
    }
}
