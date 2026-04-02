@echo off
echo Syncing backend files to Apache server...
echo.

REM Copy entire backend directory
xcopy "c:\Users\anshu\OneDrive\Desktop\5th sem\WebTech MiniProject\backend" "D:\NEw\htdocs\backend\" /E /I /Y /EXCLUDE:sync_exclude.txt

echo.
echo Sync complete!
echo.
pause
