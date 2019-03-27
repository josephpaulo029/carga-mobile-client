# Carga Client

An application that allows clients/shippers to request for delivery from trucking companies.

## Getting Started

1. Clone the carga client 
    ```
    git clone https://[username]@bitbucket.org/hivemindhq/carga-mobile-client.git
    ```

### Prerequisites

**Ionic:**

   ionic (Ionic CLI)  : 4.8.0 (C:\Users\codeninja\AppData\Roaming\npm\node_modules\ionic)
   Ionic Framework    : ionic-angular 3.9.2
   @ionic/app-scripts : 3.2.0

**Cordova:**

   cordova (Cordova CLI) : 8.1.2 (cordova-lib@8.1.1)
   Cordova Platforms     : android 7.1.4, browser 5.0.4
   Cordova Plugins       : cordova-plugin-ionic-keyboard 2.1.3, cordova-plugin-ionic-webview 2.2.0, (and 10 other plugins)

**System:**

   Android SDK Tools : 26.1.1
   NodeJS            : v10.2.1 
   npm               : 5.10.0


### Development Environment

Make sure your environment is pointing to staging by checking the environment file from environment folder.

```
import { environment as prodEnv } from './environment.prod';
import { environment as stgEnv } from './environment.stg';

// true = production environment
// false = staging environment
const isProduction  = false; 

export const environment = isProduction ? prodEnv : stgEnv;
```

### Installing
A step by step series of examples that tell you how to get a development env running. 

Run npm install on the current project. This will install all the current packages needed to run the carga application

```
npm install
```

Run the carga application that simulates the cordova in the browser

```
ionic cordova run browser
```

Run the carga application in the android device
```
ionic cordova run android --device
```

### Production Envronment Config

    {
        production: true,
        endpoint: 'https://api.cognity.io/v1',
        socketUrl: 'https://ws.cognity.io',
        apiKey: '864f48b2-4d3f-4fe3-a6be-42c25c174515',
        notification: 'https://notification.cognity.io'
    };

### Staging Envronment Config
    {
        production: false,
        endpoint: 'https://apistg.cognity.io/v1',
        socketUrl: 'https://cognity-bridge-websockets-stg.herokuapp.com',
        apiKey: 'carga-api-key-stg-123',
        notification: 'https://cognity-bridge-ws-notif-stg.herokuapp.com'
    };

## Production Deployment

1. Make sure you have configured your AWS CLI secret key
2. Run this command to create a realese apk
    ```
    ionic cordova build android --release
    ```
3. Copy the file *app-relelase-unsigned.apk* from *carga-mobile-client\platforms\android\app\build\outputs\apk\release* and paste it to your app root folder
4. Run this command **ONLY** if you haven't created .keystore on your local app.
    ```
    keytool -genkey -v -keystore carga.keystore -alias carga -keyalg RSA -keysize 2048 -validity 10000
    ```
5. Run this command 
    ```
    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .\carga.keystore .\app-release-unsigned.apk carga
    ```
6. Run this command to create a signed apk
    ```
    zipalign -v 4 .\app-release-unsigned.apk carga.apk
    ```
## Google playstore
Manage the carga application release from the URL below
`https://play.google.com/apps/publish/?account=5156492344329848297#AppDashboardPlace:p=carga.io&appid=4972784290903039761`

