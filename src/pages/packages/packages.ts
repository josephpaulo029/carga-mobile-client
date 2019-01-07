import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, Events } from 'ionic-angular';
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
 
  getPackages(params) {
    this.isLoading = true;
    this.storage.get('authToken').then( token => {
      this.deliveryService.getAll(params, token).subscribe( data => {
        let sortedPackages = data['data'].sort( (a, b) => {
          return b.pickupDate - a.pickupDate;
        })
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