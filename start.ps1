# Start Flask backend
$apiJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\ryan.e\Documents\world_cup_2026_prediction\api"
    & "..\venv\Scripts\python.exe" "app.py"
}

Write-Host "Flask backend starting on http://localhost:5000"
Start-Sleep -Seconds 2

# Start React frontend
Set-Location "c:\Users\ryan.e\Documents\world_cup_2026_prediction\dashboard"
Write-Host "Starting React dashboard on http://localhost:5173"
npm run dev
