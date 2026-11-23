# Сборка Кассы на Windows: то же, что dev/build.sh. Запуск: powershell -File dev\build.ps1 [-Test]
# -Stress — после обычных тестов гоняет dev/test/t_stress.py (marketer, cashier, seller, owner, N=20000), печатает метрики; в -Test не входит
# -Test — после сборки прогнать dev/test/t_audit.py, t_native.py и t_role.py (seller, cashier, marketer, guestpt, sellernoatt, sellernoview, empty, owner, admin, ownerempty) (пустой вывод {} = чисто)
param([switch]$Test, [switch]$Stress)
$ErrorActionPreference = 'Stop'
$py = Get-ChildItem "$env:USERPROFILE\.uv\python" -Directory -Filter 'cpython-3.12*' | Sort-Object Name -Descending | Select-Object -First 1 | ForEach-Object { Join-Path $_.FullName 'python.exe' }
if (-not $py) { throw 'нет Python 3.12 в ~/.uv/python' }
$d = $PSScriptRoot
$w = Join-Path $env:TEMP 'kassa_work.html'
$splash = "$env:USERPROFILE\Projects\kassa-optiki\frontend\splash\saif-splash.js"
if (Test-Path $splash) { Copy-Item $splash "$d\splash\saif-splash.js" -Force }
Copy-Item "$d\base.html" $w -Force
Push-Location $d
try {
  foreach ($p in 'patch_billz.py', 'patch_bz.py', 'patch_rs.py', 'patch_fm.py', 'patch_pay.py', 'patch_att.py', 'patch_role.py', 'patch_tasks.py', 'patch_ui.py', 'patch_tidy.py') { & $py -I $p $w | Out-Null; if ($LASTEXITCODE) { throw "$p failed" } }
  & $py -I build.py $w '..\index.html' | Out-Null
  & $py -I graph_src.py | Out-Null
  'сборка: ok'
} finally { Pop-Location }
if ($Test -or $Stress) {
  $env:UV_CACHE_DIR = "$env:USERPROFILE\.uv\cache"; $env:UV_PYTHON_INSTALL_DIR = "$env:USERPROFILE\.uv\python"; $env:PLAYWRIGHT_BROWSERS_PATH = "$env:USERPROFILE\.uv\ms-playwright"
  Push-Location (Split-Path $d)
  try {
    $a = uv run --no-project -q --with playwright python -X utf8 dev\test\t_audit.py
    $n = uv run --no-project -q --with playwright python -X utf8 dev\test\t_native.py
    $bad = ("$a".Trim() -ne '{}' -or "$n".Trim() -ne '{}')
    "t_audit: $a"; "t_native: $n"
    foreach ($r in 'seller', 'cashier', 'marketer', 'guestpt', 'sellernoatt', 'sellernoview', 'empty', 'owner', 'admin', 'ownerempty') {
      $env:ROLE = $r
      $o = uv run --no-project -q --with playwright python -X utf8 dev\test\t_role.py
      "t_role: $o"
      if ("$o".Trim() -ne '{}') { $bad = $true }
    }
    if ($Stress) {
      $env:N = '20000'
      foreach ($r in 'marketer', 'cashier', 'seller', 'owner') {
        $env:ROLE = $r
        $o = uv run --no-project -q --with playwright python -X utf8 dev\test\t_stress.py
        "t_stress ${r}: $o"
        if ("$o" -match '"bad"') { $bad = $true }
      }
      Remove-Item Env:\N -ErrorAction SilentlyContinue
    }
    Remove-Item Env:\ROLE -ErrorAction SilentlyContinue
    if ($bad) { throw 'тесты нашли проблемы' }
  } finally { Pop-Location }
}
