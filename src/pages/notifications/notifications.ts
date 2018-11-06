import { Component } from '@angular/core';
import { IonicPage, Events } from 'ionic-angular';
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
  
  constructor(private notificationService: NotificationService, 
    private events: Events,
    private storage: Storage) {
      this.events.subscribe('notifications', () => {
        this.getNotifications();
      });
  }

  ionViewWillEnter() {
    this.getNotifications();
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

}