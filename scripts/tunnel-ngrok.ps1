# Public demo tunnel through ngrok with a permanent static domain.
#
# One-time setup (5 minutes):
#   1. Sign up at https://dashboard.ngrok.com
#   2. Copy your authtoken and run:  .\tools\ngrok.exe config add-authtoken <TOKEN>
#   3. Copy your static domain (Domains page) into .env.local:
#        NGROK_DOMAIN="your-name.ngrok-free.app"
#
# Usage:  npm run tunnel:ngrok
param(
    [int]$Port = 3001,
    [string]$Domain = ""
)

$ErrorActionPreference = "Continue"

$ngrok = Join-Path $PSScriptRoot "..\tools\ngrok.exe"
if (-not (Test-Path $ngrok)) {
    Write-Host "ngrok.exe not found in tools\. Download:" -ForegroundColor Red
    Write-Host "  https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
    exit 1
}

# Домен можно передать параметром или хранить в .env.local.
if (-not $Domain) {
    $envFile = Join-Path $PSScriptRoot "..\.env.local"
    if (Test-Path $envFile) {
        $line = Get-Content $envFile | Where-Object { $_ -match '^\s*NGROK_DOMAIN\s*=' } | Select-Object -First 1
        if ($line) { $Domain = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'") }
    }
}

if (-not $Domain) {
    Write-Host "Static domain is not configured." -ForegroundColor Red
    Write-Host "Add NGROK_DOMAIN to .env.local, e.g.: NGROK_DOMAIN=avtoway.ngrok-free.app"
    exit 1
}

$tempDir = Join-Path $PSScriptRoot "..\temp"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$urlFile = Join-Path $tempDir "tunnel-url.txt"
$logFile = Join-Path $tempDir "tunnel-ngrok.log"

Write-Host "Tunnel for http://localhost:$Port -> https://$Domain (Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host "Current public URL is written to temp\tunnel-url.txt" -ForegroundColor DarkGray

while ($true) {
    Add-Content -Path $logFile -Value "--- $(Get-Date -Format s) connecting ---"

    & $ngrok http $Port --url "https://$Domain" --log stdout --log-format logfmt 2>&1 |
        ForEach-Object {
            Add-Content -Path $logFile -Value $_
            if ($_ -match 'url=https://(\S+)') {
                $url = "https://$($matches[1])"
                if ($url -notmatch 'ngrok\.com/api|\.ngrok\.io') {
                    Set-Content -Path $urlFile -Value $url -Encoding ascii
                    Write-Host ""
                    Write-Host "PUBLIC URL: $url" -ForegroundColor Green
                    Write-Host ""
                }
            }
        }

    Write-Host "Tunnel closed, reconnecting in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
