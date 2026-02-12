@echo off
REM Demo Mode Test Script (Windows)
REM Tests all demo mode endpoints

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000
set COOKIES_FILE=.cookies.txt

echo.
echo ================================
echo Energy Adviser - Demo Mode Tests
echo ================================
echo.

REM Test 1: Check demo status
echo [1/6] Checking demo status...
curl -s "%BASE_URL%/api/auth/demo-status"
echo.
echo.

REM Test 2: Demo login
echo [2/6] Demo login...
curl -s -c "%COOKIES_FILE%" "%BASE_URL%/api/auth/demo-login"
echo.
echo.

REM Test 3: Get meters
echo [3/6] Getting meters...
curl -s -b "%COOKIES_FILE%" "%BASE_URL%/api/energy/meters"
echo.
echo.

REM Test 4: Get consumption (last 7 days)
echo [4/6] Getting consumption data (7 days)...
curl -s -b "%COOKIES_FILE%" "%BASE_URL%/api/energy/consumption?days=7"
echo.
echo.

REM Test 5: Get today's consumption
echo [5/6] Getting today's consumption...
curl -s -b "%COOKIES_FILE%" "%BASE_URL%/api/energy/today"
echo.
echo.

REM Test 6: Check auth status
echo [6/6] Checking auth status...
curl -s -b "%COOKIES_FILE%" "%BASE_URL%/api/auth/status"
echo.
echo.

echo ================================
echo Tests complete!
echo To clean up: del %COOKIES_FILE%
echo ================================
pause
