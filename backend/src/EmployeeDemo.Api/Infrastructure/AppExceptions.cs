namespace EmployeeDemo.Api.Infrastructure;

/// <summary>Thrown by services when a record does not exist → HTTP 404.</summary>
public class NotFoundException(string message) : Exception(message);

/// <summary>
/// Thrown when the request conflicts with current data → HTTP 409
/// (duplicate email, deleting a department that still has employees, ...).
/// If <see cref="Field"/> is set, the error is also returned in the "errors" dictionary
/// so the React form can show it under the matching input.
/// </summary>
public class ConflictException(string message, string? field = null) : Exception(message)
{
    public string? Field { get; } = field;
}
