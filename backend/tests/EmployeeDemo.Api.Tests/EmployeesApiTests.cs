using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using EmployeeDemo.Api.Dtos;
using EmployeeDemo.Api.Entities;

namespace EmployeeDemo.Api.Tests;

[Collection(nameof(ApiCollection))]
public class EmployeesApiTests(ApiFactory factory)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private static EmployeeCreateDto NewEmployee(string email) => new()
    {
        FirstName = "Test",
        LastName = "User",
        Email = email,
        HireDate = new DateOnly(2025, 1, 15),
        Salary = 50000,
        IsActive = true,
        EmploymentType = EmploymentType.Contract,
        DepartmentId = 1
    };

    [Fact]
    public async Task List_returns_requested_page()
    {
        var client = factory.CreateClient();

        var page = await client.GetFromJsonAsync<PagedResult<EmployeeDto>>(
            "/api/employees?page=2&pageSize=5&sortBy=salary&sortDir=desc", Json);

        Assert.NotNull(page);
        Assert.Equal(2, page.Page);
        Assert.Equal(5, page.Items.Count);
        Assert.True(page.TotalCount >= 42);
        Assert.True(page.Items[0].Salary >= page.Items[^1].Salary); // sorted desc
    }

    [Fact]
    public async Task Create_without_token_returns_401()
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/employees", NewEmployee("anon@demo.local"), Json);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_with_invalid_body_returns_400_with_field_errors()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var invalid = NewEmployee("not-an-email");
        invalid.FirstName = "";

        var response = await client.PostAsJsonAsync("/api/employees", invalid, Json);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var errors = problem.GetProperty("errors");
        Assert.True(errors.TryGetProperty("FirstName", out _) || errors.TryGetProperty("firstName", out _));
        Assert.True(errors.TryGetProperty("Email", out _) || errors.TryGetProperty("email", out _));
    }

    [Fact]
    public async Task Create_then_get_round_trips()
    {
        var client = await factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/employees", NewEmployee("roundtrip@demo.local"), Json);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var created = await response.Content.ReadFromJsonAsync<EmployeeDto>(Json);
        var fetched = await client.GetFromJsonAsync<EmployeeDto>($"/api/employees/{created!.Id}", Json);
        Assert.Equal("roundtrip@demo.local", fetched!.Email);
        Assert.Equal(EmploymentType.Contract, fetched.EmploymentType);
    }

    [Fact]
    public async Task Duplicate_email_returns_409_with_email_error()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        await client.PostAsJsonAsync("/api/employees", NewEmployee("dupe@demo.local"), Json);

        var response = await client.PostAsJsonAsync("/api/employees", NewEmployee("dupe@demo.local"), Json);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("email", out _));
    }

    [Fact]
    public async Task Update_with_stale_row_version_returns_409()
    {
        var client = await factory.CreateAuthenticatedClientAsync();
        var created = await (await client.PostAsJsonAsync("/api/employees", NewEmployee("concurrency@demo.local"), Json))
            .Content.ReadFromJsonAsync<EmployeeDto>(Json);

        EmployeeUpdateDto Update(string rowVersion, string firstName) => new()
        {
            FirstName = firstName, LastName = created!.LastName, Email = created.Email, HireDate = created.HireDate,
            Salary = created.Salary, IsActive = created.IsActive, EmploymentType = created.EmploymentType,
            DepartmentId = created.DepartmentId, RowVersion = rowVersion
        };

        // User A saves first → succeeds.
        var first = await client.PutAsJsonAsync($"/api/employees/{created!.Id}", Update(created.RowVersion, "UserA"), Json);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        // User B still has the old RowVersion → conflict.
        var second = await client.PutAsJsonAsync($"/api/employees/{created.Id}", Update(created.RowVersion, "UserB"), Json);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Get_unknown_employee_returns_404_problem_details()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/employees/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
