# ============================================================
# MD Ambiental - Backup Manager v1.0
#
# O que este script faz (em ordem):
#   1. Valida o ambiente (config, ferramentas, espaco em disco)
#   2. Sincroniza o codigo para OneDrive via robocopy
#   3. Sincroniza o codigo para HD Externo via robocopy
#   4. Cria um snapshot ZIP com timestamp
#   5. Exporta o banco Supabase via pg_dump       (pulavel com -PularBanco)
#   6. Faz git commit + push (branch master - o push ja dispara o
#      deploy automatico no Vercel para o ambiente Staging)
#
# Parametros:
#   -Ambiente       Staging (default) ou Producao
#   -Silencioso     Suprime saidas nao-essenciais
#   -DryRun         Simula todas as operacoes sem gravar nada
#   -PularBanco     Pula o pg_dump (util quando so quer salvar o codigo)
#   -CommitMessage  Mensagem do commit git (default: "backup: <timestamp>")
#
# PRODUCAO: exige o parametro -Ambiente Producao *e* confirmacao
# digitada. Nao ha atalho para pular essa confirmacao.
#
# Variavel de ambiente obrigatoria por ambiente (NAO commitar no git):
#   Staging  -> MD_AMBIENTAL_STAGING_DB_URL
#   Producao -> MD_AMBIENTAL_PROD_DB_URL
#
# Exemplos:
#   .\scripts\backup-md-ambiental.ps1
#   .\scripts\backup-md-ambiental.ps1 -DryRun
#   .\scripts\backup-md-ambiental.ps1 -PularBanco -CommitMessage "feat: geracao de PDF do CCO"
#   .\scripts\backup-md-ambiental.ps1 -Ambiente Producao
# ============================================================

param(
    [ValidateSet("Staging", "Producao")]
    [string]$Ambiente = "Staging",
    [switch]$Silencioso,
    [switch]$DryRun,
    [switch]$PularBanco,
    [string]$CommitMessage = ""
)

$AmbienteKey = $Ambiente.ToLower()
$ScriptRoot  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRootAtual = Split-Path -Parent $ScriptRoot
$Workspace   = Split-Path -Parent $ProjectRootAtual
$ConfigPath  = Join-Path $Workspace "config\paths.json"

if (!(Test-Path $ConfigPath)) {
    Write-Host "[ERRO] config/paths.json nao encontrado em $ConfigPath" -ForegroundColor Red
    Write-Host "       Execute primeiro: .\scripts\init-md-ambiental-folders.ps1" -ForegroundColor Yellow
    exit 1
}
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$AmbCfg = $Config.ambientes.$AmbienteKey
if (!$AmbCfg) {
    Write-Host "[ERRO] Ambiente '$AmbienteKey' nao encontrado em config/paths.json." -ForegroundColor Red
    exit 1
}

# -- Trava de seguranca: PRODUCAO exige confirmacao explicita ------------------
if ($AmbienteKey -eq "producao") {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  ATENCAO: BACKUP DE PRODUCAO (MD Ambiental)" -ForegroundColor Red
    Write-Host "  Supabase de producao: $($AmbCfg.supabaseRef)" -ForegroundColor Red
    Write-Host "  So prossiga se souber exatamente o que esta fazendo." -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    if (!$DryRun) {
        $conf = Read-Host "Digite PRODUCAO para confirmar"
        if ($conf -ne "PRODUCAO") {
            Write-Host "Confirmacao nao confere. Operacao cancelada." -ForegroundColor DarkYellow
            exit 1
        }
    }
}

$NomeBackup  = "md-ambiental-$AmbienteKey"
$Origem      = Join-Path $Workspace $AmbCfg.pasta
$OneDriveDestino = Join-Path $Config.onedrive $NomeBackup
$ExternoDestino  = Join-Path $Config.external  $NomeBackup
$SnapshotDir     = Join-Path $Config.snapshots $NomeBackup
$LogDir      = Join-Path $Origem "logs\$(Get-Date -f 'yyyy\\MM')\backup"
$Timestamp   = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile     = Join-Path $LogDir "backup_$Timestamp.log"

if (!(Test-Path $Origem)) {
    Write-Host "[ERRO] Pasta do ambiente '$Ambiente' nao existe: $Origem" -ForegroundColor Red
    exit 1
}
if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Write-Log {
    param([string]$Msg, [string]$Color = "White")
    $line = "[$(Get-Date -f 'HH:mm:ss')] $Msg"
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
    if (-not $Silencioso) { Write-Host $line -ForegroundColor $Color }
}

