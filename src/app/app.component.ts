import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, AlertController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AuthService } from '../providers/auth.api';

import { LoginPage, TabsPage } from '../pages';
@Component({
  templateUrl: 'app.html',
  providers: [AuthService]
})
export class MyApp {
  rootPage:any = LoginPage;
  user: any = {};
  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private alert: AlertController,
    private auth: AuthService,
    private menuCtrl: MenuController,
    private storage: Storage) {

    this.storage.get('authToken').then ( value => {
      if(value) {
        this.rootPage = TabsPage;
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

  logout() {
    let alert = this.alert.create({
      title: 'Warning',
      message: 'Are you sure to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.remove('authToken');
            this.nav.push('LoginPage');
            this.menuCtrl.enable(false);
          }
        }
      ]
    });
    alert.present();
  }
}

