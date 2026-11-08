using EmployeeDemo.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDemo.Api.Data;

/// <summary>
/// EF Core DbContext = the "unit of work" + gateway to SQL Server.
/// Table shapes are configured here with the Fluent API (instead of attributes on the entities).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Department>(e =>
        {
            e.Property(d => d.Name).HasMaxLength(100).IsRequired();
            e.Property(d => d.Code).HasMaxLength(10).IsRequired();
            e.Property(d => d.Description).HasMaxLength(500);
            e.HasIndex(d => d.Code).IsUnique();
        });

        modelBuilder.Entity<Employee>(e =>
        {
            e.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(50).IsRequired();
            e.Property(x => x.Email).HasMaxLength(150).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.Salary).HasPrecision(18, 2);
            e.Property(x => x.EmploymentType).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => x.Email).IsUnique();

            // Restrict = SQL will refuse to delete a department that still has employees.
            e.HasOne(x => x.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
