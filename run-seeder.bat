@echo off
echo Running NFT Seeder...
curl -X POST http://localhost:3001/api/seed-nfts
echo.
echo Seeder completed!
pause
