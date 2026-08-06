# ============================================================
# MD Ambiental - Environment Verifier v1.0
# Le config/paths.json (workspace compartilhado). Valida, para o
# ambiente escolhido:
#   - Pastas (projeto, OneDrive, HD externo, snapshots)
#   - Ferramentas instaladas (git, node, npm, supabase, pg_dump, pg_restore)
#   - Variavel de ambiente do banco (dbUrlEnvVar do ambiente)
#   - Repositorio Git, remote e branch
#   - Espaco livre em disco
#   - Data do ultimo backup (ZIP e dump)
#
# Uso:
#   .\scripts\verify-md-ambiental.ps1                    # Staging (default)
#   .\scripts\verify-md-ambiental.ps1 -Ambiente Producao
# ============================================================

param(
    [ValidateSet("Staging", "Producao")]
    [string]$Ambiente = "Staging"
)

$AmbienteKey = $Ambiente.ToLower()
$ScriptRoot  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot
$Workspace   = Split-Path -Parent $ProjectRoot
$ConfigPath  = Join-Path $Workspace "config\paths.json"

function Check {
    param([string]$Label, [bool]$Condition)
    if ($Condition) { Write-Host "[OK]    $Label" -ForegroundColor Green }
    else            { Write-Host "[FALHA] $Label" -ForegroundColor Red }
}

