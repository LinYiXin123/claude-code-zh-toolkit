@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
python "..\skills\sync_skill_chinese.py" --once
echo.
echo 已完成技能中文同步，按任意键关闭...
pause >nul
