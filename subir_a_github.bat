@echo off
setlocal
cd /d "%~dp0"
echo ===========================================
echo   ACTUALIZADOR DE PREMIER JUNIOR (GitHub)
echo ===========================================
echo.
echo 1. Guardando cambios locales...
git add .
echo.
echo 2. Creando punto de restauracion...
git commit -m "Actualizacion de resultados: %date% %time%"
echo.
echo 3. Subiendo a la nube (GitHub)...
git push origin main
echo.
echo ===========================================
echo      ¡TODO LISTO! 
echo      Los cambios se veran en tu web oficial 
echo      en aproximadamente 1 minuto.
echo ===========================================
echo.
pause
