@echo off
setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_HOME=%USERPROFILE%\.mvn-wrapper\apache-maven-%MAVEN_VERSION%
set MVN=%MAVEN_HOME%\bin\mvn.cmd

if not exist "%MVN%" (
    echo First run: downloading Maven %MAVEN_VERSION%, please wait...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%TEMP%\maven.zip'}"
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%USERPROFILE%\.mvn-wrapper' -Force"
    echo Maven downloaded successfully.
)

"%MVN%" %*
