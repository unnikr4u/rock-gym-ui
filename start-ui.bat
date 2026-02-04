@echo off
echo Starting Rock Gym UI...
echo.

cd rock-gym-ui

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo The UI will be available at http://localhost:3000
echo Make sure the Spring Boot backend is running on http://localhost:9090
echo.

call npm start

pause