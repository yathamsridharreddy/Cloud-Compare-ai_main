@echo off
REM CloudCompare AI - GitHub Push Script
REM This script sets up git and pushes the project to GitHub

echo.
echo ========================================
echo CloudCompare AI - GitHub Setup & Push
echo ========================================
echo.

REM Change to project directory
cd /d "c:\Users\goder\OneDrive\Desktop - Copy\CloudCampare-Ai-main"

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init

echo.
echo [2/5] Configuring Git user...
REM Configure git (optional - modify if needed)
git config user.name "Cloud-Compare-AI"
git config user.email "noreply@cloudcompare.ai"

echo.
echo [3/5] Adding all files to staging...
git add .

echo.
echo [4/5] Creating initial commit...
git commit -m "Initial commit: CloudCompare AI - Spring Boot multi-cloud service recommendation system with Groq AI integration"

echo.
echo [5/5] Setting up remote and pushing to GitHub...
git remote add origin https://github.com/Godesivaramakrishna/Cloud-Compare-AI.git 2>nul
if errorlevel 1 (
    echo Remote already exists, updating...
    git remote set-url origin https://github.com/Godesivaramakrishna/Cloud-Compare-AI.git
)

git branch -M main
echo.
echo Pushing to GitHub...
echo NOTE: You may be prompted for GitHub credentials (use Personal Access Token)
echo.
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Project pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/Godesivaramakrishna/Cloud-Compare-AI
echo.
pause