function Get-FreeSpaceGB {
    param([string]$Path)
    try {
        $q = (Split-Path -Qualifier $Path).TrimEnd(':')
        $d = Get-PSDrive -Name $q -ErrorAction Stop
        return [math]::Round($d.Free / 1GB, 2)
    } catch { return $null }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MD Ambiental | Environment Verifier v1.0 | Ambiente: $Ambiente" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Check "config/paths.json existe" (Test-Path $ConfigPath)
if (!(Test-Path $ConfigPath)) {
    Write-Host "[FALHA] Sem config/paths.json nao e possivel continuar." -ForegroundColor Red
    Write-Host "        Execute: .\scripts\init-md-ambiental-folders.ps1" -ForegroundColor Yellow
    exit 1
}

try {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    Check "config/paths.json e um JSON valido" $true
} catch {
    Check "config/paths.json e um JSON valido" $false
    exit 1
}

$AmbCfg = $Config.ambientes.$AmbienteKey
if (!$AmbCfg) {
    Write-Host "[FALHA] Ambiente '$AmbienteKey' nao encontrado em config/paths.json." -ForegroundColor Red
    exit 1
}

$NomeBackup      = "md-ambiental-$AmbienteKey"
$LocalProjectPath = Join-Path $Workspace $AmbCfg.pasta
$OneDriveDestino = Join-Path $Config.onedrive $NomeBackup
$ExternoDestino  = Join-Path $Config.external  $NomeBackup
$SnapshotDir     = Join-Path $Config.snapshots $NomeBackup
$GitRemote       = "https://github.com/$($Config.github.organization)/$($Config.github.repo).git"

if ($AmbienteKey -eq "producao") {
    Write-Host "[AVISO] Ambiente PRODUCAO - checkout local e projeto Vercel ainda nao confirmados." -ForegroundColor Yellow
    Write-Host "        Referencia Supabase: $($AmbCfg.supabaseRef) - NUNCA rode backup/restore aqui sem confirmacao explicita." -ForegroundColor Yellow
    Write-Host ""
}

# -- Pastas --------------------------------------------------------------------
Write-Host "[PASTAS]" -ForegroundColor Yellow
Check "Pasta do projeto ($Ambiente): $LocalProjectPath" (Test-Path $LocalProjectPath)
Check "Pasta OneDrive existe:        $OneDriveDestino"  (Test-Path $OneDriveDestino)
Check "Disco externo E: acessivel"                       (Test-Path "E:\")
Check "Pasta HD Externo existe:      $ExternoDestino"   (Test-Path $ExternoDestino)
Check "Pasta de snapshots:           $SnapshotDir"      (Test-Path $SnapshotDir)

# -- Ferramentas ---------------------------------------------------------------
Write-Host ""
Write-Host "[FERRAMENTAS]" -ForegroundColor Yellow
Check "Git instalado"                       ([bool](Get-Command git      -ErrorAction SilentlyContinue))
Check "Node instalado"                      ([bool](Get-Command node     -ErrorAction SilentlyContinue))
Check "npm instalado"                       ([bool](Get-Command npm      -ErrorAction SilentlyContinue))
Check "supabase CLI instalado (migrations)" ([bool](Get-Command supabase -ErrorAction SilentlyContinue))
Check "pg_dump instalado (backup de banco)" ([bool](Get-Command pg_dump  -ErrorAction SilentlyContinue))
Check "pg_restore instalado (restauracao)"  ([bool](Get-Command pg_restore -ErrorAction SilentlyContinue))

# -- Variaveis de ambiente -----------------------------------------------------
Write-Host ""
Write-Host "[VARIAVEIS DE AMBIENTE]" -ForegroundColor Yellow
$DbUrlValue = [System.Environment]::GetEnvironmentVariable($AmbCfg.dbUrlEnvVar)
Check "$($AmbCfg.dbUrlEnvVar) definida" (-not [string]::IsNullOrWhiteSpace($DbUrlValue))

if ([string]::IsNullOrWhiteSpace($DbUrlValue)) {
    Write-Host "  Para definir (PowerShell - NAO commitar no git):" -ForegroundColor DarkGray
    Write-Host "  [Environment]::SetEnvironmentVariable('$($AmbCfg.dbUrlEnvVar)', 'postgresql://postgres:SENHA@HOST:5432/postgres', 'User')" -ForegroundColor DarkGray
    Write-Host "  Pegue a connection string em: Supabase Dashboard -> $($AmbCfg.supabaseRef) -> Settings -> Database" -ForegroundColor DarkGray
}

# -- Espaco em disco -----------------------------------------------------------
Write-Host ""
Write-Host "[ESPACO EM DISCO]" -ForegroundColor Yellow
foreach ($p in @($LocalProjectPath, $OneDriveDestino, $ExternoDestino)) {
    if (Test-Path $p) {
        $free = Get-FreeSpaceGB -Path $p
        if ($null -ne $free) {
            $cor = if ($free -lt 2) { "Red" } elseif ($free -lt 5) { "DarkYellow" } else { "DarkGray" }
            Write-Host "  $p -> $free GB livres" -ForegroundColor $cor
        }
    }
}

# -- Git -----------------------------------------------------------------------
Write-Host ""
Write-Host "[GIT]" -ForegroundColor Yellow
if (Test-Path $LocalProjectPath) {
    Set-Location $LocalProjectPath
    Check "Repositorio Git inicializado" (Test-Path (Join-Path $LocalProjectPath ".git"))

    if (Test-Path (Join-Path $LocalProjectPath ".git")) {
        $remoteAtual = git remote get-url origin 2>$null
        $remoteOk = $remoteAtual -like "*github.com/$($Config.github.organization)/$($Config.github.repo)*"
        Check "Remote GitHub correto" $remoteOk
        Write-Host "  Remote atual:    $remoteAtual" -ForegroundColor DarkGray
        Write-Host "  Remote esperado: $GitRemote"   -ForegroundColor DarkGray
        Write-Host "  Branch atual:    $(git rev-parse --abbrev-ref HEAD 2>$null)" -ForegroundColor DarkGray

        Write-Host ""
        Write-Host "  Status:" -ForegroundColor Yellow
        git status --short
    }
}

# -- Ultimos backups -----------------------------------------------------------
Write-Host ""
Write-Host "[ULTIMOS BACKUPS - $Ambiente]" -ForegroundColor Yellow
if (Test-Path $SnapshotDir) {
    $LatestZip = Get-ChildItem -Path $SnapshotDir -Filter "${NomeBackup}_*.zip" -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $LatestDump = Get-ChildItem -Path $SnapshotDir -Filter "${NomeBackup}_db_*.dump" -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if ($LatestZip) {
        $h   = [math]::Round(((Get-Date) - $LatestZip.LastWriteTime).TotalHours, 1)
        $cor = if ($h -gt 168) { "Red" } elseif ($h -gt 48) { "DarkYellow" } else { "Green" }
        Write-Host "  Snapshot ZIP mais recente: $($LatestZip.Name) ($h h atras)" -ForegroundColor $cor
    } else {
        Write-Host "  [FALHA] Nenhum snapshot ZIP encontrado ainda." -ForegroundColor Red
    }

    if ($LatestDump) {
        $h    = [math]::Round(((Get-Date) - $LatestDump.LastWriteTime).TotalHours, 1)
        $size = [math]::Round($LatestDump.Length / 1KB, 1)
        $cor  = if ($h -gt 168) { "Red" } elseif ($h -gt 48) { "DarkYellow" } else { "Green" }
        Write-Host "  Dump de banco mais recente: $($LatestDump.Name) ($h h atras, $size KB)" -ForegroundColor $cor
    } else {
        Write-Host "  [FALHA] Nenhum dump de banco encontrado ainda." -ForegroundColor Red
    }
} else {
    Write-Host "  [FALHA] Pasta de snapshots nao existe ainda." -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificacao concluida. $(Get-Date -f 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""
