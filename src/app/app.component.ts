import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, AlertController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AccountService } from '../providers/account.api';
import { NotificationSocket } from '../providers/notification.service';

import { LoginPage, TabsPage } from '../pages';
@Component({
  templateUrl: 'app.html',
  providers: [AccountService, NotificationSocket]
})
export class MyApp {
  rootPage:any = LoginPage;
  user: any = {};
  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private alert: AlertController,
    private events: Events,
    private notificationSocket: NotificationSocket,
    private accountService: AccountService,
    private menuCtrl: MenuController,
    private storage: Storage) {

    this.events.subscribe('update:user', () => {
      this.storage.get('authToken').then ( value => {
        this.getUser(value);
      });
    })

    this.storage.get('authToken').then ( value => {
      if(value) {
        this.rootPage = TabsPage;
        this.getUser(value);
        this.menuCtrl.enable(true);
      } else {
        this.rootPage = LoginPage;
        this.menuCtrl.enable(false);
      }
    });


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.subscribeNotification();
      this.listenToNotifications();

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  getUser(token) {
    this.accountService.get(token).subscribe( data => {
      this.user = data['data'] || {};
    });
  }

  listenToNotifications() {
    this.notificationSocket.on('notification', data => {
      console.log('data', data);
    });
  }

  subscribeNotification() {
    this.storage.get('authToken').then ( value => {
      this.notificationSocket.emit('subscribe', value);
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

