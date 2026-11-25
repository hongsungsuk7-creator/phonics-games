@echo off
cd /d "%~dp0\.."
echo Maze Quest prototype - http://127.0.0.1:5195/Maze-Quest/
echo (close this window to stop)
start "" http://127.0.0.1:5195/Maze-Quest/
echo Tablet/phone on the same Wi-Fi: http://[this PC IP]:5195/Maze-Quest/  (microphone works only on this PC or via HTTPS)
python -m http.server 5195 --bind 0.0.0.0
