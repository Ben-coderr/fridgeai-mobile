<#
.SYNOPSIS
    PowerShell wrapper for scripts/git-work.sh
    Usage:  .\scripts\git-work.ps1
            .\scripts\git-work.ps1 "Add camera capture to home screen"
#>

param(
    [string]$Message = ""
)

# Try to locate bash.exe that ships with Git for Windows
$BASH = "C:\Users\local user\AppData\Local\Programs\Git\bin\bash.exe"

if (-not (Test-Path $BASH)) {
    $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    if ($gitCmd) {
        $BASH = Join-Path (Split-Path (Split-Path $gitCmd.Source)) "bin\bash.exe"
    }
}

if (-not (Test-Path $BASH)) {
    Write-Error "Cannot find Git bash. Make sure Git for Windows is installed."
    exit 1
}

# Convert Windows path to Unix-style for bash
$cwd = (Get-Location).Path -replace '\\', '/'

if ($Message) {
    & $BASH -c "cd '$cwd' && bash scripts/git-work.sh '$Message'"
} else {
    & $BASH -c "cd '$cwd' && bash scripts/git-work.sh"
}
