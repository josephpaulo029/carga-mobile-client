import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NotificationService } from '../../providers/notification.api'; 
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  notifications: any = [];
  
  constructor(private notificationService: NotificationService, private storage: Storage) {

  }

  ionViewWillEnter() {
    this.getNotifications();
  }

  getNotifications() {
    this.storage.get('authToken').then ( token => {
      this.notificationService.getAll(token).subscribe( data => {
        this.notifications = data['data'] || [];
      })
    });
  }

}