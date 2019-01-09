#CARGA - Mobile App

Pre-requisite

1. npm install -g ionic

Quick Start

1. npm install
2. ionic serve

Deployment - Staging
1. Change variable isProduction to false under environment.ts
2. Change config.xml version of config.stg.xml under configs folder
3. Run deploy-staging.sh

Deployment - Prod
1. Change variable isProduction to true under environment.ts
2. Change config.xml version of config.prod.xml under configs folder
3. Run deploy-prod.sh
6. zipalign -v 4 .\app-release-unsigned.apk carga.apk