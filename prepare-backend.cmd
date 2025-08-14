@echo off
TITLE Backend File Preparation

ECHO.
ECHO  ==============================================================
ECHO   DIRECT-optimizer - Backend File Preparation Script
ECHO  ==============================================================
ECHO.
ECHO  This script will delete old backend files and rename the .txt
ECHO  files to their correct .rs and .toml extensions.
ECHO.
ECHO  Press any key to begin...
pause >nul
ECHO.

ECHO  [Step 1] Cleaning up old files...
DEL /F /Q "src-tauri\*.rs" >nul 2>&1
DEL /F /Q "src-tauri\*.toml" >nul 2>&1
DEL /F /Q "src-tauri\src\*.rs" >nul 2>&1
DEL /F /Q "src-tauri\src\command_handlers\*.rs" >nul 2>&1
IF EXIST "src-tauri\backup.txt" (DEL /F /Q "src-tauri\backup.txt" && ECHO    - Deleted incorrect backup.txt)
ECHO    - Cleanup complete.
ECHO.

ECHO  [Step 2] Renaming files...
pushd src-tauri

REM Root files
if exist "Cargo.toml.txt" ren "Cargo.toml.txt" "Cargo.toml" && echo    - Renamed: Cargo.toml
if exist "Tauri.toml.txt" ren "Tauri.toml.txt" "Tauri.toml" && echo    - Renamed: Tauri.toml
if exist "build.txt"      ren "build.txt"      "build.rs"   && echo    - Renamed: build.rs

REM /src folder
if exist "src\main.txt"       ren "src\main.txt"       "main.rs"       && echo    - Renamed: src\main.rs
if exist "src\models.txt"     ren "src\models.txt"     "models.rs"     && echo    - Renamed: src\models.rs
if exist "src\commands.txt"   ren "src\commands.txt"   "commands.rs"   && echo    - Renamed: src\commands.rs

REM /src/command_handlers folder
if exist "src\command_handlers\mod.txt"           ren "src\command_handlers\mod.txt"           "mod.rs"           && echo    - Renamed: src\command_handlers\mod.rs
if exist "src\command_handlers\system_info.txt"   ren "src\command_handlers\system_info.txt"   "system_info.rs"   && echo    - Renamed: src\command_handlers\system_info.rs
if exist "src-tauri\src\command_handlers\tweaks.txt"        ren "src\command_handlers\tweaks.txt"        "tweaks.rs"        && echo    - Renamed: src\command_handlers\tweaks.rs
if exist "src\command_handlers\debloat.txt"       ren "src\command_handlers\debloat.txt"       "debloat.rs"       && echo    - Renamed: src\command_handlers\debloat.rs
if exist "src\command_handlers\cleanup.txt"       ren "src\command_handlers\cleanup.txt"       "cleanup.rs"       && echo    - Renamed: src\command_handlers\cleanup.rs
if exist "src\command_handlers\backup.txt"        ren "src\command_handlers\backup.txt"        "backup.rs"        && echo    - Renamed: src\command_handlers\backup.rs
if exist "src\command_handlers\install.txt"       ren "src\command_handlers\install.txt"       "install.rs"       && echo    - Renamed: src\command_handlers\install.rs

popd

ECHO.
ECHO  ==============================================================
ECHO   Preparation complete! You can now run 'npm run tauri dev'.
ECHO  ==============================================================
ECHO.
pause