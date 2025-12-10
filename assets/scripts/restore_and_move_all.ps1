<#
restore_and_move_all.ps1

Combined script to:
  1) Find numeric images or .bak files in the Windows Recycle Bin and restore them.
  2) Search the repository for numerically-named images (e.g. 1.jpg) and move any
     that are outside `assets/images` into that folder, backing up existing targets.

Usage:
  # Dry-run (preview):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\restore_and_move_all.ps1 -WhatIf

  # Interactive (default): prompts before restoring and moving
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\restore_and_move_all.ps1

  # Fully automatic (no prompts):
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\restore_and_move_all.ps1 -Auto -Force

Notes:
- This script must be run locally (it interacts with the Windows Recycle Bin via COM).
- By default it is conservative and will prompt before destructive actions.
- Use `-Auto -Force` only when you are sure.
#>
param(
  [switch]$WhatIf,
  [switch]$Auto,
  [switch]$Force
)

function Get-RecycleBinItems {
  $shell = New-Object -ComObject Shell.Application
  $recycle = $shell.Namespace(0xA)
  if (-not $recycle) { Write-Error 'Cannot access Recycle Bin via Shell.Application'; return @{ shell=$shell; recycle=$recycle; items=@() } }

  $matches = @()
  foreach ($item in $recycle.Items()) {
    if (-not $item) { continue }
    $name = $item.Name -as [string]
    if (-not $name) { continue }

    if ($name -match '^[0-9]{1,3}\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$' -or $name -match '\.bak') {
      $origPath = ''
      try { $origPath = $recycle.GetDetailsOf($item, 1) } catch { $origPath = '' }
      $matches += [pscustomobject]@{
        Name = $name
        OriginalPath = $origPath
        COMItem = $item
      }
    }
  }
  return @{ shell = $shell; recycle = $recycle; items = $matches }
}

function Try-RestoreRecycleBinItems($found, $auto) {
  $restored = @()
  if (-not $found.items -or $found.items.Count -eq 0) {
    Write-Host 'No matching numeric images or .bak files found in Recycle Bin.' -ForegroundColor Yellow
    return $restored
  }

  Write-Host ("Found {0} candidate items in Recycle Bin:`n" -f $found.items.Count) -ForegroundColor Cyan
  $idx = 1
  foreach ($it in $found.items) {
    Write-Host ("[{0}] {1}  -> original path: {2}" -f $idx, $it.Name, $it.OriginalPath)
    $idx++
  }

  if ($WhatIf) { Write-Host 'WhatIf supplied - not restoring anything.' -ForegroundColor Yellow; return $restored }

  if (-not $auto) {
    $confirm = Read-Host ("Restore all {0} items? (y/N)" -f $found.items.Count)
    if ($confirm -notin @('y','Y','yes','Yes')) { Write-Host 'Aborting restore.' -ForegroundColor Yellow; return $restored }
  }

  foreach ($it in $found.items) {
    $com = $it.COMItem
    Write-Host ("Attempting restore: {0}" -f $it.Name) -ForegroundColor Green
    $did = $false
    try {
      $verbs = @()
      try { $verbs = $com.Verbs() | ForEach-Object { $_ } } catch { $verbs = @() }
      foreach ($v in $verbs) {
        $vname = ''
        try { $vname = $v.Name -as [string] } catch { $vname = '' }
        if ($vname -match '(restore|put back|putback|undelete)') {
          try { $v.DoIt(); $did = $true; break } catch { }
        }
      }
      if (-not $did) {
        try { $com.InvokeVerb('Restore'); $did = $true } catch { }
      }
    } catch {
      Write-Warning ("Restore attempt failed for {0}: {1}" -f $it.Name, $_)
    }
    if ($did) {
      Write-Host ("Restored: {0}" -f $it.Name) -ForegroundColor Cyan
      $restored += $it.Name
    } else {
      Write-Warning ("Could not restore: {0} - try manual restore via Recycle Bin UI" -f $it.Name)
    }
  }
  return $restored
}

