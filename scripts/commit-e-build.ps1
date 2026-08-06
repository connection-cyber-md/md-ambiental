# ============================================================
# MD Ambiental - Commit e Build v1.0
# Build de verificacao (lint + types) -> git add -A -> commit -> push.
# Uma unica branch (master) - o push ja dispara o deploy automatico
# no Vercel (Staging). Nao ha merge develop->main aqui.
#
# Uso:
#   .\scripts\commit-e-build.ps1 -Mensagem "fix: geracao de PDF do CCO"
#   .\scripts\commit-e-build.ps1 -Mensagem "..." -PularBuild   # so em emergencia
# ============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$Mensagem,
    [switch]$PularBuild
)

$ErrorActionPreference = "Stop"
$ScriptRoot  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptRoot

Write-Host "`n=== MD AMBIENTAL - COMMIT E BUILD ===" -ForegroundColor Cyan
Write-Host "Pasta: $ProjectRoot`n" -ForegroundColor Gray

Set-Location $ProjectRoot

# -- 1. Status git ------------------------------------------
Write-Host "-- STATUS GIT ----------------------------------" -ForegroundColor Yellow
git status --short
$branch = git branch --show-current
Write-Host "Branch atual: $branch" -ForegroundColor Cyan
if ($branch -ne "master") {
    Write-Host "[AVISO] Branch atual nao e 'master'. Confirme se e intencional." -ForegroundColor Yellow
}
Write-Host ""

# -- 2. Build de verificacao --------------------------------
if (!$PularBuild) {
    Write-Host "-- BUILD (lint + types + Next) ------------------" -ForegroundColor Yellow
    Write-Host "Rodando npm run build..." -ForegroundColor Gray

    $buildSaiu = 0
    try {
        npm run build
        $buildSaiu = $LASTEXITCODE
    } catch {
        $buildSaiu = 1
    }

    if ($buildSaiu -ne 0) {
        Write-Host "`n[ERRO] Build falhou. Corrija os erros antes de commitar." -ForegroundColor Red
        exit 1
    }
    Write-Host "`n[OK] Build concluido sem erros." -ForegroundColor Green
} else {
    Write-Host "[AVISO] Build pulado (-PularBuild). So use em emergencia." -ForegroundColor Yellow
}

# -- 3. Adicionar arquivos ----------------------------------
Write-Host "`n-- ADICIONANDO ARQUIVOS -------------------------" -ForegroundColor Yellow
git add -A

$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "`n[INFO] Nenhuma alteracao para commitar." -ForegroundColor Cyan
    exit 0
}

Write-Host "`nArquivos para commitar:" -ForegroundColor Gray
$staged | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# -- 4. Commit ----------------------------------------------
Write-Host "`n-- COMMIT ----------------------------------------" -ForegroundColor Yellow
git commit -m $Mensagem
Write-Host "[OK] Commit realizado." -ForegroundColor Green

# -- 5. Push ------------------------------------------------
Write-Host "`n-- PUSH (dispara deploy no Vercel) --------------" -ForegroundColor Yellow
git push origin master
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Push realizado. Acompanhe o deploy no dashboard da Vercel." -ForegroundColor Green
} else {
    Write-Host "[ERRO] git push falhou." -ForegroundColor Red
    exit 1
}

# -- 6. Log recente -----------------------------------------
Write-Host "`n-- ULTIMOS COMMITS ------------------------------" -ForegroundColor Yellow
git log --oneline -5

Write-Host "`n=== CONCLUIDO ===" -ForegroundColor Cyan
