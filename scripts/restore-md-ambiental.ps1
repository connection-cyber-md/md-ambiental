# ============================================================
# MD Ambiental - Restore Helper v1.0
# Restaura o CODIGO a partir de 4 fontes, em ordem de prioridade:
#   GitHub -> OneDrive -> HD Externo -> ZIP
#
# A restauracao do BANCO (Supabase) e sempre manual e separada
# (-Fonte Banco) - nunca entra no fluxo automatico "Auto", por ser
# uma operacao destrutiva sobre dados reais.
#
# PRODUCAO exige -Ambiente Producao + confirmacao digitada, ANTES
# de qualquer outra confirmacao especifica da fonte escolhida.
#
# Uso:
#   .\scripts\restore-md-ambiental.ps1                       # Staging, modo Auto
#   .\scripts\restore-md-ambiental.ps1 -Fonte GitHub
#   .\scripts\restore-md-ambiental.ps1 -Fonte Banco
#   .\scripts\restore-md-ambiental.ps1 -Ambiente Producao -Fonte Banco
#   .\scripts\restore-md-ambiental.ps1 -DryRun
# ============================================================

param(
    [ValidateSet("Staging", "Producao")]
    [string]$Ambiente = "Staging",
    [ValidateSet("Auto", "GitHub", "OneDrive", "Externo", "Zip", "Banco")]
    [string]$Fonte = "Auto",
    [switch]$DryRun
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

# -- Trava de seguranca: PRODUCAO exige confirmacao explicita, sempre ----------
if ($AmbienteKey -eq "producao" -and !$DryRun) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  ATENCAO: RESTAURACAO EM PRODUCAO (MD Ambiental)" -ForegroundColor Red
    Write-Host "  Supabase de producao: $($AmbCfg.supabaseRef)" -ForegroundColor Red
    Write-Host "  Isto pode sobrescrever codigo ou dados reais." -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    $conf = Read-Host "Digite PRODUCAO para confirmar"
    if ($conf -ne "PRODUCAO") {
        Write-Host "Confirmacao nao confere. Operacao cancelada." -ForegroundColor DarkYellow
        exit 1
    }
}

$NomeBackup    = "md-ambiental-$AmbienteKey"
$Destino       = Join-Path $Workspace $AmbCfg.pasta
$OneDriveFonte = Join-Path $Config.onedrive $NomeBackup
$ExternoFonte  = Join-Path $Config.external  $NomeBackup
$SnapshotDir   = Join-Path $Config.snapshots $NomeBackup
$GitRemote     = "https://github.com/$($Config.github.organization)/$($Config.github.repo).git"
$ExcluidosDir  = $Config.excludedDirectories

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MD Ambiental | Restore Helper v1.0 | Ambiente: $Ambiente" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Destino: $Destino" -ForegroundColor Yellow
if ($DryRun) { Write-Host "[DRY-RUN] Nenhum arquivo sera gravado." -ForegroundColor DarkYellow }
Write-Host ""

function Confirm-Restore {
    param([string]$Aviso = "Esta operacao pode sobrescrever arquivos em $Destino.")
    if ($DryRun) { return $true }
    Write-Host $Aviso -ForegroundColor Yellow
    $confirm = Read-Host "Digite RESTAURAR para continuar"
    return ($confirm -eq "RESTAURAR")
}

function Restore-FromGitHub {
    Write-Host "[FONTE] GitHub -> $GitRemote (branch $($Config.github.defaultBranch))" -ForegroundColor Yellow
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[ERRO] Git nao encontrado." -ForegroundColor Red
        return $false
    }
    if ($DryRun) {
        Write-Host "[DRY-RUN] Restauracao via GitHub simulada." -ForegroundColor DarkYellow
        return $true
    }
    if (!(Confirm-Restore)) { Write-Host "Operacao cancelada." -ForegroundColor DarkYellow; return $false }

    if (Test-Path (Join-Path $Destino ".git")) {
        Set-Location $Destino
        git fetch origin
        git reset --hard "origin/$($Config.github.defaultBranch)"
    } elseif (!(Test-Path $Destino) -or (Get-ChildItem $Destino -Force | Measure-Object).Count -eq 0) {
        git clone $GitRemote $Destino
    } else {
        Write-Host "[ERRO] $Destino existe, tem arquivos e nao e um repositorio Git." -ForegroundColor Red
        Write-Host "       Escolha outra fonte ou limpe a pasta manualmente." -ForegroundColor Yellow
        return $false
    }
    return ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE)
}

