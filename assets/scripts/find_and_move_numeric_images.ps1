<#
find_and_move_numeric_images.ps1

Search the repository for numerically-named image files (e.g. 1.jpg, 12.png)
that are not located in `assets/images`, and optionally move them into
`assets/images` (backing up existing files if present).

Usage:
  # Dry-run: list matches but don't move
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\find_and_move_numeric_images.ps1 -WhatIf

  # Interactive move: will prompt before moving each file
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\find_and_move_numeric_images.ps1

  # Force move without prompting
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\find_and_move_numeric_images.ps1 -Force

Notes:
- This script only moves files within the current repository tree.
- If a target file (e.g. .\assets\images\1.jpg) already exists, the
  existing file will be backed up with a .bak-timestamp suffix before
  being overwritten.
- Run the earlier `recover_from_recyclebin.ps1` first if you suspect images
  are in the Recycle Bin.
#>
param(
  [switch]$WhatIf,
  [switch]$Force
)

$repoRoot = Get-Location
$assetsImages = Join-Path $repoRoot 'assets\images'
if (-not (Test-Path $assetsImages)) {
  Write-Host "Creating directory: $assetsImages" -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $assetsImages | Out-Null
}

Write-Host "Searching for numeric images under: $repoRoot (excluding $assetsImages)" -ForegroundColor Cyan
$numericMatches = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notlike ("$assetsImages*") -and ($_.Name -match '^[0-9]{1,3}\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$') } |
  Sort-Object Name

if (-not $numericMatches -or $numericMatches.Count -eq 0) {
  Write-Host "No numeric image files found outside $assetsImages" -ForegroundColor Yellow
  exit 0
}

Write-Host "Found $($numericMatches.Count) numeric image file(s):" -ForegroundColor Green
$numericMatches | ForEach-Object { Write-Host " - $($_.FullName)" }

if ($WhatIf) { Write-Host "WhatIf supplied; no files will be moved." -ForegroundColor Yellow; exit 0 }

foreach ($f in $numericMatches) {
  $target = Join-Path $assetsImages $f.Name
  if (Test-Path $target) {
    $ts = (Get-Date).ToString('yyyyMMddHHmmss')
    $bak = "$target.bak-$ts"
    Write-Host "Target exists: $target -> backing up to $bak" -ForegroundColor Yellow
    if (-not $Force) {
      $ans = Read-Host "Overwrite target and back it up? (y/N)"
      if ($ans -notin @('y','Y','yes','Yes')) { Write-Host 'Skipping' -ForegroundColor Yellow; continue }
    }
    Move-Item -Path $target -Destination $bak -Force
  }

  if (-not $Force) {
    $ans = Read-Host "Move $($f.FullName) -> $target ? (y/N)"
    if ($ans -notin @('y','Y','yes','Yes')) { Write-Host 'Skipping' -ForegroundColor Yellow; continue }
  }

  try {
    Move-Item -Path $f.FullName -Destination $target -Force
    Write-Host "Moved: $($f.FullName) -> $target" -ForegroundColor Green
  } catch {
    Write-Warning "Failed to move $($f.FullName): $_"
  }
}

Write-Host 'Done. Verify files in assets/images.' -ForegroundColor Cyan
