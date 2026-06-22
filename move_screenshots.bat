@echo off
rem -------------------------------------------------
rem Image-filename audit – automatic rename & move
rem -------------------------------------------------

rem 1️⃣ Ensure destination folder exists
if not exist "assets\screenshots" (
  mkdir "assets\screenshots"
)

rem 2️⃣ Rename & move the first screenshot
move "Near Mart - AI Grocery Delivery - Google Chrome 08-06-2026 17_19_50.png" "assets\screenshots\screenshots_homepage_20260608_1719.png"

rem 3️⃣ Rename & move the second screenshot
move "Near Mart - AI Grocery Delivery - Google Chrome 20-05-2026 10_40_46.png" "assets\screenshots\screenshots_unknown_20260520_1040.png"

echo.
echo ==============================
echo  ✅  Rename & move complete
echo ==============================
pause
