import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, AlertController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AccountService } from '../providers/account.api';
import { AuthService } from '../providers/auth.api';
import { NotificationSocket } from '../providers/notification.service';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { LoginPage, TabsPage, VerifyClientPage } from '../pages';
@Component({
  templateUrl: 'app.html',
  providers: [AccountService, NotificationSocket, AuthService]
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
    private auth: AuthService,
    private localNotification: LocalNotifications,
    private notificationSocket: NotificationSocket,
    private accountService: AccountService,
    private menuCtrl: MenuController,
    private storage: Storage) {

      //when user is updated from settings page, update side menu header
      this.events.subscribe('update:user', () => {
        this.storage.get('authToken').then ( value => {
          this.getUser(value);
        });
      });

      //if user logs in, update user details for the side menu header
      this.events.subscribe('loggedIn', () => {
        this.storage.get('authToken').then ( value => {
          this.getUser(value);
        });
      });

      //check if user is logged in, then redirect to home page
      this.storage.get('authToken').then ( value => {
        if(value) {
          let userObj = this.auth.decodeToken(value);
          if(userObj.validationStatus === 'pending') {
            this.rootPage = VerifyClientPage;
          } else {
            this.rootPage = TabsPage;
          }
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
    this.notificationSocket.on('notification', notification => {
      this.events.publish('notifications');
      this.localNotification.schedule({
        title: 'Carga',
        text: notification['data'].title
      });
    });
  }

  //in order to receive notification topics, the app needs to subscribe to socket server
  subscribeNotification() {
    this.storage.get('authToken').then ( value => {
      if(value) {
        this.notificationSocket.emit('subscribe', value);
      }
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
            this.notificationSocket.disconnect();
            this.menuCtrl.enable(false);
          }
        }
      ]
    });
    alert.present();
  }
}

