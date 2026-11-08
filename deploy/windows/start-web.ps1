<#
.SYNOPSIS
  Starts the packaged Next.js app (artifacts/web or the unzipped EmployeeDemo-web-*.zip) on Windows.

.DESCRIPTION
  Use it directly for a quick test, or register it as a Windows service with NSSM:
    nssm install EmployeeDemoWeb "C:\Program Files\PowerShell\7\pwsh.exe" "-File C:\apps\employee-web\start-web.ps1"
  GUIDE: docs/guide/16b-deploy-to-iis-and-docker.md
#>
param(
    [string]$AppFolder = $PSScriptRoot,           # folder that contains server.js
    [int]$Port = 3000,
    [string]$ApiBaseUrl = 'http://localhost:5080' # used by the Next.js SERVER (runtime value)
)

$env:NODE_ENV = 'production'
$env:PORT = "$Port"
$env:HOSTNAME = 'localhost'      # only reachable through IIS; use 0.0.0.0 to listen on all interfaces
$env:API_BASE_URL = $ApiBaseUrl

Set-Location $AppFolder
node server.js
