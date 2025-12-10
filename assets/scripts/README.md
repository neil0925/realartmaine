Scripts in this folder help locate and recover numeric gallery images (1..N).

Files:
- recover_from_recyclebin.ps1  : attempts to list and restore numeric images or .bak files from the Windows Recycle Bin.
- find_and_move_numeric_images.ps1 : searches the repo for numeric images outside `assets/images` and offers to move them into `assets/images`.
- check_numeric_images.ps1 : (existing) checks numeric image coverage against `IMAGE_LABELS` count.

- restore_and_move_all.ps1 : combined helper that restores numeric images/.bak from the Recycle Bin and then moves any numeric images found into `assets/images`. Supports `-WhatIf`, `-Auto`, and `-Force` modes.

Usage examples (PowerShell, from repo root):

# Preview recycle-bin matches
powershell -ExecutionPolicy Bypass -File .\assets\scripts\recover_from_recyclebin.ps1 -WhatIf

# Restore from recycle bin (interactive)
powershell -ExecutionPolicy Bypass -File .\assets\scripts\recover_from_recyclebin.ps1

# Find numeric files in repo and move them into assets/images (interactive)
powershell -ExecutionPolicy Bypass -File .\assets\scripts\find_and_move_numeric_images.ps1

# Force move without prompts
powershell -ExecutionPolicy Bypass -File .\assets\scripts\find_and_move_numeric_images.ps1 -Force

# Check numeric coverage
powershell -ExecutionPolicy Bypass -File .\assets\scripts\check_numeric_images.ps1

Notes:
- Run `recover_from_recyclebin.ps1` first if you think images were deleted recently.
- These scripts operate on your local filesystem. Run them locally (not in a restricted remote environment).
- The scripts try to be conservative and back up any files they would overwrite.
