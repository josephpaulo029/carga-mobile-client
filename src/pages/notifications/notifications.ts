import { Component, OnInit } from '@angular/core';
import { IonicPage, Events, NavController } from 'ionic-angular';
import { NotificationService } from '../../providers/notification.api'; 
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage implements OnInit {

  notifications: any = [];
  isLoading: Boolean = false;
  
  constructor(private notificationService: NotificationService, 
    private events: Events,
    private navCtrl: NavController,
    private storage: Storage) {
      this.events.subscribe('notifications', () => {
        this.getNotifications();
      });
  }

  ngOnInit() {
    this.getNotifications();
  }

  ionViewWillEnter() {
    this.getWithoutLoading();
  }

  getNotifications() {
    this.isLoading = true;
    this.storage.get('authToken').then ( token => {
      this.notificationService.getAll(token).subscribe( data => {
        this.isLoading = false;
        this.notifications = data['data'] || [];
      })
    });
  }

  getWithoutLoading(refresher?) {
    this.storage.get('authToken').then ( token => {
      this.notificationService.getAll(token).subscribe( data => {
        this.notifications = data['data'] || [];

        if(refresher) {
          refresher.complete();
        }
      })
    });
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