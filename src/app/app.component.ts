import { Component } from '@angular/core';
import { Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AuthService } from '../providers/auth.api';

import { LoginPage, HomePage } from '../pages';
@Component({
  templateUrl: 'app.html',
  providers: [AuthService]
})
export class MyApp {
  rootPage:any = LoginPage;
  user: any = {};

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private auth: AuthService,
    private menuCtrl: MenuController,
    private storage: Storage) {

    this.storage.get('authToken').then ( value => {
      console.log('test');
      if(value) {
        this.rootPage = HomePage;
        this.user = this.auth.decodeToken(value);
        this.menuCtrl.enable(true);
      } else {
        this.rootPage = LoginPage;
        this.menuCtrl.enable(false);
      }
    });


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

