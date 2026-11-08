using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeDemo.Api.Infrastructure;

/// <summary>
/// One place that converts exceptions into RFC 7807 "ProblemDetails" JSON responses.
/// The React API client (frontend/src/lib/api/client.ts) reads this shape to show errors.
///
/// Example response:
/// { "type": "...", "title": "Conflict", "status": 409, "detail": "Email is already used.",
///   "errors": { "email": ["Email is already used."] } }
/// </summary>
public class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        var (status, title, detail) = exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, "Not found", e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, "Conflict", e.Message),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict, "Concurrency conflict",
                "This record was changed by someone else. Reload it and try again."),
            _ => (StatusCodes.Status500InternalServerError, "Server error",
                "An unexpected error occurred. Please try again later.")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception");

        var problem = new ProblemDetails { Status = status, Title = title, Detail = detail };

        if (exception is ConflictException { Field: not null } conflict)
            problem.Extensions["errors"] = new Dictionary<string, string[]>
            {
                [conflict.Field] = [conflict.Message]
            };

        httpContext.Response.StatusCode = status;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception
        });
    }
}
