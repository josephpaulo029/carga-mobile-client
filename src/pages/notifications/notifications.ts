import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { IonicPage, Events, NavController } from 'ionic-angular';
import { NotificationService } from '../../providers/notification.api'; 
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  notifications: any = [];
  isLoading: Boolean = false;
  lastEvaluatedKey: any;
  timestamp: any;
  isRefreshed: Boolean = false;
  
  constructor(private notificationService: NotificationService, 
    private events: Events,
    private navCtrl: NavController,
    private storage: Storage) {
      this.events.subscribe('notifications', () => {
        this.refreshNotifications({limit: 12});
      });
  }

  ionViewWillEnter() {
    if(!this.notifications.length) {
      this.getNotifications({limit: 12});
    }
  }

  mark(notification) {
    notification.isUnread = !notification.isUnread;
    this.storage.get('authToken').then( token => {
      this.notificationService.update(notification, token).subscribe( () => {
        this.events.publish('update:notifications');
      });
    });
  }

  refreshNotifications(params, refresher?) {
    this.notifications = [];
    this.isRefreshed = true;
    this.storage.get('authToken').then ( token => {
      this.notificationService.getAll(params, token).subscribe( (notifs: any) => {
        this.isLoading = false;
        this.isRefreshed = false;
        this.notifications = notifs.data;
        this.onFetchSuccess(notifs);

        if(refresher) {
          refresher.complete();
        }
      })
    });
  }
  

  getNotifications(params) {
    this.isLoading = true;
    this.storage.get('authToken').then ( token => {
      this.notificationService.getAll(params, token).subscribe( (notifs: any) => {
        this.isLoading = false;
        this.notifications = this.notifications.concat(notifs.data || []);
        this.onFetchSuccess(notifs);
      })
    });
  }

  onFetchSuccess(data) {
    this.isLoading = false;
    if(!data.lastEvaluatedKey) {
      this.lastEvaluatedKey = data.lastEvaluatedKey;
      return;
    }
    this.lastEvaluatedKey = data.lastEvaluatedKey.ownerId;
    this.timestamp = data.lastEvaluatedKey.dateCreated;
  }

  visitNotification(notification) {
    notification.isUnread = false;
    this.storage.get('authToken').then( token => {
      this.notificationService.update(notification, token).subscribe( () => {
        this.events.publish('update:notifications');
      });

      if(notification.type == 'admin-registration-approved') {
        this.events.publish('change-page:settings');
      } else if(notification.type == 'driver-delivery-accepted' 
      || notification.type == 'driver-delivery-forPickup' 
      || notification.type == 'driver-delivery-forDropoff'
      || notification.type == 'driver-delivery-completed'
      || notification.type == 'driver-delivery-enRoute') {
        this.navCtrl.push('PackageItemPage', {
          deliveryId: notification.childId
        });
      }
    });
  }

}