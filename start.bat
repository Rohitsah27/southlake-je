@echo off
echo Starting Starlight Reinsurance Treaty System...
start cmd /k "npm run start-backend"
start cmd /k "npm run start-frontend"
echo App servers started in separate command windows.
echo Backend running on http://localhost:3000
echo Frontend running on http://localhost:5173
