import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
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
    private storage: Storage) {
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
        this.isLoading = false;
        this.packages = data['data'];
      });
    })
  }

  getWithoutLoading(params, refresher?) {
    this.storage.get('authToken').then( token => {
      this.deliveryService.getAll(params, token).subscribe( data => {
        this.packages = data['data'];

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