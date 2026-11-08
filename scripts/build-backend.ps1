<#
.SYNOPSIS
  Builds, tests and publishes the .NET API, and generates the database scripts.

.DESCRIPTION
  Output:
    artifacts/api/                 → copy to the server (IIS site folder / container)
    artifacts/db/migrate.sql       → idempotent SQL script for the DBA (safe to run more than once)
    artifacts/db/efbundle(.exe)    → self-contained migration runner: efbundle --connection "..."
    artifacts/coverage/            → test code coverage (Cobertura XML), unless -SkipTests

  GUIDE: docs/guide/16-build-and-package.md

  Publish modes:
    default          framework-dependent for one platform (-Runtime, default win-x64).
                     Small; the server needs the ASP.NET Core Runtime / Hosting Bundle.
    -SelfContained   includes the .NET runtime itself. Bigger; nothing to install on the server.
    -Portable        framework-dependent for ANY OS (ships native files for all platforms → large).

.EXAMPLE
  ./scripts/build-backend.ps1
  ./scripts/build-backend.ps1 -Runtime linux-x64                 # for a Linux server / container
  ./scripts/build-backend.ps1 -SelfContained -Runtime win-x64    # no .NET runtime needed on the server
  ./scripts/build-backend.ps1 -SkipTests
#>
param(
    [string]$Configuration = 'Release',
    [string]$Version,                 # e.g. 1.2.0 (default: version.json)
    [string]$InformationalVersion,    # e.g. 1.2.0+a1b2c3d (shown by /api/health)
    [string]$Runtime = 'win-x64',     # RID: win-x64, linux-x64, linux-arm64, osx-arm64, ...
    [switch]$SelfContained,
    [switch]$Portable,
    [switch]$SkipTests,
    [string]$OutputRoot
)

. "$PSScriptRoot/_common.ps1"

if (-not $OutputRoot) { $OutputRoot = $DefaultArtifacts }
if (-not $Version) {
    $v = Get-ReleaseVersion
    $Version = $v.Version
    if (-not $InformationalVersion) { $InformationalVersion = $v.Informational }
}
if (-not $InformationalVersion) { $InformationalVersion = $Version }

$backend = Join-Path $RepoRoot 'backend'
$project = Join-Path $backend 'src/EmployeeDemo.Api/EmployeeDemo.Api.csproj'
$apiOut = Join-Path $OutputRoot 'api'
$dbOut = Join-Path $OutputRoot 'db'
$coverageOut = Join-Path $OutputRoot 'coverage'

Push-Location $backend
try {
    Invoke-Native 'Restore local tools (dotnet-ef)' { dotnet tool restore }
    Invoke-Native 'Restore NuGet packages' { dotnet restore }
    Invoke-Native "Build ($Configuration)" {
        dotnet build -c $Configuration --no-restore "-p:Version=$Version" "-p:InformationalVersion=$InformationalVersion"
    }

    if (-not $SkipTests) {
        # "XPlat Code Coverage" = coverlet.collector (referenced by the test project).
        # Each run writes <guid>/coverage.cobertura.xml; CI turns it into the README badge.
        Reset-Directory $coverageOut
        Invoke-Native 'Run tests (with code coverage)' {
            dotnet test -c $Configuration --no-build --collect 'XPlat Code Coverage' --results-directory $coverageOut
        }
    }

    Reset-Directory $apiOut
    $publishArgs = @('publish', $project, '-c', $Configuration, '-o', $apiOut,
                     "-p:Version=$Version", "-p:InformationalVersion=$InformationalVersion")
    if ($Portable) {
        $publishArgs += @('--no-build')
        $mode = 'framework-dependent, portable'
    } elseif ($SelfContained) {
        $publishArgs += @('-r', $Runtime, '--self-contained', 'true')
        $mode = "self-contained, $Runtime"
    } else {
        $publishArgs += @('-r', $Runtime, '--self-contained', 'false')
        $mode = "framework-dependent, $Runtime"
    }
    Invoke-Native "Publish API ($mode) → $apiOut" { dotnet @publishArgs }

    # Development-only settings have no place on a server.
    Remove-Item (Join-Path $apiOut 'appsettings.Development.json') -ErrorAction SilentlyContinue

    Reset-Directory $dbOut
    Invoke-Native 'Generate idempotent SQL migration script' {
        dotnet ef migrations script --idempotent --project $project -c AppDbContext -o (Join-Path $dbOut 'migrate.sql') --no-build --configuration $Configuration
    }
    $bundleName = if ($Runtime -like 'win-*') { 'efbundle.exe' } else { 'efbundle' }
    Invoke-Native "Create EF Core migration bundle ($Runtime)" {
        dotnet ef migrations bundle --project $project -o (Join-Path $dbOut $bundleName) --force --configuration $Configuration --target-runtime $Runtime
    }

    Write-Step "Backend artifacts ready ($InformationalVersion)"
    Get-ChildItem $OutputRoot -Directory | Where-Object Name -in 'api', 'db' | ForEach-Object {
        $size = (Get-ChildItem $_.FullName -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
        Write-Host ("  {0,-5} {1,8:N1} MB  {2}" -f $_.Name, $size, $_.FullName)
    }
}
finally {
    Pop-Location
}
