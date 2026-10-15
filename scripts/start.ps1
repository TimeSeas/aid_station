param([int]$Port = 8082)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
$phpCommand = Get-Command php -ErrorAction SilentlyContinue
if ($phpCommand) { $phpPath = $phpCommand.Source; $phpOptions = @() }
elseif (Test-Path '.runtime/php/php.exe') {
    $phpPath = Join-Path $projectRoot '.runtime/php/php.exe'
    $extensionPath = Join-Path $projectRoot '.runtime/php/ext'
    $phpOptions = @('-d', "extension_dir=$extensionPath", '-d', 'extension=pdo_sqlite', '-d', 'extension=fileinfo', '-d', 'extension=openssl')
} else { throw 'Please install PHP 8.2+ with pdo_sqlite, fileinfo and openssl, then retry.' }
& $phpPath @phpOptions php/init.php --seed
if ($LASTEXITCODE -ne 0) { throw 'Database initialization failed.' }
Write-Host "API listening at http://127.0.0.1:$Port"
& $phpPath @phpOptions -S "127.0.0.1:$Port" -t php php/router.php
