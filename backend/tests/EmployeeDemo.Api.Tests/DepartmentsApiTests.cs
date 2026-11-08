using System.Net;
using System.Net.Http.Json;
using EmployeeDemo.Api.Dtos;

namespace EmployeeDemo.Api.Tests;

[Collection(nameof(ApiCollection))]
public class DepartmentsApiTests(ApiFactory factory)
{
    [Fact]
    public async Task List_includes_employee_counts()
    {
        var client = factory.CreateClient();
        var departments = await client.GetFromJsonAsync<List<DepartmentDto>>("/api/departments");
        Assert.NotNull(departments);
        Assert.True(departments.Count >= 5);
        Assert.Contains(departments, d => d.EmployeeCount > 0);
    }

    [Fact]
    public async Task Deleting_department_with_employees_returns_409()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var response = await client.DeleteAsync("/api/departments/1"); // seeded with employees
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Create_update_delete_empty_department()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var create = await client.PostAsJsonAsync("/api/departments",
            new DepartmentSaveDto { Name = "Legal", Code = "leg" });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<DepartmentDto>();
        Assert.Equal("LEG", created!.Code); // normalized to upper case

        var update = await client.PutAsJsonAsync($"/api/departments/{created.Id}",
            new DepartmentSaveDto { Name = "Legal & Compliance", Code = "LEG" });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var delete = await client.DeleteAsync($"/api/departments/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
    }
}
