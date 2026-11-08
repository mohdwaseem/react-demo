<#
.SYNOPSIS
  Lints, type-checks and builds the Next.js app, then assembles a deployable folder.

.DESCRIPTION
  `next build` with output: "standalone" creates .next/standalone (server.js + the minimal
  node_modules). It does NOT copy the static assets, so we add them:
     .next/static  → artifacts/web/.next/static     (JS/CSS chunks)
     public        → artifacts/web/public           (images, favicon, ...)
  Forgetting this step is the #1 reason for "page loads without CSS" in production.

  Run on the server with:   node server.js        (PORT / HOSTNAME / API_BASE_URL env vars)

  GUIDE: docs/guide/16-build-and-package.md

.EXAMPLE
  ./scripts/build-frontend.ps1 -ApiBaseUrl https://api.mycompany.com
#>
param(
    # Baked into the browser JavaScript at build time (NEXT_PUBLIC_API_BASE_URL).
    [string]$ApiBaseUrl = 'http://localhost:5080',
    [string]$InformationalVersion,
    [switch]$SkipChecks,
    [string]$OutputRoot
)

. "$PSScriptRoot/_common.ps1"

if (-not $OutputRoot) { $OutputRoot = $DefaultArtifacts }
if (-not $InformationalVersion) { $InformationalVersion = (Get-ReleaseVersion).Informational }

$frontend = Join-Path $RepoRoot 'frontend'
$webOut = Join-Path $OutputRoot 'web'

Push-Location $frontend
try {
    # npm ci = clean install exactly what package-lock.json says (reproducible builds).
    Invoke-Native 'Install packages (npm ci)' { npm ci --no-audit --no-fund }

    if (-not $SkipChecks) {
        Invoke-Native 'Lint (ESLint)' { npm run lint }
        Invoke-Native 'Type-check (tsc)' { npm run typecheck }
    }

    # Real environment variables win over .env.production values.
    $env:NEXT_PUBLIC_API_BASE_URL = $ApiBaseUrl
    $env:APP_VERSION = $InformationalVersion
    $env:NEXT_TELEMETRY_DISABLED = '1'
    Invoke-Native "Build Next.js (API: $ApiBaseUrl)" { npm run build }

    Write-Step "Assemble standalone app → $webOut"
    Reset-Directory $webOut
    Copy-Item -Path (Join-Path $frontend '.next/standalone/*') -Destination $webOut -Recurse -Force
    New-Item -ItemType Directory -Force (Join-Path $webOut '.next') | Out-Null
    Copy-Item -Path (Join-Path $frontend '.next/static') -Destination (Join-Path $webOut '.next/static') -Recurse -Force
    if (Test-Path (Join-Path $frontend 'public')) {
        Copy-Item -Path (Join-Path $frontend 'public') -Destination (Join-Path $webOut 'public') -Recurse -Force
    }
    # Local secrets must never ship.
    Get-ChildItem $webOut -Filter '.env*.local' -Force | Remove-Item -Force

    if (-not (Test-Path (Join-Path $webOut 'server.js'))) { throw 'server.js missing: is output: "standalone" set in next.config.ts?' }

    $size = (Get-ChildItem $webOut -Recurse -File -Force | Measure-Object Length -Sum).Sum / 1MB
    Write-Step ("Frontend artifact ready ({0}, {1:N1} MB)" -f $InformationalVersion, $size)
}
finally {
    Remove-Item Env:NEXT_PUBLIC_API_BASE_URL, Env:APP_VERSION -ErrorAction SilentlyContinue
    Pop-Location
}
