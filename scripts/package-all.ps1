<#
.SYNOPSIS
  One command to produce versioned release zips for the API, the web app and the database.

.DESCRIPTION
  artifacts/
    EmployeeDemo-api-<version>.zip   ← contents of artifacts/api
    EmployeeDemo-web-<version>.zip   ← contents of artifacts/web
    EmployeeDemo-db-<version>.zip    ← migrate.sql + efbundle
    release-info.json                ← what was built, when, from which commit

  GUIDE: docs/guide/16-build-and-package.md

.EXAMPLE
  ./scripts/package-all.ps1
  ./scripts/package-all.ps1 -ApiBaseUrl https://api.mycompany.com -SelfContained
#>
param(
    [string]$ApiBaseUrl = 'http://localhost:5080',
    [string]$Runtime = 'win-x64',
    [switch]$SelfContained,
    [switch]$SkipTests,
    [string]$OutputRoot
)

. "$PSScriptRoot/_common.ps1"
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not $OutputRoot) { $OutputRoot = $DefaultArtifacts }
$v = Get-ReleaseVersion
Write-Step "Packaging Employee Demo $($v.Informational)"
Reset-Directory $OutputRoot

& "$PSScriptRoot/build-backend.ps1" -Version $v.Version -InformationalVersion $v.Informational `
    -Runtime $Runtime -SelfContained:$SelfContained -SkipTests:$SkipTests -OutputRoot $OutputRoot
& "$PSScriptRoot/build-frontend.ps1" -ApiBaseUrl $ApiBaseUrl -InformationalVersion $v.Informational -OutputRoot $OutputRoot

Write-Step 'Create zip files'
$zips = @{}
foreach ($part in 'api', 'web', 'db') {
    $zip = Join-Path $OutputRoot "EmployeeDemo-$part-$($v.Version).zip"
    # ZipFile (not Compress-Archive) so folders starting with "." such as .next are included.
    [System.IO.Compression.ZipFile]::CreateFromDirectory((Join-Path $OutputRoot $part), $zip,
        [System.IO.Compression.CompressionLevel]::Optimal, $false)
    $zips[$part] = (Split-Path $zip -Leaf)
    Write-Host ("  {0,-34} {1,8:N1} MB" -f (Split-Path $zip -Leaf), ((Get-Item $zip).Length / 1MB))
}

[ordered]@{
    product       = 'EmployeeDemo'
    version       = $v.Version
    informational = $v.Informational
    builtAtUtc    = (Get-Date).ToUniversalTime().ToString('o')
    builtBy       = [Environment]::UserName
    apiRuntime    = $Runtime
    apiMode       = if ($SelfContained) { 'self-contained' } else { 'framework-dependent' }
    webApiBaseUrl = $ApiBaseUrl
    files         = $zips
} | ConvertTo-Json | Set-Content (Join-Path $OutputRoot 'release-info.json')

Write-Step "Done → $OutputRoot"
