import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, Events, AlertController } from 'ionic-angular';
import { DeliveryService } from '../../providers/delivery.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-packages',
  templateUrl: 'packages.html',
  providers: [DeliveryService]
})
export class PackagesPage implements OnInit {

  filter: any = {};
  packages: any = [];
  isLoading: Boolean = false;

  constructor(private deliveryService: DeliveryService, 
    private navCtrl: NavController,
    private events: Events,
    private alertCtrl: AlertController,
    private storage: Storage) {

      this.events.subscribe('go-to-packages', () => {
        this.filter.deliveryStatus = 'pending';
        this.getPackages(this.filter);
      });
  }

  ngOnInit() {
    this.filter.deliveryStatus = 'pending';
    this.getPackages(this.filter);
  }

  ionViewWillEnter() {
    this.getWithoutLoading(this.filter);
  }

  cancelDelivery(delivery) {
    let alert = this.alertCtrl.create({
      title: 'Cancel delivery request',
      message: 'Are you sure to cancel this request?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.isLoading = true;
            this.storage.get('authToken').then( token => {
              this.deliveryService.delete(delivery.deliveryId, token).subscribe( () => {
                this.getPackages(this.filter);
              });
            })
          }
        }
      ]
    });
    alert.present();
  }
 
  getPackages(params) {
    this.isLoading = true;
    this.storage.get('authToken').then( token => {
      this.deliveryService.getAll(params, token).subscribe( data => {
        let packages = data['data'] || [];
        let sortedPackages = packages.sort( (a, b) => {
          return b.pickupDate - a.pickupDate;
        });
        this.packages = sortedPackages || [];

        this.isLoading = false;
      });
    })
  }

  getWithoutLoading(params, refresher?) {
    this.storage.get('authToken').then( token => {
      this.deliveryService.getAll(params, token).subscribe( data => {
        let sortedPackages = data['data'].sort( (a, b) => {
          return b.pickupDate - a.pickupDate;
        })
        this.packages = sortedPackages || [];

        if(refresher) {
          refresher.complete();
        }
      });
    })
  }

  visitPackage(delivery) {
    this.navCtrl.push('PackageItemPage', {
      deliveryId: delivery.deliveryId
    });
  }

}