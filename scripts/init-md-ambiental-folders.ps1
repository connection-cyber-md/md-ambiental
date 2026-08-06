# ============================================================
# MD Ambiental - Init Folders v1.0
# Cria a estrutura compartilhada do workspace (C:\Projetos\md):
#   config, docs, espelhos OneDrive/HD externo, snapshots e logs
#   por ambiente (staging / producao).
#
# Le C:\Projetos\md\config\paths.json (compartilhado entre os dois
# ambientes, que vivem em pastas irmas: cyber-mp-staging e cyber-mp).
# Usa defaults se o arquivo ainda nao existir.
#
# Uso:
#   .\scripts\init-md-ambiental-folders.ps1
# ============================================================

$ScriptRoot  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot            # cyber-mp-staging (ou cyber-mp)
$Workspace   = Split-Path -Parent $ProjectRoot            # C:\Projetos\md
$ConfigPath  = Join-Path $Workspace "config\paths.json"

# -- Caminhos default (caso config/paths.json nao exista) ----------------------
$DefaultOneDrive  = "C:\Users\joaqu\OneDrive\Projetos"
$DefaultExternal  = "E:\Projetos"
$DefaultSnapshots = "E:\Projetos\Snapshots"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MD Ambiental | Init Folders v1.0" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    Write-Host "[CONFIG] Usando config existente: $ConfigPath" -ForegroundColor DarkGray
} else {
    Write-Host "[CONFIG] Gerando config/paths.json com defaults..." -ForegroundColor Yellow
    $Config = [PSCustomObject]@{
        workspace = $Workspace
        onedrive  = $DefaultOneDrive
        external  = $DefaultExternal
        snapshots = $DefaultSnapshots
        github    = @{ organization = "connection-cyber-md"; repo = "md-ambiental"; defaultBranch = "master" }
        excludedDirectories = @("node_modules", ".next", ".git", "dist", ".turbo")
        logTypes  = @("backup", "restore", "git", "database", "health")
        ambientes = @{
            staging = @{
                pasta         = "cyber-mp-staging"
                supabaseRef   = "oxsezxgzfiocpatiezhj"
                dbUrlEnvVar   = "MD_AMBIENTAL_STAGING_DB_URL"
                vercelProject = "md-ambiental"
            }
            producao = @{
                pasta         = "cyber-mp"
                supabaseRef   = "dvrajadmqcixaccqpmnh"
                dbUrlEnvVar   = "MD_AMBIENTAL_PROD_DB_URL"
                vercelProject = "(a definir - producao ainda nao tem checkout/projeto Vercel proprios)"
            }
        }
    }
    if (!(Test-Path (Split-Path -Parent $ConfigPath))) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $ConfigPath) -Force | Out-Null
    }
    $Config | ConvertTo-Json -Depth 6 | Set-Content $ConfigPath -Encoding UTF8
    Write-Host "[CRIADO] $ConfigPath" -ForegroundColor Green
}

function New-Dir {
    param([string]$Path, [string]$Label)
    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "[CRIADO] $Label" -ForegroundColor Green
        Write-Host "         $Path" -ForegroundColor DarkGray
    } else {
        Write-Host "[EXISTE] $Label" -ForegroundColor DarkGray
    }
}

# -- Docs compartilhados (nivel workspace, nao por ambiente) -------------------
Write-Host ""
Write-Host "[DOCS]" -ForegroundColor Cyan
$Docs = @("blueprint", "devops", "github", "backup", "security", "database", "infrastructure", "architecture-decisions")
foreach ($sub in $Docs) {
    New-Dir (Join-Path $Workspace "docs\$sub") "docs\$sub"
}

# -- Por ambiente: espelhos, snapshots, logs ------------------------------------
foreach ($amb in @("staging", "producao")) {
    $ambCfg = $Config.ambientes.$amb
    $NomeBackup = "md-ambiental-$amb"

    Write-Host ""
    Write-Host "[AMBIENTE: $amb]" -ForegroundColor Yellow
    Write-Host "  pasta local esperada: $(Join-Path $Workspace $ambCfg.pasta)" -ForegroundColor DarkGray

    New-Dir (Join-Path $Config.onedrive $NomeBackup) "OneDrive ($amb)"
    if (Test-Path "E:\") {
        New-Dir (Join-Path $Config.external  $NomeBackup) "HD Externo ($amb)"
        New-Dir (Join-Path $Config.snapshots $NomeBackup) "Snapshots ZIP ($amb)"
    } else {
        Write-Host "  [AVISO] HD externo (E:) nao encontrado. Pastas de HD/snapshot puladas." -ForegroundColor Yellow
    }

    $LocalProjectPath = Join-Path $Workspace $ambCfg.pasta
    if (Test-Path $LocalProjectPath) {
        $Year  = (Get-Date).Year.ToString()
        $Month = (Get-Date).ToString("MM")
        foreach ($t in $Config.logTypes) {
            New-Dir (Join-Path $LocalProjectPath "logs\$Year\$Month\$t") "logs\$Year\$Month\$t ($amb)"
        }
        New-Dir (Join-Path $LocalProjectPath "scripts") "scripts ($amb)"
    } else {
        Write-Host "  [AVISO] Pasta local do ambiente '$amb' nao existe ainda ($LocalProjectPath) - logs pulados." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Estrutura criada/validada com sucesso!" -ForegroundColor Green
Write-Host "  Proximos passos:" -ForegroundColor White
Write-Host "    1. Defina MD_AMBIENTAL_STAGING_DB_URL (variavel de ambiente do Windows)" -ForegroundColor White
Write-Host "    2. Execute verify-md-ambiental.ps1 -Ambiente Staging" -ForegroundColor White
Write-Host "    3. Execute backup-md-ambiental.ps1 -Ambiente Staging para o primeiro backup" -ForegroundColor White
Write-Host "    4. Producao (cyber-mp) so entra em uso quando a pasta e o projeto Vercel existirem" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
