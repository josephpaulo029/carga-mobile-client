cp './config/config.prod.xml' config.xml
ionic cordova build android --release
cp './platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk' app-release-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./carga.keystore ./app-release-unsigned.apk carga
# zipalign -v 4 .\app-release-unsigned.apk carga.apk

zipalign -v 4 /Users/carga02/Documents/ionicProj/carga-mobile-client/app-release-unsigned.apk carga.apk