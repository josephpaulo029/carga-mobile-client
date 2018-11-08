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
    constructor(public navParams: NavParams, 
        private storage: Storage,
        private deliveryService: DeliveryService) {
        this.deliveryId = this.navParams.get('deliveryId')
    }

    ionViewWillEnter() {
        this.getDelivery();
    }

    getDelivery() {
        this.storage.get('authToken').then( token => {
            this.deliveryService.getOne(this.deliveryId, token).subscribe( data => {
                this.package = data['data'];
            });
        });
    }

}