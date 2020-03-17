echo off
echo Get latest drivereu KAFKA schemas from github
cd ./src/schemas
git clone https://github.com/DRIVER-EU/avro-schemas.git
xcopy .\avro-schemas\core .\core /s /e /y
xcopy .\avro-schemas\edxl-de .\edxl-de /s /e /y
xcopy .\avro-schemas\sim .\sim /s /e /y
xcopy .\avro-schemas\standard .\standard /s /e /y
xcopy .\avro-schemas\sumo .\sumo /s /e /y
rmdir .\avro-schemas /s /q
pause