function Restore-FromMirror {
    param([string]$Origem, [string]$NomeFonte)
    Write-Host "[FONTE] $NomeFonte -> $Origem" -ForegroundColor Yellow
    if (!(Test-Path $Origem)) {
        Write-Host "[ERRO] Fonte nao encontrada: $Origem" -ForegroundColor Red
        return $false
    }
    if ($DryRun) {
        Write-Host "[DRY-RUN] Restauracao via $NomeFonte simulada." -ForegroundColor DarkYellow
        return $true
    }
    if (!(Confirm-Restore)) { Write-Host "Operacao cancelada." -ForegroundColor DarkYellow; return $false }

    if (!(Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }

    $XD = @()
    foreach ($dir in $ExcluidosDir) { $XD += @("/XD", $dir) }
    robocopy $Origem $Destino /MIR /R:2 /W:2 @XD
    return ($LASTEXITCODE -le 7)
}

function Restore-FromZip {
    Write-Host "[FONTE] Snapshot ZIP -> $SnapshotDir" -ForegroundColor Yellow
    if (!(Test-Path $SnapshotDir)) {
        Write-Host "[ERRO] Pasta de snapshots nao encontrada: $SnapshotDir" -ForegroundColor Red
        return $false
    }

    $LatestZip = Get-ChildItem -Path $SnapshotDir -Filter "${NomeBackup}_*.zip" -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if (!$LatestZip) {
        Write-Host "[ERRO] Nenhum snapshot ZIP encontrado em $SnapshotDir" -ForegroundColor Red
        return $false
    }
    Write-Host "Snapshot mais recente: $($LatestZip.FullName)" -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Host "[DRY-RUN] Restauracao via ZIP simulada." -ForegroundColor DarkYellow
        return $true
    }
    if (!(Confirm-Restore)) { Write-Host "Operacao cancelada." -ForegroundColor DarkYellow; return $false }

    if (!(Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }
    Expand-Archive -Path $LatestZip.FullName -DestinationPath $Destino -Force
    return $true
}

function Restore-FromDatabaseDump {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  ATENCAO: RESTAURACAO DE BANCO - $Ambiente (MD Ambiental)" -ForegroundColor Red
    Write-Host "  Isto SOBRESCREVE dados reais (tenants, coletas, empresas," -ForegroundColor Red
    Write-Host "  documentos) no Supabase com o conteudo do dump escolhido." -ForegroundColor Red
    Write-Host "  Use SOMENTE em incidente real de perda de dados." -ForegroundColor Red
    Write-Host "  Esta operacao e IRREVERSIVEL." -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""

    if (!(Get-Command pg_restore -ErrorAction SilentlyContinue)) {
        Write-Host "[ERRO] pg_restore nao encontrado no PATH." -ForegroundColor Red
        return $false
    }

    $DbUrl = [System.Environment]::GetEnvironmentVariable($AmbCfg.dbUrlEnvVar)
    if ([string]::IsNullOrWhiteSpace($DbUrl)) {
        Write-Host "[ERRO] Variavel $($AmbCfg.dbUrlEnvVar) nao definida." -ForegroundColor Red
        return $false
    }

    $LatestDump = Get-ChildItem -Path $SnapshotDir -Filter "${NomeBackup}_db_*.dump" -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if (!$LatestDump) {
        Write-Host "[ERRO] Nenhum dump de banco encontrado em $SnapshotDir" -ForegroundColor Red
        return $false
    }

    Write-Host "Dump mais recente: $($LatestDump.FullName)" -ForegroundColor DarkGray
    Write-Host "Data do dump:      $($LatestDump.LastWriteTime)" -ForegroundColor DarkGray
    Write-Host "Ref. Supabase:     $($AmbCfg.supabaseRef)" -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Host "[DRY-RUN] Restauracao de banco simulada." -ForegroundColor DarkYellow
        return $true
    }

    if (!(Confirm-Restore -Aviso "Isto vai SOBRESCREVER o banco Supabase '$($AmbCfg.supabaseRef)' ($Ambiente) com o dump acima.")) {
        Write-Host "Operacao cancelada." -ForegroundColor DarkYellow
        return $false
    }

    # Segunda confirmacao - dado o risco de sobrescrever dados reais de clientes
    $confirm2 = Read-Host "Digite a referencia do projeto Supabase ($($AmbCfg.supabaseRef)) para confirmar definitivamente"
    if ($confirm2 -ne $AmbCfg.supabaseRef) {
        Write-Host "Confirmacao nao confere. Operacao cancelada." -ForegroundColor DarkYellow
        return $false
    }

    & pg_restore --clean --if-exists --no-owner --no-privileges -d $DbUrl $LatestDump.FullName
    return ($LASTEXITCODE -eq 0)
}

# -- Execucao ------------------------------------------------------------------
$Sucesso = $false

switch ($Fonte) {
    "GitHub"   { $Sucesso = Restore-FromGitHub }
    "OneDrive" { $Sucesso = Restore-FromMirror -Origem $OneDriveFonte -NomeFonte "OneDrive" }
    "Externo"  { $Sucesso = Restore-FromMirror -Origem $ExternoFonte  -NomeFonte "HD Externo" }
    "Zip"      { $Sucesso = Restore-FromZip }
    "Banco"    { $Sucesso = Restore-FromDatabaseDump }
    "Auto" {
        Write-Host "[AUTO] Tentando codigo na ordem: GitHub -> OneDrive -> HD Externo -> ZIP" -ForegroundColor Cyan
        Write-Host "[AUTO] Restauracao de banco NAO entra no modo Auto - use -Fonte Banco explicitamente." -ForegroundColor DarkYellow
        if (-not $Sucesso) { $Sucesso = Restore-FromGitHub }
        if (-not $Sucesso) { $Sucesso = Restore-FromMirror -Origem $OneDriveFonte -NomeFonte "OneDrive" }
        if (-not $Sucesso) { $Sucesso = Restore-FromMirror -Origem $ExternoFonte  -NomeFonte "HD Externo" }
        if (-not $Sucesso) { $Sucesso = Restore-FromZip }
    }
}

Write-Host ""
if ($Sucesso) {
    Write-Host "[OK] Restauracao concluida." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[ERRO] Restauracao falhou ou foi cancelada." -ForegroundColor Red
    exit 1
}
