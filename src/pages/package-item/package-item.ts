import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { DeliveryService } from '../../providers/delivery.api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-package-item',
  templateUrl: 'package-item.html',
  providers: [DeliveryService]
})
export class PackageItemPage {
    
    deliveryId: any;
    package: any = {};
    isLoading: Boolean = false;
    constructor(public navParams: NavParams, 
        private storage: Storage,
        private deliveryService: DeliveryService) {
    }

    ionViewWillEnter() {
        this.deliveryId = this.navParams.get('deliveryId');
        console.log('this', this.deliveryId);
        this.getDelivery();
    }

    getDelivery() {
        this.isLoading = true;
        this.storage.get('authToken').then( token => {
            this.deliveryService.getOne(this.deliveryId, token).subscribe( data => {
                this.isLoading = false;
                this.package = data['data'];
            });
        });
    }

}