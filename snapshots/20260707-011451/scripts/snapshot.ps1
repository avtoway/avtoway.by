param(
  [string]$Message = "snapshot $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$root = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "$root\snapshots\$timestamp"

Write-Host "Creating snapshot: $timestamp" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$excludeDirs = @("node_modules", ".next", "snapshots", ".git")

# Copy specific dirs recursively, excluding unwanted
function Copy-Dir {
  param($Source, $Dest)
  if (-not (Test-Path $Source)) { return }
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  foreach ($item in Get-ChildItem -Path $Source -Force) {
    $skip = $false
    foreach ($ex in $excludeDirs) {
      if ($item.Name -eq $ex) { $skip = $true; break }
    }
    if ($skip) { continue }
    $d = "$Dest\$($item.Name)"
    if ($item.PSIsContainer) {
      Copy-Dir -Source $item.FullName -Dest $d
    } else {
      Copy-Item -Path $item.FullName -Destination $d -Force -ErrorAction SilentlyContinue
    }
  }
}

# Copy key directories
Copy-Dir -Source "$root\src" -Dest "$backupDir\src"
Copy-Dir -Source "$root\docs" -Dest "$backupDir\docs"
Copy-Dir -Source "$root\scripts" -Dest "$backupDir\scripts"
Copy-Dir -Source "$root\public" -Dest "$backupDir\public"
Copy-Dir -Source "$root\.vscode" -Dest "$backupDir\.vscode"

# Copy root config files
foreach ($file in Get-ChildItem -Path $root -Force) {
  if (-not $file.PSIsContainer) {
    Copy-Item -Path $file.FullName -Destination "$backupDir\$($file.Name)" -Force -ErrorAction SilentlyContinue
  }
}

$count = (Get-ChildItem -Recurse -File $backupDir).Count
Write-Host "Snapshot saved: $backupDir ($count files)" -ForegroundColor Green
