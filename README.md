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
<!-- Not necessary when you already have .keystore file -->
4. keytool -genkey -v -keystore carga.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
5. jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .\carga.keystore .\app-release-unsigned.apk carga
6. zipalign -v 4 .\app-release-unsigned.apk carga.apk