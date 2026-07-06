param(
  [string]$Message = "snapshot $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

$root = Split-Path -Parent $PSScriptRoot
$snapshotDir = Join-Path $root "snapshots"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $snapshotDir $timestamp

Write-Host "Creating snapshot: $timestamp" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$include = @(
  "src\**\*",
  "public\**\*",
  "*.json",
  "*.ts",
  "*.mjs",
  "*.css",
  ".env*",
  ".editorconfig",
  ".prettierrc",
  ".gitignore",
  "docs\**\*",
  "scripts\**\*",
  ".vscode\**\*"
)

$exclude = @(
  "node_modules",
  ".next",
  "snapshots"
)

foreach ($pattern in $include) {
  $files = Get-ChildItem -Path $root -Filter $pattern -Recurse -ErrorAction SilentlyContinue
  foreach ($file in $files) {
    $relative = [System.IO.Path]::GetRelativePath($root, $file.FullName)
    $skip = $false
    foreach ($ex in $exclude) {
      if ($relative -like "$ex*") {
        $skip = $true
        break
      }
    }
    if (-not $skip) {
      $dest = Join-Path $backupDir $relative
      $parent = Split-Path -Parent $dest
      if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
      }
      Copy-Item -Path $file.FullName -Destination $dest -Force
    }
  }
}

# also copy root-level config files
Get-ChildItem -Path $root -Filter "*.json" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $backupDir $_.Name
  Copy-Item -Path $_.FullName -Destination $dest -Force
}
Get-ChildItem -Path $root -Filter ".env*" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $backupDir $_.Name
  Copy-Item -Path $_.FullName -Destination $dest -Force
}

Write-Host "Snapshot saved: $backupDir" -ForegroundColor Green
Write-Host "Files: $( (Get-ChildItem -Recurse -File $backupDir).Count )" -ForegroundColor Green
