# Shared helpers for the build scripts. Dot-sourced: . "$PSScriptRoot/_common.ps1"

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$DefaultArtifacts = Join-Path $RepoRoot 'artifacts'

function Write-Step([string]$Message) {
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

# Runs a native command (dotnet, npm, ...) and stops the script if it fails.
# PowerShell does not stop on a non-zero exit code by itself, so we check $LASTEXITCODE.
function Invoke-Native([string]$Description, [scriptblock]$Command) {
    Write-Step $Description
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Step failed (exit code $LASTEXITCODE): $Description"
    }
}

function Reset-Directory([string]$Path) {
    if (Test-Path $Path) { Remove-Item $Path -Recurse -Force }
    New-Item -ItemType Directory -Force $Path | Out-Null
}

# Version from version.json, plus the git short commit hash when available: "1.0.0+a1b2c3d".
function Get-ReleaseVersion {
    $version = (Get-Content (Join-Path $RepoRoot 'version.json') -Raw | ConvertFrom-Json).version
    $sha = $null
    try { $sha = (git -C $RepoRoot rev-parse --short HEAD 2>$null) } catch { }
    if ($LASTEXITCODE -eq 0 -and $sha) {
        return [pscustomobject]@{ Version = $version; Informational = "$version+$sha" }
    }
    return [pscustomobject]@{ Version = $version; Informational = $version }
}
