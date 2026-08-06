# =============================================================
#  LOCALIZADOR DE ARQUIVOS - MD AMBIENTAL
#  Varre a pasta local do ambiente e localiza arquivos-alvo,
#  gerando um relatorio (CSV) com caminho completo, tamanho
#  e data de modificacao. Nao envia nada para fora da maquina.
# =============================================================

param(
    [ValidateSet("Staging", "Producao")]
    [string]$Ambiente   = "Staging",
    [string]$ProjectRoot = "",
    [string]$ReportPath  = "$PSScriptRoot\relatorio-localizacao-$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
)

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = if ($Ambiente -eq "Staging") { "C:\Projetos\md\cyber-mp-staging" } else { "C:\Projetos\md\cyber-mp" }
}

if (-not (Test-Path $ProjectRoot)) {
    Write-Host "ERRO: pasta do projeto nao encontrada em '$ProjectRoot'" -ForegroundColor Red
    exit 1
}

Write-Host "Varrendo projeto ($Ambiente) em: $ProjectRoot" -ForegroundColor Cyan

# Arquivos criticos: perda/corrupcao afeta auth, RLS ou schema inteiro
$arquivosCriticos = @(
    "server.ts",        # lib/supabase/server.ts
    "middleware.ts",     # lib/supabase/middleware.ts + middleware.ts na raiz
    "admin.ts",          # lib/supabase/admin.ts (client service-role)
    "env.ts",            # lib/env.ts
    "supabase.ts",       # types/supabase.ts (tipos gerados do schema real)
    "rbac.ts"             # lib/auth/rbac.ts
)

# Outros arquivos-chave de configuracao/estrutura
$arquivosGerais = @(
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "next.config.ts",
    "tailwind.config.ts",
    ".env.local",
    ".env.production"
)

$todosAlvos = $arquivosCriticos + $arquivosGerais
$resultados = @()

foreach ($nome in $todosAlvos) {
    $encontrados = Get-ChildItem -Path $ProjectRoot -Recurse -File -Filter $nome -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '\\node_modules\\' }

    if ($encontrados) {
        foreach ($arq in $encontrados) {
            $resultados += [PSCustomObject]@{
                Arquivo           = $arq.Name
                Critico           = if ($arquivosCriticos -contains $arq.Name) { "SIM" } else { "" }
                CaminhoCompleto   = $arq.FullName
                TamanhoKB         = [math]::Round($arq.Length / 1KB, 2)
                UltimaModificacao = $arq.LastWriteTime
            }
        }
    } else {
        $resultados += [PSCustomObject]@{
            Arquivo           = $nome
            Critico           = if ($arquivosCriticos -contains $nome) { "SIM" } else { "" }
            CaminhoCompleto   = "NAO ENCONTRADO"
            TamanhoKB         = ""
            UltimaModificacao = ""
        }
    }
}

# -- Migrations do Supabase (contagem + mais recente) --------------------------
$MigrationsDir = Join-Path $ProjectRoot "supabase\migrations"
if (Test-Path $MigrationsDir) {
    $migrations = Get-ChildItem -Path $MigrationsDir -Filter "*.sql" -ErrorAction SilentlyContinue
    $ultimaMigration = $migrations | Sort-Object Name -Descending | Select-Object -First 1
    $resultados += [PSCustomObject]@{
        Arquivo           = "supabase/migrations (total: $($migrations.Count))"
        Critico           = "SIM"
        CaminhoCompleto   = $MigrationsDir
        TamanhoKB         = ""
        UltimaModificacao = if ($ultimaMigration) { "mais recente: $($ultimaMigration.Name)" } else { "" }
    }
} else {
    $resultados += [PSCustomObject]@{
        Arquivo = "supabase/migrations"; Critico = "SIM"
        CaminhoCompleto = "NAO ENCONTRADO"; TamanhoKB = ""; UltimaModificacao = ""
    }
}

# Exibe resumo no terminal
Write-Host "`n=== ARQUIVOS CRITICOS ===" -ForegroundColor Yellow
$resultados | Where-Object { $_.Critico -eq "SIM" } | Format-Table -AutoSize

Write-Host "`n=== DEMAIS ARQUIVOS ===" -ForegroundColor Gray
$resultados | Where-Object { $_.Critico -ne "SIM" } | Format-Table -AutoSize

# Exporta relatorio CSV
$resultados | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8

Write-Host "`nRelatorio salvo em: $ReportPath" -ForegroundColor Green
