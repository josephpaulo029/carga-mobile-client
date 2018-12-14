#CARGA - Mobile App

Pre-requisite

1. npm install -g ionic

Quick Start

1. npm install
2. ionic serve

Deployment

<!-- 1. change environment.prod.ts to environment.ts -->
2. Change config.xml version
3. ionic cordova build android --release
4. jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .\carga.keystore .\app-release-unsigned.apk carga
5. zipalign -v 4 .\app-release-unsigned.apk carga.apk