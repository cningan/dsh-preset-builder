[CmdletBinding()]
param(
  [int]$Port = 0,
  [switch]$Keep,
  [switch]$Screenshots
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bundle = Join-Path $root 'bundle'
$temp = Join-Path $root '.tmp-ui-smoke'
$dshHome = Join-Path $temp 'home'
$profileDir = Join-Path $dshHome 'profiles\verify'
$oldHome = $env:DSH_HOME
$server = $null
$oldUrl = $env:UI_SMOKE_URL
$oldOut = $env:UI_SMOKE_OUT

function Get-FreePort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $listener.Start()
  try {
    return ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
  } finally {
    $listener.Stop()
  }
}

try {
  if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) { throw 'dsh is not on PATH.' }
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw 'pnpm is not on PATH.' }
  if (-not (Get-Command ego-browser -ErrorAction SilentlyContinue)) { throw 'ego-browser is not on PATH.' }

  if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
  New-Item -ItemType Directory -Force $profileDir | Out-Null

  $bundleLink = $bundle.Replace('\', '/')
  $profile = [ordered]@{
    name = 'dsh-profile-verify'
    private = $true
    dependencies = [ordered]@{ 'dsh-preset-builder' = "link:$bundleLink" }
    dsh = [ordered]@{
      profile = [ordered]@{
        bundles = @('@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app', 'dsh-preset-builder')
      }
    }
  }
  $profile | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $profileDir 'package.json') -Encoding utf8

  $env:DSH_HOME = $dshHome
  Write-Host 'Installing the temporary profile...'
  Push-Location $profileDir
  try {
    & pnpm install --ignore-scripts 2>&1 | Select-Object -Last 4 | Out-Host
  } finally {
    Pop-Location
  }

  if ($Port -le 0) { $Port = Get-FreePort }
  $stdout = Join-Path $temp 'dsh.out.log'
  $stderr = Join-Path $temp 'dsh.err.log'
  $dsh = (Get-Command dsh -ErrorAction Stop).Source
  $pwsh = (Get-Process -Id $PID).Path
  $dshArgs = @('-NoProfile', '-File', $dsh, '--profile', 'verify', '--host', '127.0.0.1', '--port', "$Port", '--no-open')
  $server = Start-Process -FilePath $pwsh -ArgumentList $dshArgs -PassThru `
    -RedirectStandardOutput $stdout -RedirectStandardError $stderr -WindowStyle Hidden

  Write-Host "Starting isolated DSH on port $Port..."
  $url = $null
  for ($i = 0; $i -lt 160; $i += 1) {
    if ($server.HasExited) {
      $tail = ''
      if (Test-Path $stderr) { $tail = (Get-Content $stderr -Raw -ErrorAction SilentlyContinue) }
      throw "dsh exited before becoming ready. $tail"
    }
    $text = ''
    if (Test-Path $stdout) { $text += (Get-Content $stdout -Raw -ErrorAction SilentlyContinue) }
    if (Test-Path $stderr) { $text += (Get-Content $stderr -Raw -ErrorAction SilentlyContinue) }
    $match = [regex]::Match($text, 'http://127\.0\.0\.1:\d+/\?token=\S+')
    if ($match.Success) {
      $url = $match.Value.Trim()
      break
    }
    Start-Sleep -Milliseconds 250
  }
  if (-not $url) { throw "dsh did not print a URL within 40s. See $stdout and $stderr." }

  $env:UI_SMOKE_URL = $url
  if ($Screenshots) {
    $env:UI_SMOKE_OUT = Join-Path $temp 'screenshots'
    New-Item -ItemType Directory -Force $env:UI_SMOKE_OUT | Out-Null
  } else {
    Remove-Item Env:UI_SMOKE_OUT -ErrorAction SilentlyContinue
  }

  $ego = (Get-Command ego-browser -ErrorAction Stop).Source
  $uiScript = Join-Path $root 'test\ui-smoke.mjs'
  $uiConfig = [ordered]@{ url = $url }
  if ($Screenshots) { $uiConfig.outDir = $env:UI_SMOKE_OUT }
  $preamble = 'globalThis.__UI_SMOKE_CONFIG__ = ' + ($uiConfig | ConvertTo-Json -Compress)
  $source = $preamble + "`n" + (Get-Content $uiScript -Raw)
  Push-Location $root
  try {
    $source | & $ego nodejs
    $code = $LASTEXITCODE
  } finally {
    Pop-Location
  }
  if ($code -ne 0) { throw "UI smoke failed (exit $code). Re-run with -Keep for logs." }
  Write-Host "UI smoke passed on port $Port."
  if ($Screenshots) {
    Write-Host "Screenshots: $env:UI_SMOKE_OUT"
    $missing = @('compare.png', 'simple.png') | Where-Object { -not (Test-Path (Join-Path $env:UI_SMOKE_OUT $_)) }
    if ($missing.Count -gt 0) {
      Write-Host ('Warning: screenshot(s) missing: ' + ($missing -join ', ') + '. Restore the ego window (not minimized) and retry.') -ForegroundColor Yellow
    }
  }
} catch {
  Write-Host ('UI smoke error: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'If ego-browser could not connect, run this from a full-access shell (see test/ui-smoke.md).' -ForegroundColor Yellow
  throw
} finally {
  if ($server -ne $null -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  }
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($_.OwningProcess)" -ErrorAction SilentlyContinue
    if ($owner -ne $null -and $owner.CommandLine -like "*--port $Port*") {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
  }
  if ($oldHome -eq $null) { Remove-Item Env:DSH_HOME -ErrorAction SilentlyContinue } else { $env:DSH_HOME = $oldHome }
  if ($oldUrl -eq $null) { Remove-Item Env:UI_SMOKE_URL -ErrorAction SilentlyContinue } else { $env:UI_SMOKE_URL = $oldUrl }
  if ($oldOut -eq $null) { Remove-Item Env:UI_SMOKE_OUT -ErrorAction SilentlyContinue } else { $env:UI_SMOKE_OUT = $oldOut }
  if (-not $Keep -and (Test-Path $temp)) { Remove-Item -Recurse -Force $temp }
  elseif ($Keep -and (Test-Path $temp)) { Write-Host "Kept test artifacts in $temp." }
}
