# Public demo tunnel with automatic reconnect.
# Usage:  npm run tunnel        (or  powershell -ExecutionPolicy Bypass -File scripts\tunnel.ps1)
# Keep `npm run dev -- -p 3001` running in another window.
param(
    [int]$Port = 3001,
    [string]$Subdomain = ""
)

$ErrorActionPreference = "Continue"

$ssh = Join-Path $env:SystemRoot "System32\OpenSSH\ssh.exe"
if (-not (Test-Path $ssh)) {
    Write-Host "OpenSSH client not found: $ssh" -ForegroundColor Red
    exit 1
}

$tempDir = Join-Path $PSScriptRoot "..\temp"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$urlFile = Join-Path $tempDir "tunnel-url.txt"
$logFile = Join-Path $tempDir "tunnel.log"

$forward = if ($Subdomain) { "${Subdomain}:80:localhost:$Port" } else { "80:localhost:$Port" }

Write-Host "Tunnel for http://localhost:$Port -> serveo.net (Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host "Current public URL is written to temp\tunnel-url.txt" -ForegroundColor DarkGray

while ($true) {
    Add-Content -Path $logFile -Value "--- $(Get-Date -Format s) connecting ---"

    & $ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R $forward serveo.net 2>&1 |
        ForEach-Object {
            Add-Content -Path $logFile -Value $_
            if ($_ -match 'https://[^\s]+') {
                $url = $matches[0]
                Set-Content -Path $urlFile -Value $url -Encoding ascii
                Write-Host ""
                Write-Host "PUBLIC URL: $url" -ForegroundColor Green
                Write-Host ""
            }
        }

    Write-Host "Tunnel closed, reconnecting in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