function Test-CommandExists { param([string]$Cmd); return [bool](Get-Command $Cmd -ErrorAction SilentlyContinue) }

function Get-FreeSpaceGB {
    param([string]$Path)
    try {
        $q = (Split-Path -Qualifier $Path).TrimEnd(':')
        $d = Get-PSDrive -Name $q -ErrorAction Stop
        return [math]::Round($d.Free / 1GB, 2)
    } catch { return $null }
}

function Sync-Robocopy {
    param([string]$Destino, [string]$Label)
    Write-Log "SYNC [$Label] $Origem -> $Destino" "Cyan"

    if (!(Test-Path $Destino)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }
        Write-Log "  Pasta criada: $Destino" "DarkGray"
    }

    $XD = @()
    foreach ($dir in $Config.excludedDirectories) { $XD += @("/XD", $dir) }

    if ($DryRun) {
        Write-Log "  [DRY-RUN] Sync para $Label simulado." "DarkYellow"
        return $true
    }

    robocopy $Origem $Destino /MIR /R:2 /W:2 /NFL /NDL /NJH /NJS @XD | Out-Null
    $ok = $LASTEXITCODE -le 7
    if ($ok) { Write-Log "  [OK] $Label sincronizado (robocopy: $LASTEXITCODE)" "Green" }
    else     { Write-Log "  [ERRO] Falha no sync $Label (robocopy: $LASTEXITCODE)" "Red" }
    return $ok
}

