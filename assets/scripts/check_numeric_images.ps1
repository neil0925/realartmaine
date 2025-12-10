<#
check_numeric_images.ps1

Checks numeric image coverage based on `IMAGE_LABELS` entries in `assets/js/gallery.js`.
Prints expected count, found numeric files in `assets/images`, and any missing indices.

Usage:
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\check_numeric_images.ps1
#>

$galleryPath = Join-Path (Get-Location) 'assets\js\gallery.js'
if (-not (Test-Path $galleryPath)) { Write-Error "Missing $galleryPath"; exit 2 }

$text = Get-Content -Path $galleryPath -Raw -ErrorAction Stop
# find IMAGE_LABELS[<n>] assignments
$matches = [regex]::Matches($text, 'IMAGE_LABELS\[(\d+)\]\s*=') | ForEach-Object { [int]$_.Groups[1].Value }
if (-not $matches -or $matches.Count -eq 0) {
  Write-Host 'No IMAGE_LABELS assignments found in gallery.js' -ForegroundColor Yellow
  exit 0
}
$maxIndex = ($matches | Measure-Object -Maximum).Maximum
Write-Host "Expected numeric images (based on IMAGE_LABELS): $maxIndex" -ForegroundColor Cyan

# list numeric files present in assets/images
$imagesDir = Join-Path (Get-Location) 'assets\images'
if (-not (Test-Path $imagesDir)) {
  Write-Host "Directory not found: $imagesDir" -ForegroundColor Yellow
  exit 1
}

$found = Get-ChildItem -Path $imagesDir -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^(\d{1,3})\.(jpg|jpeg|png|gif)$' } |
  ForEach-Object { [int]([regex]::Match($_.Name,'^(\d{1,3})').Groups[1].Value) } |
  Sort-Object -Unique

$foundCount = ($found | Measure-Object).Count
Write-Host "Numeric files found in assets/images: $foundCount" -ForegroundColor Cyan

# show missing indices
$missing = @()
for ($i = 1; $i -le $maxIndex; $i++) {
  if ($found -notcontains $i) { $missing += $i }
}
if ($missing.Count -eq 0) {
  Write-Host 'No missing indices — all numeric images present.' -ForegroundColor Green
  exit 0
} else {
  Write-Host "Missing indices (total $($missing.Count)): " -ForegroundColor Yellow
  $missing -join ', ' | Write-Host
  exit 0
}
