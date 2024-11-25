@echo off 
@cls 
Color 03  
echo. 
set NODE_NO_WARNINGS=1 
node --trace-deprecation ServerApi.js 
pause 
