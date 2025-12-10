<#
recover_from_recyclebin.ps1

Safely list and optionally restore matching image/backups from the Windows Recycle Bin.

Usage:
  # preview matches (no restore)
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\recover_from_recyclebin.ps1 -WhatIf

  # restore found matches (use with care)
  powershell -ExecutionPolicy Bypass -File .\assets\scripts\recover_from_recyclebin.ps1

This script attempts to find items in the Recycle Bin whose filenames look like:
  - numeric images: 1.jpg, 12.png, 126.JPG
  - backup files: *.bak or *.bak*

It prints matches and, unless `-WhatIf` is provided, will attempt to invoke the "Restore" verb on each item.

Note: Invoke/DoIt may be localized on non-English Windows. The script attempts to match common verb names but may still require manual restore via the Recycle Bin UI for some systems.
#>
param(
  [switch]$WhatIf
)

function Get-RecycleBinItems {
  $shell = New-Object -ComObject Shell.Application
  $recycle = $shell.Namespace(0xA)
  if (-not $recycle) { Write-Error 'Cannot access Recycle Bin via Shell.Application'; return @() }

  $matches = @()
  for ($i = 0; $i -lt $recycle.Items().Count; $i++) {
    $item = $recycle.Items().Item($i)
    if (-not $item) { continue }
    $name = $item.Name -as [string]
    if (-not $name) { continue }

    # numeric image names, e.g. 1.jpg, 12.JPG, 126.png
    if ($name -match '^[0-9]{1,3}\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$') {
      $matches += $item
      continue
    }
    # backup patterns (ends with .bak or contains .bak)
    if ($name -match '\.bak' -or $name -match '\.bak-') {
      $matches += $item
      continue
    }
  }
  return $matches
}

$found = Get-RecycleBinItems
if (-not $found -or $found.Count -eq 0) {
  Write-Host 'No matching numeric images or .bak files found in Recycle Bin.' -ForegroundColor Yellow
  exit 0
}

Write-Host "Found $($found.Count) candidate items in Recycle Bin:`n" -ForegroundColor Cyan
$idx = 1
$found | ForEach-Object {
  $it = $_
  $path = ''
  try { $path = $recycle.GetDetailsOf($it, 1) } catch { $path = '' }
  Write-Host "[$idx] $($it.Name)  -> original path: $path"
  $idx++
}

if ($WhatIf) {
  Write-Host "WhatIf supplied — not restoring anything. Run without -WhatIf to restore." -ForegroundColor Green
  exit 0
}

$confirm = Read-Host "Restore all $($found.Count) items? (y/N)"
if ($confirm -notin @('y','Y','yes','Yes')) {
  Write-Host 'Aborting restore.' -ForegroundColor Yellow
  exit 0
}

# Attempt to restore each item by invoking a verb with 'restore' or 'put back' in its name
foreach ($it in $found) {
  Write-Host "Restoring: $($it.Name)" -ForegroundColor Green
  $restored = $false
  try {
    $verbs = $it.Verbs() | ForEach-Object { $_ }  # COM verbs collection
    foreach ($v in $verbs) {
      $vname = ''
      try { $vname = $v.Name -as [string] } catch { $vname = '' }
      if ($vname -match '(restore|put back|putback|undelete)') {
        try { $v.DoIt(); $restored = $true; break } catch { }
      }
    }
    if (-not $restored) {
      try { $it.InvokeVerb('Restore'); $restored = $true } catch { }
    }
  } catch {
    Write-Warning "Restore attempt failed for $($it.Name): $_"
  }
  if ($restored) { Write-Host "Restored: $($it.Name)" -ForegroundColor Cyan } else { Write-Warning "Could not restore: $($it.Name) — try manual restore via Recycle Bin UI" }
}

Write-Host 'Done. Verify restored files in their original locations or in the project `assets/images` folder.' -ForegroundColor Green
