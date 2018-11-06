import { Component } from '@angular/core';
import { NavController, IonicPage, Events } from 'ionic-angular';
import { NotificationService } from '../../providers/notification.api'; 
import { Storage } from '@ionic/storage';
import { HomePage, PackagesPage, SettingsPage, NotificationsPage } from '../';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
  providers: [NotificationService]
})
export class TabsPage {
    home: any = HomePage;
    packages: any = PackagesPage;
    settings: any = SettingsPage;
    notifications: any = NotificationsPage;
    unreads: number = 0;

    constructor(public navCtrl: NavController, 
      private storage: Storage,
      private events: Events,
      private notificationService: NotificationService) {

        this.events.subscribe('notifications', () => {
          this.getNotifications();
        });
    }

    ionViewWillEnter() {
      this.getNotifications();
    }

    getNotifications() {
      this.unreads = 0;
      this.storage.get('authToken').then ( token => {
        this.notificationService.getAll(token).subscribe( data => {
          let notifications = data['data'] || [];
          notifications.map( item => {
            if(item.isUnread) this.unreads += 1;
          });
        })
      });
    }
}
