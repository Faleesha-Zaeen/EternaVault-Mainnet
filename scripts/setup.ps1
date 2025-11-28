# PowerShell setup script for Windows users
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
# repo root is parent of the scripts folder
$root = Resolve-Path (Join-Path $scriptDir "..")
Push-Location $root

Write-Output "[setup.ps1] Installing frontend deps if missing..."
if (-not (Test-Path -Path "frontend\node_modules")) {
    Write-Output "Installing frontend..."
    Push-Location frontend
    npm install
    Pop-Location
}

Write-Output "[setup.ps1] Installing backend deps if missing..."
if (-not (Test-Path -Path "backend\node_modules")) {
    Write-Output "Installing backend..."
    Push-Location backend
    npm install
    Pop-Location
}

Write-Output "[setup.ps1] Installing contracts deps if missing..."
if (-not (Test-Path -Path "contracts\node_modules")) {
    Write-Output "Installing contracts..."
    Push-Location contracts
    npm install
    Pop-Location
}

Write-Output "[setup.ps1] Compiling contracts..."
Push-Location contracts
try {
    npx hardhat compile
} catch {
    Write-Warning "Hardhat compile failed (check env), continuing..."
}
Pop-Location

Write-Output "[setup.ps1] Building frontend..."
Push-Location frontend
try {
    npm run build
} catch {
    Write-Warning "Frontend build failed, you can run again after fixing issues."
}
Pop-Location

Write-Output "[setup.ps1] Done. To run dev servers: npm run dev"
Pop-Location