function Move-NumericImagesIntoAssets($repoRoot, $auto, $force) {
  $assetsImages = Join-Path $repoRoot 'assets\images'
  if (-not (Test-Path $assetsImages)) { New-Item -ItemType Directory -Path $assetsImages | Out-Null }

  Write-Host "Searching for numeric images under: $repoRoot (excluding $assetsImages)" -ForegroundColor Cyan
  $numericMatches = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notlike ("$assetsImages*") -and ($_.Name -match '^[0-9]{1,3}\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$') } |
    Sort-Object Name

  if (-not $numericMatches -or $numericMatches.Count -eq 0) {
    Write-Host "No numeric image files found outside $assetsImages" -ForegroundColor Yellow
    return @()
  }

  Write-Host "Found $($numericMatches.Count) numeric image file(s):" -ForegroundColor Green
  $numericMatches | ForEach-Object { Write-Host " - $($_.FullName)" }

  if ($WhatIf) { Write-Host 'WhatIf supplied; not moving files.' -ForegroundColor Yellow; return $numericMatches }

  $moved = @()
  foreach ($f in $numericMatches) {
    $target = Join-Path $assetsImages $f.Name
    if (Test-Path $target) {
      $ts = (Get-Date).ToString('yyyyMMddHHmmss')
      $bak = "$target.bak-$ts"
      Write-Host "Target exists: $target -> backing up to $bak" -ForegroundColor Yellow
      if (-not $force -and -not $auto) {
        $ans = Read-Host "Overwrite target and back it up? (y/N)"
        if ($ans -notin @('y','Y','yes','Yes')) { Write-Host 'Skipping' -ForegroundColor Yellow; continue }
      }
      Move-Item -Path $target -Destination $bak -Force
    }

    if (-not $force -and -not $auto) {
      $ans = Read-Host "Move $($f.FullName) -> $target ? (y/N)"
      if ($ans -notin @('y','Y','yes','Yes')) { Write-Host 'Skipping' -ForegroundColor Yellow; continue }
    }

    try {
      Move-Item -Path $f.FullName -Destination $target -Force
      Write-Host ("Moved: {0} -> {1}" -f $f.FullName, $target) -ForegroundColor Green
      $moved += $target
    } catch {
      Write-Warning ("Failed to move {0}: {1}" -f $f.FullName, $_)
    }
  }
  return $moved
}

# ---- main ----
$repoRoot = Get-Location
Write-Host ("Starting restore-and-move (repo root: {0})" -f $repoRoot) -ForegroundColor Cyan

# 1) Restore from Recycle Bin
$found = Get-RecycleBinItems
$restoredNames = Try-RestoreRecycleBinItems $found ($Auto.IsPresent)

if ($WhatIf) { Write-Host 'WhatIf mode: skipping move step.' -ForegroundColor Yellow; exit 0 }

# Pause briefly to allow OS to finish restoring files to disk
Start-Sleep -Seconds 1

# 2) Move numeric images into assets/images
$moved = Move-NumericImagesIntoAssets $repoRoot ($Auto.IsPresent) ($Force.IsPresent)

# Summary
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host ("Restored items from Recycle Bin: {0}" -f $restoredNames.Count) -ForegroundColor Cyan
if ($restoredNames.Count -gt 0) { $restoredNames | ForEach-Object { Write-Host (" - {0}" -f $_) } }
Write-Host ("Moved numeric images into assets/images: {0}" -f $moved.Count) -ForegroundColor Cyan
if ($moved.Count -gt 0) { $moved | ForEach-Object { Write-Host (" - {0}" -f $_) } }

Write-Host 'Done. Run the check script to verify numeric coverage:' -ForegroundColor Green
Write-Host 'powershell -ExecutionPolicy Bypass -File .\assets\scripts\check_numeric_images.ps1' -ForegroundColor Yellow
