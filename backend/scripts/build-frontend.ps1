# PowerShell script to build frontend and copy to backend/frontend directory

Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location ..\frontend
npm run build

Write-Host "Copying built files to backend/frontend..." -ForegroundColor Cyan
Remove-Item -Path ..\backend\frontend\* -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path dist\* -Destination ..\backend\frontend\ -Recurse -Force

Write-Host "✓ Frontend built and copied to backend/frontend" -ForegroundColor Green
Write-Host "You can now run: cd ..\backend && npm start" -ForegroundColor Yellow

