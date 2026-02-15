param(
  [string]$m = ""
)

git add .

if ($m -eq "") {
  $m = Read-Host "Mensagem do commit"
}

git commit -m "$m"
git push