function New-ZipSnapshot {
    Write-Log "SNAPSHOT ZIP" "Cyan"
    if (!(Test-Path $SnapshotDir)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }
    }

    $ZipName = "${NomeBackup}_${Timestamp}.zip"
    $ZipPath = Join-Path $SnapshotDir $ZipName

    if ($DryRun) {
        Write-Log "  [DRY-RUN] ZIP simulado: $ZipPath" "DarkYellow"
        return $true
    }

    $TempDir = Join-Path $env:TEMP "mdambiental_snap_$Timestamp"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    robocopy $Origem $TempDir /MIR /R:2 /W:2 /NFL /NDL /NJH /NJS `
        /XD node_modules .next .git dist .turbo | Out-Null

    Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
    Remove-Item -Path $TempDir -Recurse -Force

    $SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
    Write-Log "  [OK] $ZipName ($SizeMB MB)" "Green"
    return $true
}

function Backup-SupabaseDatabase {
    Write-Log "BANCO DE DADOS (pg_dump) - $Ambiente" "Cyan"

    if (!(Test-CommandExists "pg_dump")) {
        Write-Log "  [ERRO] pg_dump nao encontrado no PATH. Instale o PostgreSQL client tools." "Red"
        return $false
    }

    $DbUrl = [System.Environment]::GetEnvironmentVariable($AmbCfg.dbUrlEnvVar)
    if ([string]::IsNullOrWhiteSpace($DbUrl)) {
        Write-Log "  [ERRO] Variavel $($AmbCfg.dbUrlEnvVar) nao definida." "Red"
        Write-Log "         Defina no sistema (nunca versionar no git)." "Yellow"
        return $false
    }

    if (!(Test-Path $SnapshotDir)) {
        if (!$DryRun) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }
    }

    $DumpName = "${NomeBackup}_db_${Timestamp}.dump"
    $DumpPath = Join-Path $SnapshotDir $DumpName

    if ($DryRun) {
        Write-Log "  [DRY-RUN] pg_dump simulado: $DumpPath" "DarkYellow"
        return $true
    }

    & pg_dump --format=custom --no-owner --no-privileges -f $DumpPath $DbUrl 2>&1 | ForEach-Object {
        Write-Log "  pg_dump: $_" "DarkGray"
    }

    if ($LASTEXITCODE -eq 0 -and (Test-Path $DumpPath)) {
        $SizeKB = [math]::Round((Get-Item $DumpPath).Length / 1KB, 1)
        Write-Log "  [OK] $DumpName ($SizeKB KB)" "Green"
        Write-Log "  ATENCAO: dump pode conter dados de clientes/coletas reais - NAO versionar no git." "Yellow"
        return $true
    } else {
        Write-Log "  [ERRO] pg_dump falhou (code: $LASTEXITCODE)" "Red"
        return $false
    }
}

function Sync-GitHub {
    param([string]$Msg)
    Write-Log "GIT COMMIT + PUSH (branch master)" "Cyan"
    Write-Log "  Lembrete: push na master dispara deploy automatico no Vercel." "DarkGray"

    if (!(Test-CommandExists "git")) {
        Write-Log "  [ERRO] Git nao encontrado." "Red"
        return $false
    }

    if ($DryRun) {
        Write-Log "  [DRY-RUN] Git commit + push simulados." "DarkYellow"
        return $true
    }

    Set-Location $Origem

    git add -A
    $statusOut = git status --short
    if ([string]::IsNullOrWhiteSpace($statusOut)) {
        Write-Log "  Nenhuma alteracao para commitar." "DarkGray"
    } else {
        git commit -m $Msg 2>&1 | ForEach-Object { Write-Log "  $_" "DarkGray" }
    }

    git push 2>&1 | ForEach-Object { Write-Log "  $_" "DarkGray" }

    if ($LASTEXITCODE -eq 0) {
        Write-Log "  [OK] Push realizado com sucesso." "Green"
        return $true
    } else {
        Write-Log "  [ERRO] git push falhou (code: $LASTEXITCODE)." "Red"
        return $false
    }
}

function Validate-Environment {
    $ok = $true

    if (!(Test-Path $Origem)) {
        Write-Log "[ERRO] Pasta do projeto nao encontrada: $Origem" "Red"; $ok = $false
    }

    $FreeGB = Get-FreeSpaceGB -Path $Origem
    if ($null -ne $FreeGB -and $FreeGB -lt 1) {
        Write-Log "[AVISO] Espaco em disco baixo na raiz: $FreeGB GB" "Yellow"
    }

    if (!(Test-CommandExists "git")) {
        Write-Log "[ERRO] Git nao encontrado no PATH." "Red"; $ok = $false
    }

    if (!$PularBanco -and !(Test-CommandExists "pg_dump")) {
        Write-Log "[AVISO] pg_dump nao encontrado. Use -PularBanco ou instale o PostgreSQL client." "Yellow"
    }

    return $ok
}

# -- Header ---------------------------------------------------------------------
Write-Log "============================================================" "Cyan"
Write-Log "  MD Ambiental | Backup Manager v1.0 | Ambiente: $Ambiente" "White"
if ($DryRun) { Write-Log "  [DRY-RUN] Nenhum arquivo sera gravado." "DarkYellow" }
Write-Log "============================================================" "Cyan"
Write-Log "Inicio: $(Get-Date -f 'dd/MM/yyyy HH:mm:ss')" "White"
Write-Log "Raiz:   $Origem" "White"
Write-Log "Log:    $LogFile" "DarkGray"
Write-Log ""

if (!(Validate-Environment)) {
    Write-Log "[ERRO] Validacao do ambiente falhou. Abortando." "Red"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = "backup: $(Get-Date -f 'dd/MM/yyyy HH:mm') ($Ambiente)"
}

# -- Execucao ------------------------------------------------------------------
$Resultados = @{}

Write-Log ""
$Resultados["OneDrive"] = Sync-Robocopy -Destino $OneDriveDestino -Label "OneDrive"
Write-Log ""
$Resultados["Externo"]  = Sync-Robocopy -Destino $ExternoDestino -Label "HD Externo"
Write-Log ""
$Resultados["Snapshot"] = New-ZipSnapshot
Write-Log ""

if (!$PularBanco) {
    $Resultados["Banco"] = Backup-SupabaseDatabase
    Write-Log ""
} else {
    Write-Log "BANCO DE DADOS ignorado (-PularBanco)." "DarkGray"
    $Resultados["Banco"] = $true
}

$Resultados["GitHub"] = Sync-GitHub -Msg $CommitMessage
Write-Log ""

# -- Resumo --------------------------------------------------------------------
Write-Log "============================================================" "Cyan"
Write-Log "  RESUMO DO BACKUP - $Ambiente" "White"
Write-Log "============================================================" "Cyan"
foreach ($k in $Resultados.Keys) {
    $status = if ($Resultados[$k]) { "[OK]    " } else { "[ERRO]  " }
    $cor    = if ($Resultados[$k]) { "Green"    } else { "Red"     }
    Write-Log "  $status $k" $cor
}

$Falhas = ($Resultados.Values | Where-Object { !$_ }).Count
Write-Log ""
if ($Falhas -eq 0) {
    Write-Log "Backup concluido sem erros. $(Get-Date -f 'dd/MM/yyyy HH:mm:ss')" "Green"
    exit 0
} else {
    Write-Log "Backup concluido com $Falhas erro(s). Verifique o log: $LogFile" "Red"
    exit 1
}
