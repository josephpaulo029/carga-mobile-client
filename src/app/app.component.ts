import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, AlertController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AccountService } from '../providers/account.api';
import { AuthService } from '../providers/auth.api';
import { NotificationSocket } from '../providers/notification.service';
import { DeviceSocket } from '../providers/devicesocket.service';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Geolocation } from '@ionic-native/geolocation';
import { environment } from '../environments/environment';

import { LoginPage, TabsPage, VerifyClientPage } from '../pages';
@Component({
  templateUrl: 'app.html',
  providers: [AccountService, NotificationSocket, DeviceSocket, AuthService]
})
export class MyApp {
  rootPage:any = LoginPage;
  user: any = {};
  environment = environment;
  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private alert: AlertController,
    private events: Events,
    private auth: AuthService,
    private backgroundMode: BackgroundMode,
    private localNotification: LocalNotifications,
    private deviceSocket: DeviceSocket,
    private geolocation: Geolocation,
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
          if(userObj.validationStatus === 'pending' || userObj.validationStatus === 'rejected') {
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
        this.backgroundMode.enable();

        statusBar.styleDefault();
        splashScreen.hide();
        this.getLocation();
      });
  }

  getUser(token) {
    this.accountService.get(token).subscribe( data => {
      this.user = data['data'] || {};
    });
  }

  listenToNotifications() {
    this.notificationSocket.on('notification', notification => {
      this.events.publish('notifications', notification);
      this.localNotification.schedule({
        title: 'Carga',
        text: notification['data'].title
      });

      this.localNotification.on('click').subscribe( () => {
        this.rootPage = 'NotificationsPage';
      });
    });
  }

  getLocation() {
    this.geolocation.getCurrentPosition().then( response => {
      let lat = response.coords.latitude;
      let lng = response.coords.longitude;

      this.storage.set('currentLocation', {
          lat: lat,
          lng: lng
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
            this.deviceSocket.disconnect();
            this.menuCtrl.enable(false);
          }
        }
      ]
    });
    alert.present();
  }
}

