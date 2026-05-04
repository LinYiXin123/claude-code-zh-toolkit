$ErrorActionPreference = "Stop"

param(
    [Parameter(Mandatory = $true)]
    [string]$PortableRoot,

    [string]$CodexHome = "$HOME\.codex"
)

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$desktopDir = Join-Path $projectRoot "desktop"
$skillsDir = Join-Path $projectRoot "skills"

$portableRootResolved = (Resolve-Path -LiteralPath $PortableRoot).Path
$ionDist = Join-Path $portableRootResolved "resources\ion-dist"
$indexHtml = Join-Path $ionDist "index.html"
$patchJsTarget = Join-Path $ionDist "skill-display-patch.js"
$mapJsonTarget = Join-Path $ionDist "skill-display-map.json"

if (-not (Test-Path -LiteralPath $ionDist)) {
    throw "未找到 ion-dist 目录：$ionDist"
}

$toolTargetDir = Join-Path $CodexHome "tools\skill-chinese"
Ensure-Dir $toolTargetDir
Ensure-Dir (Join-Path $toolTargetDir "logs")

Copy-Item (Join-Path $desktopDir "skill-display-patch.js") $patchJsTarget -Force
Copy-Item (Join-Path $skillsDir "sync_skill_chinese.py") (Join-Path $toolTargetDir "sync_skill_chinese.py") -Force

foreach ($file in @("skill_chinese_overrides.json", "skill_chinese_state.json", "skill_display_map.json")) {
    $source = Join-Path $skillsDir $file
    if (Test-Path -LiteralPath $source) {
        Copy-Item $source (Join-Path $toolTargetDir $file) -Force
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $toolTargetDir "skill_chinese_overrides.json"))) {
    '{}' | Set-Content -LiteralPath (Join-Path $toolTargetDir "skill_chinese_overrides.json") -Encoding UTF8
}

if (-not (Test-Path -LiteralPath (Join-Path $toolTargetDir "skill_chinese_state.json"))) {
    '{"skills":{},"plugins":{},"translations":{}}' | Set-Content -LiteralPath (Join-Path $toolTargetDir "skill_chinese_state.json") -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $mapJsonTarget)) {
    "{`"generatedAt`":0,`"replacements`":{}}" | Set-Content -LiteralPath $mapJsonTarget -Encoding UTF8
}

$html = Get-Content -LiteralPath $indexHtml -Raw -Encoding UTF8
if ($html -notmatch 'skill-display-patch\.js') {
    $needle = '<script type="module" crossorigin src="/assets/v1/'
    $insert = '<script src="./skill-display-patch.js"></script>'
    $index = $html.IndexOf($needle)
    if ($index -lt 0) {
        throw "未找到前端模块脚本注入点：$indexHtml"
    }
    $html = $html.Insert($index, $insert)
    Set-Content -LiteralPath $indexHtml -Value $html -Encoding UTF8
}

$pythonw = (Get-Command pythonw.exe -ErrorAction Stop).Source
$python = (Get-Command python.exe -ErrorAction Stop).Source
$syncScript = Join-Path $toolTargetDir "sync_skill_chinese.py"
$startupDir = [Environment]::GetFolderPath("Startup")
$startupVbs = Join-Path $startupDir "CodexSkillChineseWatcher.vbs"

$vbs = @"
Set shell = CreateObject("WScript.Shell")
shell.Environment("PROCESS")("CLAUDE_ZH_ION_DIST") = "$ionDist"
shell.Run """" & "$pythonw" & """ """ & "$syncScript" & """ --watch", 0, False
"@
Set-Content -LiteralPath $startupVbs -Value $vbs -Encoding ASCII

$env:CLAUDE_ZH_ION_DIST = $ionDist
& $python $syncScript --once

Start-Process -WindowStyle Hidden -FilePath $pythonw -ArgumentList @($syncScript, "--watch") -WorkingDirectory $toolTargetDir

Write-Output "安装完成。"
Write-Output "便携版目录：$portableRootResolved"
Write-Output "技能中文同步目录：$toolTargetDir"
Write-Output "开机自启脚本：$startupVbs"
